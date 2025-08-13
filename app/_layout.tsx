import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '@/src/design-system/theme';
import { Card, Badge, Button } from '@/src/design-system/components';
import { useQuitStore } from '@/src/stores/quitStore';
import { useToolStore } from '@/src/stores/toolStore';
import { useAuthStore } from '@/src/stores/authStore';
import { calculateQuitStats, formatDuration, formatCurrency } from '@/src/utils/calculations';
import { socialCompetition } from '@/src/services/socialCompetition';
import { financialIncentives } from '@/src/services/financialIncentives';
import { useState } from 'react';
import { analytics } from '@/src/services/analytics';
import { useRouter } from 'expo-router';

export default function DashboardScreen() {
  const router = useRouter();
  const { quitData } = useQuitStore();
  const [userRank, setUserRank] = useState<any>(null);
  const [roiAnalysis, setROIAnalysis] = useState<any>(null);
  const { getToolStats } = useToolStore();
  const { user } = useAuthStore();
  
  const [quitStats, setQuitStats] = useState<any>(null);
  const [toolStats, setToolStats] = useState<any>({});

  useEffect(() => {
    loadDashboardData();
    trackDashboardView();
    
    loadAdditionalData();
  }, [quitData]);

  const loadAdditionalData = async () => {
    try {
      // Load user's leaderboard rank
      const rank = await socialCompetition.getUserRank('streak');
      setUserRank(rank);
      
      // Load ROI analysis