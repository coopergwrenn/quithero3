import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Theme } from '@/src/design-system/theme';
import { Card, Button, Badge } from '@/src/design-system/components';
import { useQuitStore } from '@/src/stores/quitStore';
import { useToolStore } from '@/src/stores/toolStore';
import { profileService } from '@/src/services/profileService';
import { analytics } from '@/src/services/analytics';

// Health milestones based on medical research
const HEALTH_MILESTONES = [
  {
    time: 20, // minutes
    unit: 'minutes',
    title: 'Heart Rate Normalizes',
    description: 'Your heart rate and blood pressure start to return to normal levels',
    icon: '❤️',
    category: 'immediate'
  },
  {
    time: 12, // hours
    unit: 'hours', 
    title: 'Carbon Monoxide Clears',
    description: 'Carbon monoxide levels in your blood return to normal',
    icon: '🫁',
    category: 'immediate'
  },
  {
    time: 1, // days
    unit: 'days',
    title: 'Nicotine Eliminated', 
    description: 'Most nicotine is eliminated from your body',
    icon: '✨',
    category: 'short'
  },
  {
    time: 3, // days
    unit: 'days',
    title: 'Taste & Smell Improve',
    description: 'Your senses of taste and smell begin to improve',
    icon: '👃',
    category: 'short'
  },
  {
    time: 14, // days
    unit: 'days',
    title: 'Circulation Improves',
    description: 'Blood circulation improves and lung function increases',
    icon: '🩸',
    category: 'short'
  },
  {
    time: 30, // days
    unit: 'days',
    title: 'Breathing Easier',
    description: 'Coughing and shortness of breath decrease significantly',
    icon: '💨',
    category: 'medium'
  },
  {
    time: 90, // days
    unit: 'days',
    title: 'Major Lung Recovery',
    description: 'Lung function increases by up to 30%',
    icon: '🫁',
    category: 'medium'
  },
  {
    time: 180, // days
    unit: 'days',
    title: 'Respiratory Health',
    description: 'Coughing, sinus congestion, and fatigue decrease',
    icon: '🌟',
    category: 'medium'
  },
  {
    time: 365, // days
    unit: 'days',
    title: 'Heart Disease Risk Halved',
    description: 'Your risk of heart disease is cut in half',
    icon: '💪',
    category: 'long'
  },
  {
    time: 1825, // 5 years
    unit: 'days',
    title: 'Stroke Risk Normalized',
    description: 'Stroke risk reduced to that of a non-smoker',
    icon: '🧠',
    category: 'long'
  }
];

const TOOL_ICONS = {
  'panic': '🚨',
  'urge-timer': '⏰', 
  'breathwork': '🫁',
  'daily-pledge': '🤝'
};

const TOOL_NAMES = {
  'panic': 'Panic Mode',
  'urge-timer': 'Urge Timer',
  'breathwork': 'Breathwork',
  'daily-pledge': 'Daily Pledge'
};

export default function DashboardScreen() {
  const router = useRouter();
  const { quitData, updateQuitData } = useQuitStore();
  const { getToolStats } = useToolStore();
  
  // User state
  const [userName, setUserName] = useState('');
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const [celebrationAnimation] = useState(new Animated.Value(1));
  
  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [showDayModal, setShowDayModal] = useState(false);
  const [dayNotes, setDayNotes] = useState<{[key: string]: string}>({});
  const [tempNote, setTempNote] = useState('');
  
  // For demo purposes, if no quit data exists, use mock data
  const mockQuitDate = new Date();
  mockQuitDate.setDate(mockQuitDate.getDate() - 7); // 7 days ago
  
  const effectiveQuitData = {
    quitDate: quitData.quitDate || mockQuitDate,
    usageAmount: quitData.usageAmount || 20,
    substanceType: quitData.substanceType || 'cigarettes',
    ...quitData
  };
  
  // Fetch user's display name
  useEffect(() => {
    const fetchUserName = async () => {
      const displayName = await profileService.getUserDisplayName();
      setUserName(displayName);
    };
    
    fetchUserName();
  }, []);

  // Update time every minute for real-time calculations
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute
    
    analytics.track('dashboard_viewed');
    
    return () => clearInterval(interval);
  }, []);

  // Calculate days since quit
  const calculateDaysSinceQuit = (): number => {
    if (!effectiveQuitData.quitDate) return 0;
    const quitDate = new Date(effectiveQuitData.quitDate);
    const diffTime = currentTime.getTime() - quitDate.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  // Calculate money saved
  const calculateMoneySaved = (): number => {
    const daysSinceQuit = calculateDaysSinceQuit();
    if (daysSinceQuit <= 0) return 0;

    const usageAmount = effectiveQuitData.usageAmount || 20; // Default to 20 cigarettes
    const substanceType = effectiveQuitData.substanceType || 'cigarettes';
    
    let dailyCost = 0;
    if (substanceType === 'cigarettes') {
      // Cigarettes: $8 per pack (20 cigarettes)
      dailyCost = (usageAmount / 20) * 8;
    } else {
      // Vaping: $15 per pod/day for heavy users
      dailyCost = (usageAmount / 200) * 15; // Assuming 200 puffs per pod
    }
    
    return daysSinceQuit * dailyCost;
  };

  // Calculate substances avoided
  const calculateSubstancesAvoided = (): number => {
    const daysSinceQuit = calculateDaysSinceQuit();
    if (daysSinceQuit <= 0) return 0;
    
    const usageAmount = effectiveQuitData.usageAmount || 20;
    return daysSinceQuit * usageAmount;
  };

  // Calculate time since quit in different units
  const calculateTimeSinceQuit = () => {
    if (!effectiveQuitData.quitDate) return { days: 0, hours: 0, minutes: 0 };
    
    const quitDate = new Date(effectiveQuitData.quitDate);
    const diffTime = currentTime.getTime() - quitDate.getTime();
    
    const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
    
    return { days, hours, minutes };
  };
      
  // Check which health milestones are achieved
  const calculateMilestoneStatus = () => {
    const timeSinceQuit = calculateTimeSinceQuit();
    const totalMinutes = (timeSinceQuit.days * 24 * 60) + (timeSinceQuit.hours * 60) + timeSinceQuit.minutes;
    const totalHours = totalMinutes / 60;
    const totalDays = timeSinceQuit.days;

    return HEALTH_MILESTONES.map(milestone => {
      let isAchieved = false;
      let progress = 0;

      if (milestone.unit === 'minutes') {
        isAchieved = totalMinutes >= milestone.time;
        progress = Math.min(100, (totalMinutes / milestone.time) * 100);
      } else if (milestone.unit === 'hours') {
        isAchieved = totalHours >= milestone.time;
        progress = Math.min(100, (totalHours / milestone.time) * 100);
      } else if (milestone.unit === 'days') {
        isAchieved = totalDays >= milestone.time;
        progress = Math.min(100, (totalDays / milestone.time) * 100);
      }

      return {
        ...milestone,
        isAchieved,
        progress: Math.round(progress)
      };
    });
  };

  // Get tool usage statistics
  const getToolUsageStats = () => {
    const tools = ['panic', 'urge-timer', 'breathwork', 'daily-pledge'];
    
    const toolStats = tools.map(toolId => {
      const stats = getToolStats(toolId);
      return {
        id: toolId,
        name: TOOL_NAMES[toolId as keyof typeof TOOL_NAMES],
        icon: TOOL_ICONS[toolId as keyof typeof TOOL_ICONS],
        uses: stats?.totalUses || 0,
        lastUsed: stats?.lastUsed || null
      };
    });

    const totalUses = toolStats.reduce((sum, tool) => sum + tool.uses, 0);
    const mostUsedTool = toolStats.reduce((max, tool) => 
      tool.uses > max.uses ? tool : max, toolStats[0]);

    return { toolStats, totalUses, mostUsedTool };
  };

  // Get motivational message based on progress
  const getMotivationalMessage = () => {
    const daysSinceQuit = calculateDaysSinceQuit();
    const milestones = calculateMilestoneStatus();
    const recentAchievements = milestones.filter(m => m.isAchieved).slice(-2);

    if (daysSinceQuit === 0) {
      return "Welcome to your quit journey! Every moment smoke-free is a victory. 🌟";
    } else if (daysSinceQuit === 1) {
      return "One full day smoke-free! Your body is already starting to heal. 💪";
    } else if (daysSinceQuit < 7) {
      return `${daysSinceQuit} days strong! You're building incredible momentum. 🔥`;
    } else if (daysSinceQuit < 30) {
      return `${daysSinceQuit} days of freedom! You're proving how strong you really are. ⭐`;
    } else if (daysSinceQuit < 90) {
      return `Over ${daysSinceQuit} days! You've broken the habit and built a new lifestyle. 🏆`;
    } else {
      return `${daysSinceQuit} days of transformation! You're not just smoke-free, you're free. 👑`;
    }
  };

  // Get next milestone to achieve
  const getNextMilestone = () => {
    const milestones = calculateMilestoneStatus();
    return milestones.find(m => !m.isAchieved);
  };

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format large numbers
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  // Navigate to tool
  const navigateToTool = (toolId: string) => {
    analytics.track('tool_accessed_from_dashboard', { tool: toolId });
    router.push(`/(app)/tools/${toolId}` as any);
  };

  // Calendar functions
  const calculateDayScore = (date: Date): number => {
    const dateStr = date.toISOString().split('T')[0];
    const quitDate = new Date(effectiveQuitData.quitDate);
    const isQuitDay = date >= quitDate;
    
    if (!isQuitDay) return 0;
    
    // Mock activity data - in real app this would come from actual usage
    const mockActivities = {
      pledgeCompleted: Math.random() > 0.3 ? 1 : 0,
      panicModeUses: Math.floor(Math.random() * 3),
      urgeTimerCompletes: Math.floor(Math.random() * 2),
      breathworkSessions: Math.floor(Math.random() * 2),
      communityInteractions: Math.floor(Math.random() * 5),
    };
    
    const dayActivities = {
      pledgeCompleted: mockActivities.pledgeCompleted * 25,
      panicModeUses: mockActivities.panicModeUses * 20,
      urgeTimerCompletes: mockActivities.urgeTimerCompletes * 15,
      breathworkSessions: mockActivities.breathworkSessions * 10,
      communityInteractions: mockActivities.communityInteractions * 5,
      baseQuitDay: 10
    };
    
    return Math.min(100, Object.values(dayActivities).reduce((a, b) => a + b, 0));
  };

  const getCalendarCellColor = (score: number): string => {
    if (score === 0) return '#374151'; // Gray for non-quit days
    const intensity = score / 100;
    return `rgba(139, 92, 246, ${0.3 + (intensity * 0.7)})`; // Purple gradient
  };

  const getDaysInMonth = (date: Date): Date[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    const days: Date[] = [];
    
    // Add previous month's trailing days
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    // Generate 42 days (6 weeks)
    for (let i = 0; i < 42; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentMonth(newMonth);
  };

  const openDayModal = (day: Date) => {
    setSelectedDay(day);
    const dayKey = day.toISOString().split('T')[0];
    setTempNote(dayNotes[dayKey] || '');
    setShowDayModal(true);
  };

  const saveDayNote = () => {
    if (selectedDay) {
      const dayKey = selectedDay.toISOString().split('T')[0];
      setDayNotes(prev => ({
        ...prev,
        [dayKey]: tempNote
      }));
    }
    setShowDayModal(false);
  };

  const getDayActivities = (day: Date) => {
    // Mock activities for selected day - in real app this would come from actual data
    return [
      { type: 'Daily Pledge', icon: '🤝', time: '09:00 AM', points: 25 },
      { type: 'Breathwork', icon: '🫁', time: '02:30 PM', points: 10 },
      { type: 'Urge Timer', icon: '⏰', time: '06:15 PM', points: 15 },
    ];
  };

  const daysSinceQuit = calculateDaysSinceQuit();
  const moneySaved = calculateMoneySaved();
  const substancesAvoided = calculateSubstancesAvoided();
  const milestoneStatus = calculateMilestoneStatus();
  const achievedMilestones = milestoneStatus.filter(m => m.isAchieved);
  const nextMilestone = getNextMilestone();
  const { toolStats, totalUses, mostUsedTool } = getToolUsageStats();
  const substanceType = effectiveQuitData.substanceType || 'cigarettes';


  if (!quitData.quitDate && Object.keys(quitData).length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataTitle}>Welcome to Your Quit Journey!</Text>
          <Text style={styles.noDataText}>
            Complete your onboarding to start tracking your amazing progress.
          </Text>
          <View style={styles.buttonContainer}>
            <Button onPress={() => router.push('/(onboarding)')} style={styles.primaryButton}>
              Get Started
            </Button>
            <Button 
              variant="ghost" 
              onPress={() => {
                // Use mock data to show dashboard
                const mockQuitDate = new Date();
                mockQuitDate.setDate(mockQuitDate.getDate() - 7);
                updateQuitData({
                  quitDate: mockQuitDate,
                  substanceType: 'cigarettes',
                  usageAmount: 20,
                  primaryMotivation: 'health'
                });
              }}
              style={styles.secondaryButton}
            >
              Skip for now
            </Button>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          
          {/* Hero Stats Section */}
          <View style={styles.heroSection}>
            <View style={styles.heroHeader}>
              <Text style={styles.welcomeText}>
                Welcome back{userName ? ` ${userName}` : ''}
              </Text>
              <Text style={styles.heroSubtext}>You're absolutely crushing it</Text>
            </View>
            
            {/* Unified Stats Card */}
            <View style={styles.unifiedStatsCard}>
              {/* Header Section */}
              <View style={styles.statsHeader}>
                <Animated.View style={[styles.mainStatsSection, { transform: [{ scale: celebrationAnimation }] }]}>
                  <Text style={styles.mainDaysNumber}>{daysSinceQuit}</Text>
                  <Text style={styles.daysCleanLabel}>DAYS CLEAN</Text>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusBadgeText}>Elite Status</Text>
                  </View>
                </Animated.View>
              </View>
              
              {/* Metrics Section */}
              <View style={styles.metricsSection}>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.scrollableStatsContainer}
                  style={styles.scrollableStatsView}
                  decelerationRate="normal"
                  pagingEnabled={false}
                  bounces={true}
                  scrollEventThrottle={16}
                  removeClippedSubviews={false}
                >
                  <View style={styles.metricItem}>
                    <View style={[styles.metricRing, { borderColor: '#22C55E' }]}>
                      <Text style={styles.metricValue}>{formatCurrency(moneySaved)}</Text>
                    </View>
                    <Text style={styles.metricLabel}>SAVED</Text>
                  </View>
                  
                  <View style={styles.metricItem}>
                    <View style={[styles.metricRing, { borderColor: '#EF4444' }]}>
                      <Text style={styles.metricValue}>{formatNumber(substancesAvoided)}</Text>
                    </View>
                    <Text style={styles.metricLabel}>AVOIDED</Text>
                  </View>
                  
                  <View style={styles.metricItem}>
                    <View style={[styles.metricRing, { borderColor: '#3B82F6' }]}>
                      <Text style={styles.metricValue}>{Math.floor(daysSinceQuit * 24)}</Text>
                    </View>
                    <Text style={styles.metricLabel}>HOURS</Text>
                  </View>
                  
                  <View style={styles.metricItem}>
                    <View style={[styles.metricRing, { borderColor: '#F59E0B' }]}>
                      <Text style={styles.metricValue}>{achievedMilestones.length}</Text>
                    </View>
                    <Text style={styles.metricLabel}>MILESTONES</Text>
                  </View>
                  
                  <View style={styles.metricItem}>
                    <View style={[styles.metricRing, { borderColor: '#8B5CF6' }]}>
                      <Text style={styles.metricValue}>{totalUses}</Text>
                    </View>
                    <Text style={styles.metricLabel}>TOOLS</Text>
                  </View>
                </ScrollView>
              </View>
            </View>
          </View>

          {/* Clean Quit Calendar - Fresh Rebuild */}
          <View style={styles.cleanCalendarCard}>
            {/* Simple Header */}
            <View style={styles.cleanCalendarHeader}>
              <Text style={styles.cleanCalendarTitle}>Quit Calendar</Text>
              <View style={styles.cleanMonthNav}>
                <TouchableOpacity onPress={() => navigateMonth('prev')} style={styles.cleanNavButton}>
                  <Text style={styles.cleanNavText}>‹</Text>
                </TouchableOpacity>
                <Text style={styles.cleanMonthText}>
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </Text>
                <TouchableOpacity onPress={() => navigateMonth('next')} style={styles.cleanNavButton}>
                  <Text style={styles.cleanNavText}>›</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Day Headers */}
            <View style={styles.cleanDayHeaders}>
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                <Text key={index} style={styles.cleanDayHeader}>{day}</Text>
              ))}
            </View>
            
            {/* Calendar Grid - NO ACTIVITY LEVEL! */}
            <View style={styles.cleanCalendarGrid}>
              {getDaysInMonth(currentMonth).map((day, index) => {
                const score = calculateDayScore(day);
                const isToday = day.toDateString() === new Date().toDateString();
                const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
                
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.cleanDayCell,
                      {
                        backgroundColor: getCalendarCellColor(score),
                        opacity: isCurrentMonth ? 1 : 0.3,
                        borderWidth: isToday ? 2 : 0,
                        borderColor: isToday ? '#8B5CF6' : 'transparent',
                      }
                    ]}
                    onPress={() => openDayModal(day)}
                  >
                    <Text style={[
                      styles.cleanDayText,
                      { color: isCurrentMonth ? '#FFFFFF' : '#666666' }
                    ]}>
                      {day.getDate()}
                    </Text>
                    {score > 70 && <Text style={styles.cleanScoreIndicator}>✨</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Motivational Message */}
          <Card style={styles.motivationCard}>
            <Text style={styles.motivationText}>{getMotivationalMessage()}</Text>
          </Card>

          {/* Health Recovery Progress */}
          <Card style={styles.healthSection}>
            <Text style={styles.sectionTitle}>🫁 Health Recovery Timeline</Text>
            <Text style={styles.sectionSubtitle}>
              Your body is healing! {achievedMilestones.length} of {milestoneStatus.length} milestones achieved.
            </Text>
            
            <View style={styles.milestonesContainer}>
              {milestoneStatus.slice(0, 6).map((milestone, index) => (
                <View key={index} style={styles.milestoneItem}>
                  <View style={[
                    styles.milestoneIcon,
                    milestone.isAchieved && styles.milestoneIconAchieved
                  ]}>
                    <Text style={styles.milestoneEmoji}>
                      {milestone.isAchieved ? '✅' : milestone.icon}
                    </Text>
                  </View>
                  <View style={styles.milestoneContent}>
                    <Text style={[
                      styles.milestoneTitle,
                      milestone.isAchieved && styles.milestoneTitleAchieved
                    ]}>
                      {milestone.title}
                    </Text>
                    <Text style={styles.milestoneDescription}>
                      {milestone.description}
                    </Text>
                    {!milestone.isAchieved && (
                      <View style={styles.progressContainer}>
                        <View style={styles.progressBar}>
                          <View style={[
                            styles.progressFill,
                            { width: `${milestone.progress}%` }
                          ]} />
                        </View>
                        <Text style={styles.progressText}>{milestone.progress}%</Text>
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </View>

            {nextMilestone && (
              <View style={styles.nextMilestoneCard}>
                <Text style={styles.nextMilestoneTitle}>Next Milestone</Text>
                <Text style={styles.nextMilestoneText}>
                  {nextMilestone.title} in {nextMilestone.time - daysSinceQuit} days
                </Text>
              </View>
            )}
          </Card>

          {/* Tool Usage Summary */}
          <Card style={styles.toolsSection}>
            <Text style={styles.sectionTitle}>🛠️ Your Tools</Text>
            <Text style={styles.sectionSubtitle}>
              {totalUses} total uses • Most used: {mostUsedTool.name} {mostUsedTool.icon}
            </Text>
            
            <View style={styles.toolsGrid}>
              {toolStats.map((tool) => (
                <TouchableOpacity
                  key={tool.id}
                  style={styles.toolCard}
                  onPress={() => navigateToTool(tool.id)}
                >
                  <Text style={styles.toolIcon}>{tool.icon}</Text>
                  <Text style={styles.toolName}>{tool.name}</Text>
                  <Text style={styles.toolUses}>{tool.uses} uses</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          {/* AI Coach Support */}
          <Card style={styles.supportCard}>
            <Text style={styles.supportTitle}>🤖 Need Support?</Text>
            <Text style={styles.supportDescription}>
              Talk to your AI quit coach for personalized guidance and 24/7 support
            </Text>
            <View style={styles.supportButtons}>
              <TouchableOpacity 
                style={styles.coachButton}
                onPress={() => {
                  analytics.track('dashboard_coach_clicked');
                  router.push('/(app)/(tabs)/coach');
                }}
              >
                <Text style={styles.coachButtonText}>💬 Chat with AI Coach</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.crisisButton}
                onPress={() => {
                  analytics.track('dashboard_crisis_clicked');
                  router.push('/(app)/tools/panic' as any);
                }}
              >
                <Text style={styles.crisisButtonText}>🚨 Crisis Support</Text>
              </TouchableOpacity>
            </View>
          </Card>

          {/* Health Facts */}
          <Card style={styles.healthFactCard}>
            <Text style={styles.healthFactTitle}>💡 Did You Know?</Text>
            <Text style={styles.healthFactText}>
              {daysSinceQuit < 1 ? 
                "Within 20 minutes of quitting, your heart rate and blood pressure drop." :
                daysSinceQuit < 7 ?
                "After just 2 weeks, your circulation improves and lung function increases." :
                daysSinceQuit < 30 ?
                "At 1 month, coughing and shortness of breath decrease significantly." :
                "After 1 year smoke-free, your risk of heart disease is cut in half!"
              }
            </Text>
          </Card>
        </View>
      </ScrollView>

      {/* Day Detail Modal */}
      <Modal
        visible={showDayModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDayModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowDayModal(false)}>
              <Text style={styles.modalCloseButton}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {selectedDay?.toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Text>
            <View style={styles.modalSpacer} />
          </View>

          <ScrollView style={styles.modalContent}>
            {selectedDay && (
              <>
                <Card style={styles.dayScoreCard}>
                  <Text style={styles.dayScoreTitle}>Activity Score</Text>
                  <Text style={styles.dayScoreValue}>
                    {calculateDayScore(selectedDay)}/100
                  </Text>
                  <Text style={styles.dayScoreDesc}>
                    {calculateDayScore(selectedDay) > 70 ? 'Excellent day! 🌟' :
                     calculateDayScore(selectedDay) > 40 ? 'Good progress! 👍' :
                     calculateDayScore(selectedDay) > 0 ? 'Keep going! 💪' :
                     'No quit activities'}
                  </Text>
                </Card>

                <Card style={styles.activitiesCard}>
                  <Text style={styles.activitiesTitle}>Today's Activities</Text>
                  {getDayActivities(selectedDay).map((activity, index) => (
                    <View key={index} style={styles.activityItem}>
                      <Text style={styles.activityIcon}>{activity.icon}</Text>
                      <View style={styles.activityInfo}>
                        <Text style={styles.activityType}>{activity.type}</Text>
                        <Text style={styles.activityTime}>{activity.time}</Text>
                      </View>
                      <Text style={styles.activityPoints}>+{activity.points} pts</Text>
                    </View>
                  ))}
                </Card>

                <Card style={styles.notesCard}>
                  <Text style={styles.notesTitle}>Daily Reflection</Text>
                  <TextInput
                    style={styles.notesInput}
                    multiline
                    numberOfLines={4}
                    placeholder="How are you feeling today? Any reflections on your quit journey..."
                    placeholderTextColor={Theme.colors.text.tertiary}
                    value={tempNote}
                    onChangeText={setTempNote}
                  />
                  <TouchableOpacity style={styles.saveButton} onPress={saveDayNote}>
                    <Text style={styles.saveButtonText}>Save Note</Text>
                  </TouchableOpacity>
                </Card>
              </>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A', // Dark gray, slightly lighter than the card (#0F0F0F)
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingTop: 90, // Push welcome message down even more
    paddingBottom: 0, // Remove all bottom padding to eliminate spacing issues
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  noDataTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: 16,
  },
  noDataText: {
    fontSize: 16,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  buttonContainer: {
    width: '100%',
    gap: Theme.spacing.md,
  },
  primaryButton: {
    width: '100%',
  },
  secondaryButton: {
    width: '100%',
  },
  
  // New design styles
  
  // Activity Card
  activityCard: {
    marginBottom: Theme.spacing.lg,
    padding: Theme.spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  cardTitle: {
    ...Theme.typography.headline,
    color: Theme.colors.text.primary,
    fontWeight: '600',
  },
  cardAction: {
    backgroundColor: Theme.colors.dark.surfaceElevated,
    borderRadius: Theme.borderRadius.sm,
    padding: Theme.spacing.xs,
    minWidth: 32,
    minHeight: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardActionIcon: {
    ...Theme.typography.headline,
    color: Theme.colors.text.secondary,
  },
  
  // Calendar
  calendar: {
    gap: Theme.spacing.md,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: Theme.spacing.sm,
  },
  calendarDayHeader: {
    ...Theme.typography.footnote,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
    width: 32,
  },
  calendarDays: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.sm,
  },
  calendarDay: {
    width: 36,
    height: 36,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarDayActive: {
    backgroundColor: Theme.colors.teal[500],
  },
  calendarDayText: {
    ...Theme.typography.footnote,
    color: Theme.colors.text.secondary,
    fontWeight: '500',
  },
  calendarDayTextActive: {
    color: Theme.colors.text.primary,
    fontWeight: '600',
  },
  
  // Coach Card
  coachCard: {
    marginBottom: Theme.spacing.lg,
    padding: Theme.spacing.lg,
  },
  coachHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  coachAvatar: {
    width: 48,
    height: 48,
    borderRadius: Theme.borderRadius.lg,
    backgroundColor: Theme.colors.dark.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Theme.spacing.md,
    position: 'relative',
  },
  coachAvatarIcon: {
    fontSize: 24,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Theme.colors.teal[500],
    borderWidth: 2,
    borderColor: Theme.colors.dark.surface,
  },
  coachInfo: {
    flex: 1,
  },
  coachName: {
    ...Theme.typography.headline,
    color: Theme.colors.text.primary,
    fontWeight: '600',
    marginBottom: 2,
  },
  coachStatus: {
    ...Theme.typography.footnote,
    color: Theme.colors.text.secondary,
  },
  coachMessage: {
    ...Theme.typography.body,
    color: Theme.colors.text.secondary,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  
  // Action Grid
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.md,
    marginBottom: Theme.spacing.lg,
  },
  actionCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Theme.colors.dark.surface,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.dark.borderSubtle,
    minHeight: 100,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: Theme.spacing.sm,
  },
  actionLabel: {
    ...Theme.typography.callout,
    color: Theme.colors.text.primary,
    fontWeight: '500',
    textAlign: 'center',
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  heroHeader: {
    alignItems: 'center',
    marginBottom: 16, // Reduced from 24 to close the gap
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF', // White text for dark background
    textAlign: 'center',
    marginBottom: 4,
  },
  heroSubtext: {
    fontSize: 16,
    color: '#CCCCCC', // Light gray for dark background
    textAlign: 'center',
    opacity: 0.8,
  },
  dayCounter: {
    alignItems: 'center',
    marginBottom: 32,
    padding: 24,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    minWidth: 280,
  },
  dayNumberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  numberBackground: {
    backgroundColor: Theme.colors.teal[500],
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayNumber: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    fontFamily: 'System',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  dayLabel: {
    fontSize: 18,
    color: Theme.colors.text.primary,
    fontWeight: '600',
    marginBottom: 8,
  },
  heroMotivation: {
    fontSize: 14,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
    maxWidth: 250,
    lineHeight: 20,
  },
  streakEmoji: {
    fontSize: 20,
    marginLeft: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
  },
  // Unified Stats Card - Back to original beautiful design
  unifiedStatsCard: {
    backgroundColor: '#0F0F0F', // Even deeper, more premium background
    borderRadius: 24, // Larger radius for modern feel
    marginTop: 20, // Reduced from 32 to close the gap
    marginBottom: 8,
    width: '100%',
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: '#333333', // Very subtle border
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
  statsHeader: {
    paddingTop: 40,
    paddingBottom: 32,
    paddingHorizontal: 40,
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: '#1A1A1A',
    backgroundColor: 'rgba(255, 255, 255, 0.02)', // Subtle glass effect
  },
  mainStatsSection: {
    alignItems: 'center',
  },
  mainDaysNumber: {
    fontSize: 96, // Bigger and more impactful
    fontWeight: '400', // Medium weight for better visibility and impact
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -4,
    textShadowColor: 'rgba(135, 206, 235, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  daysCleanLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666666',
    letterSpacing: 2.5,
    textAlign: 'center',
    marginBottom: 20,
    textTransform: 'uppercase',
    opacity: 0.8,
  },
  statusBadge: {
    backgroundColor: 'rgba(236, 72, 153, 0.1)',
    borderWidth: 1,
    borderColor: '#EC4899',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginTop: 12,
    alignSelf: 'center',
    shadowColor: '#EC4899',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  statusBadgeText: {
    color: '#EC4899',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  metricsSection: {
    paddingTop: 32,
    paddingBottom: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.01)', // Subtle background separation
  },
  scrollableStatsView: {
    width: '100%',
    height: 140,
  },
  scrollableStatsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 40,
    paddingRight: 120,
    gap: 40, // Even more generous spacing for premium feel
    alignItems: 'center',
    minWidth: '160%',
  },
  circularStat: {
    alignItems: 'center',
    width: 100, // Smaller width to fit better
    justifyContent: 'center',
  },
  circularProgress: {
    width: 95, // Even bigger circles
    height: 95,
    borderRadius: 47.5,
    borderWidth: 5,
    borderColor: '#87CEEB', // Light blue progress ring
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  circularStatValue: {
    fontSize: 13, // Smaller font size
    fontWeight: '700',
    color: Theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: 2,
  },
  circularStatLabel: {
    fontSize: 9, // Smaller label text
    fontWeight: '600',
    color: Theme.colors.text.secondary,
    textAlign: 'center',
    letterSpacing: 0.3,
    lineHeight: 11,
  },
  // Premium metric styles
  metricItem: {
    alignItems: 'center',
    width: 100,
    justifyContent: 'center',
  },
  metricRing: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 2.5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '300', // Ultra-light for elegance
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: '#777777',
    textAlign: 'center',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    opacity: 0.9,
  },

  statCard: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    backgroundColor: Theme.colors.dark.surfaceElevated,
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Theme.colors.text.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
  },
  motivationCard: {
    padding: 24,
    marginTop: 0, // No top margin since calendar card has bottom margin
    marginBottom: 32, // Match the large card spacing
    backgroundColor: '#1E3A8A',
    borderColor: '#3B82F6',
    borderWidth: 1,
  },
  motivationText: {
    fontSize: 18,
    color: Theme.colors.text.primary,
    textAlign: 'center',
    lineHeight: 26,
    fontWeight: '500',
  },
  healthSection: {
    padding: 24,
    marginBottom: 32, // Match the large card spacing
    backgroundColor: '#1A1A1A',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Theme.colors.text.primary,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Theme.colors.text.secondary,
    marginBottom: 24,
  },
  milestonesContainer: {
    gap: 16,
  },
  milestoneItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  milestoneIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  milestoneIconAchieved: {
    backgroundColor: '#22C55E',
  },
  milestoneEmoji: {
    fontSize: 20,
  },
  milestoneContent: {
    flex: 1,
  },
  milestoneTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Theme.colors.text.secondary,
    marginBottom: 4,
  },
  milestoneTitleAchieved: {
    color: Theme.colors.text.primary,
  },
  milestoneDescription: {
    fontSize: 14,
    color: Theme.colors.text.tertiary,
    lineHeight: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#2A2A2A',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8B5CF6',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: Theme.colors.text.secondary,
    minWidth: 32,
  },
  nextMilestoneCard: {
    backgroundColor: '#4C1D95',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  nextMilestoneTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#B8A3FF',
    marginBottom: 4,
  },
  nextMilestoneText: {
    fontSize: 16,
    color: Theme.colors.text.primary,
  },
  toolsSection: {
    padding: 24,
    marginBottom: 32,
    backgroundColor: '#1A1A1A',
  },
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  toolCard: {
    width: '47%',
    backgroundColor: '#2A2A2A',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  toolIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  toolName: {
    fontSize: 14,
    fontWeight: '600',
    color: Theme.colors.text.primary,
    marginBottom: 4,
    textAlign: 'center',
  },
  toolUses: {
    fontSize: 12,
    color: Theme.colors.text.secondary,
  },
  supportCard: {
    padding: 24,
    marginBottom: 32,
    backgroundColor: '#2A1A4C',
    borderColor: '#8B5CF6',
    borderWidth: 1,
  },
  supportTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B5CF6',
    marginBottom: 8,
  },
  supportDescription: {
    fontSize: 14,
    color: Theme.colors.text.secondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  supportButtons: {
    gap: 12,
  },
  coachButton: {
    backgroundColor: '#8B5CF6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  coachButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Theme.colors.text.primary,
  },
  crisisButton: {
    backgroundColor: '#EF4444',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  crisisButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Theme.colors.text.primary,
  },
  healthFactCard: {
    padding: 24,
    marginBottom: 32,
    backgroundColor: '#0F2A1F',
    borderColor: '#22C55E',
    borderWidth: 1,
  },
  healthFactTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#22C55E',
    marginBottom: 12,
  },
  healthFactText: {
    fontSize: 16,
    color: Theme.colors.text.primary,
    lineHeight: 24,
  },
  
  // Clean Calendar Styles - Fresh Start, No Activity Level
  cleanCalendarCard: {
    backgroundColor: '#141414',
    borderRadius: 24,
    padding: 24,
    marginBottom: 32,
    width: '100%',
    borderWidth: 0.5,
    borderColor: '#333333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
    // FORCE EXACT HEIGHT - NO EXTRA SPACE ALLOWED!
    minHeight: 'auto',
    maxHeight: 400,
    alignSelf: 'stretch',
    flexShrink: 1,
  },
  cleanCalendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cleanCalendarTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cleanMonthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  cleanNavButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 12, // Add space from month text
  },
  cleanNavText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cleanMonthText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    minWidth: 160,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  cleanDayHeaders: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  cleanDayHeader: {
    flex: 1,
    textAlign: 'center',
    color: '#888888',
    fontSize: 13,
    fontWeight: '600',
    paddingVertical: 8,
  },
  cleanCalendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    // FORCE TIGHT LAYOUT - NO EXPANSION!
    flex: 0,
    minHeight: 'auto',
    alignSelf: 'stretch',
  },
  cleanDayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    margin: 2,
  },
  cleanDayText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  cleanScoreIndicator: {
    position: 'absolute',
    top: 2,
    right: 2,
    fontSize: 10,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 8,
    minHeight: 44,
  },
  calendarTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Theme.colors.text.primary,
    flex: 1,
    minWidth: 0,
    paddingRight: 16,
  },
  monthNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 0,
    justifyContent: 'flex-end',
    minWidth: 140,
  },
  monthButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthArrow: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Theme.colors.text.primary,
    textAlign: 'center',
  },
  monthText: {
    fontSize: 16,
    fontWeight: '600',
    color: Theme.colors.text.primary,
    minWidth: 90,
    textAlign: 'center',
    flex: 0,
  },
  calendarGrid: {
    marginBottom: 0, // Remove all margin to eliminate space
  },
  dayHeadersRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dayHeader: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: Theme.colors.text.secondary,
    textAlign: 'center',
    paddingVertical: 8,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 4,
    position: 'relative',
  },
  calendarDayNumber: {
    fontSize: 14,
    fontWeight: '500',
  },
  highScoreIndicator: {
    position: 'absolute',
    top: 2,
    right: 2,
    fontSize: 8,
  },
  calendarLegend: {
    marginTop: 8, // Minimal internal spacing within card
    paddingTop: 8, // Minimal internal padding within card
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Theme.colors.text.primary,
    marginBottom: 8,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  legendItem: {
    alignItems: 'center',
    gap: 4,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  legendText: {
    fontSize: 12,
    color: Theme.colors.text.secondary,
  },
  
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: Theme.colors.dark.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  modalCloseButton: {
    fontSize: 24,
    color: Theme.colors.text.primary,
    width: 32,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Theme.colors.text.primary,
    flex: 1,
    textAlign: 'center',
  },
  modalSpacer: {
    width: 32,
  },
  modalContent: {
    flex: 1,
    padding: 24,
  },
  dayScoreCard: {
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
    backgroundColor: '#4C1D95',
  },
  dayScoreTitle: {
    fontSize: 16,
    color: '#B8A3FF',
    marginBottom: 8,
  },
  dayScoreValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Theme.colors.text.primary,
    marginBottom: 4,
  },
  dayScoreDesc: {
    fontSize: 14,
    color: Theme.colors.text.secondary,
  },
  activitiesCard: {
    padding: 24,
    marginBottom: 16,
    backgroundColor: '#1A1A1A',
  },
  activitiesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Theme.colors.text.primary,
    marginBottom: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  activityIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  activityInfo: {
    flex: 1,
  },
  activityType: {
    fontSize: 16,
    fontWeight: '600',
    color: Theme.colors.text.primary,
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 14,
    color: Theme.colors.text.secondary,
  },
  activityPoints: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#8B5CF6',
  },
  notesCard: {
    padding: 24,
    backgroundColor: '#1A1A1A',
  },
  notesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Theme.colors.text.primary,
    marginBottom: 16,
  },
  notesInput: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Theme.colors.text.primary,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  saveButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: 'flex-end',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Theme.colors.text.primary,
  },
});