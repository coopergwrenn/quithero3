/**
 * NRT Medication Tracking Service
 * Dosing schedules, reminders, and adherence tracking
 */

import { supabase } from '@/src/lib/supabase';
import { notifications } from './notifications';
import { analytics } from './analytics';

export interface NRTMedication {
  id: string;
  userId: string;
  medicationType: 'patch' | 'gum' | 'lozenge' | 'inhaler' | 'nasal-spray';
  dosage: string;
  schedule: NRTSchedule;
  startDate: Date;
  endDate?: Date;
  active: boolean;
  createdAt: Date;
}

export interface NRTSchedule {
  frequency: 'once-daily' | 'twice-daily' | 'as-needed' | 'hourly';
  times?: string[]; // ['08:00', '20:00'] for twice daily
  maxDaily?: number; // for as-needed medications
  instructions?: string;
}

export interface NRTDose {
  id: string;
  medicationId: string;
  scheduledTime: Date;
  takenTime?: Date;
  skipped: boolean;
  notes?: string;
  createdAt: Date;
}

export interface AdherenceStats {
  totalScheduled: number;
  totalTaken: number;
  totalSkipped: number;
  adherenceRate: number;
  streakDays: number;
  lastDose?: Date;
}

class NRTTrackingService {
  async addMedication(medication: Omit<NRTMedication, 'id' | 'userId' | 'createdAt'>): Promise<NRTMedication> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('nrt_medications')
      .insert([{
        user_id: user.id,
        medication_type: medication.medicationType,
        dosage: medication.dosage,
        schedule: medication.schedule,
        start_date: medication.startDate.toISOString().split('T')[0],
        end_date: medication.endDate?.toISOString().split('T')[0],
        active: medication.active,
      }])
      .select()
      .single();

    if (error) throw error;

    const nrtMedication = this.mapToNRTMedication(data);
    
    // Schedule notifications for this medication
    await this.scheduleNotifications(nrtMedication);
    
    // Track medication addition
    analytics.track('nrt_medication_added', {
      medication_type: medication.medicationType,
      frequency: medication.schedule.frequency,
    });

    return nrtMedication;
  }

  async getUserMedications(): Promise<NRTMedication[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('nrt_medications')
      .select('*')
      .eq('user_id', user.id)
      .eq('active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching medications:', error);
      return [];
    }

    return data.map(this.mapToNRTMedication);
  }

  async recordDose(medicationId: string, taken: boolean, notes?: string): Promise<void> {
    const now = new Date();
    
    const { error } = await supabase
      .from('nrt_doses')
      .insert([{
        medication_id: medicationId,
        scheduled_time: now.toISOString(),
        taken_time: taken ? now.toISOString() : null,
        skipped: !taken,
        notes,
      }]);

    if (error) throw error;

    // Track dose adherence
    analytics.track('nrt_dose_recorded', {
      medication_id: medicationId,
      taken,
      has_notes: !!notes,
    });
  }

  async getAdherenceStats(medicationId: string, days: number = 30): Promise<AdherenceStats> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('nrt_doses')
      .select('*')
      .eq('medication_id', medicationId)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching adherence stats:', error);
      return {
        totalScheduled: 0,
        totalTaken: 0,
        totalSkipped: 0,
        adherenceRate: 0,
        streakDays: 0,
      };
    }

    const totalScheduled = data.length;
    const totalTaken = data.filter(dose => dose.taken_time).length;
    const totalSkipped = data.filter(dose => dose.skipped).length;
    const adherenceRate = totalScheduled > 0 ? totalTaken / totalScheduled : 0;

    // Calculate current streak
    let streakDays = 0;
    const sortedDoses = data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    for (const dose of sortedDoses) {
      if (dose.taken_time) {
        streakDays++;
      } else {
        break;
      }
    }

    const lastDose = data.length > 0 ? new Date(data[0].taken_time || data[0].created_at) : undefined;

    return {
      totalScheduled,
      totalTaken,
      totalSkipped,
      adherenceRate,
      streakDays,
      lastDose,
    };
  }

  async scheduleNotifications(medication: NRTMedication): Promise<void> {
    const { schedule } = medication;
    
    if (schedule.frequency === 'once-daily' && schedule.times?.[0]) {
      await notifications.scheduleNotification({
        id: `nrt_${medication.id}_daily`,
        type: 'nrt_reminder',
        title: 'NRT Reminder 💊',
        body: `Time for your ${medication.medicationType} (${medication.dosage})`,
        data: {
          medication_id: medication.id,
          deepLink: 'quithero://nrt/tracker',
        },
        trigger: {
          hour: parseInt(schedule.times[0].split(':')[0]),
          minute: parseInt(schedule.times[0].split(':')[1]),
          repeats: true,
        },
      });
    } else if (schedule.frequency === 'twice-daily' && schedule.times) {
      for (let i = 0; i < schedule.times.length; i++) {
        const time = schedule.times[i];
        await notifications.scheduleNotification({
          id: `nrt_${medication.id}_${i}`,
          type: 'nrt_reminder',
          title: 'NRT Reminder 💊',
          body: `Time for your ${medication.medicationType} (${medication.dosage})`,
          data: {
            medication_id: medication.id,
            deepLink: 'quithero://nrt/tracker',
          },
          trigger: {
            hour: parseInt(time.split(':')[0]),
            minute: parseInt(time.split(':')[1]),
            repeats: true,
          },
        });
      }
    }
  }

  async deactivateMedication(medicationId: string): Promise<void> {
    const { error } = await supabase
      .from('nrt_medications')
      .update({ active: false })
      .eq('id', medicationId);

    if (error) throw error;

    // Cancel related notifications
    await notifications.cancelNotification(`nrt_${medicationId}_daily`);
    await notifications.cancelNotification(`nrt_${medicationId}_0`);
    await notifications.cancelNotification(`nrt_${medicationId}_1`);

    analytics.track('nrt_medication_deactivated', {
      medication_id: medicationId,
    });
  }

  private mapToNRTMedication(data: any): NRTMedication {
    return {
      id: data.id,
      userId: data.user_id,
      medicationType: data.medication_type,
      dosage: data.dosage,
      schedule: data.schedule,
      startDate: new Date(data.start_date),
      endDate: data.end_date ? new Date(data.end_date) : undefined,
      active: data.active,
      createdAt: new Date(data.created_at),
    };
  }
}

export const nrtTracking = new NRTTrackingService();