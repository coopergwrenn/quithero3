import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Modal, TextInput, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

// Starfield Component for Premium Background
const StarField = () => {
  const [stars] = useState(() => {
    const starArray = [];
    for (let i = 0; i < 150; i++) {
      starArray.push({
        id: i,
        x: Math.random() * Dimensions.get('window').width,
        y: Math.random() * Dimensions.get('window').height,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.8 + 0.2,
      });
    }
    return starArray;
  });

  const animatedValues = useRef(stars.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const animations = animatedValues.map((animValue, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(animValue, {
            toValue: 1,
            duration: 2000 + Math.random() * 3000,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: 2000 + Math.random() * 3000,
            useNativeDriver: true,
          }),
        ])
      )
    );

    animations.forEach(anim => anim.start());

    return () => animations.forEach(anim => anim.stop());
  }, []);

  return (
    <View style={styles.starfield}>
      {stars.map((star, index) => (
        <Animated.View
          key={star.id}
          style={[
            styles.star,
            {
              left: star.x,
              top: star.y,
              width: star.size,
              height: star.size,
              opacity: animatedValues[index].interpolate({
                inputRange: [0, 1],
                outputRange: [star.opacity * 0.3, star.opacity],
              }),
            },
          ]}
        />
      ))}
    </View>
  );
};

export default function DashboardScreen() {
  const router = useRouter();
  const { quitData, updateQuitData } = useQuitStore();
  const { getToolStats } = useToolStore();
  
  // User state
  const [userName, setUserName] = useState('');
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const [celebrationAnimation] = useState(new Animated.Value(1));
  const badgeGlow = useRef(new Animated.Value(0)).current;
  const treeGrow = useRef(new Animated.Value(0)).current;
  const [showSeedPrompt, setShowSeedPrompt] = useState(false);
  const [treePlanted, setTreePlanted] = useState(true); // Default to planted
  
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

  // Update time every second for real-time calculations
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // Update every second for live counter
    
    analytics.track('dashboard_viewed');
    
    return () => clearInterval(interval);
  }, []);

  // Tree growth animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(treeGrow, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(treeGrow, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Load and check tree state with persistence
  useEffect(() => {
    const loadTreeState = async () => {
      try {
        // Load saved tree state
        const savedTreeState = await AsyncStorage.getItem('treeState');
        const treeData = savedTreeState ? JSON.parse(savedTreeState) : null;
        
        const daysSinceQuit = calculateDaysSinceQuit();
        
        if (treeData) {
          // Use saved state
          setTreePlanted(treeData.planted);
          setShowSeedPrompt(!treeData.planted && daysSinceQuit === 0);
        } else {
          // New user logic
          if (daysSinceQuit === 0 && !quitData.quitDate) {
            // Completely new user - show seed prompt
            setShowSeedPrompt(true);
            setTreePlanted(false);
          } else {
            // User with existing quit data - tree is planted
            setTreePlanted(true);
            setShowSeedPrompt(false);
            // Save this state
            await AsyncStorage.setItem('treeState', JSON.stringify({ planted: true }));
          }
        }
      } catch (error) {
        console.error('Error loading tree state:', error);
        // Fallback to safe defaults
        setTreePlanted(true);
        setShowSeedPrompt(false);
      }
    };
    
    loadTreeState();
  }, [quitData.quitDate]);

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

  // Calculate tree growth stage based on quit progress
  const getTreeStage = () => {
    const daysSinceQuit = calculateDaysSinceQuit();
    
    if (!treePlanted) return 'seed_prompt';
    if (daysSinceQuit === 0) return 'seed_planted';
    if (daysSinceQuit < 3) return 'seed_planted';
    if (daysSinceQuit < 7) return 'sprout';
    if (daysSinceQuit < 14) return 'small_sapling';
    if (daysSinceQuit < 30) return 'medium_tree';
    if (daysSinceQuit < 90) return 'large_tree';
    return 'mighty_tree';
  };

  // Get tree emoji and description for current stage
  const getTreeDisplay = () => {
    const stage = getTreeStage();
    const daysSinceQuit = calculateDaysSinceQuit();
    
    switch (stage) {
      case 'seed_prompt':
        return { emoji: '🌱', description: 'Tap to plant your recovery seed!', glow: '#4ADE80' };
      case 'seed_planted':
        return { emoji: '🌱', description: 'Your recovery seed is planted', glow: '#4ADE80' };
      case 'sprout':
        return { emoji: '🌱', description: 'Your lungs are starting to heal!', glow: '#4ADE80' };
      case 'small_sapling':
        return { emoji: '🌿', description: 'Growing stronger each day', glow: '#22C55E' };
      case 'medium_tree':
        return { emoji: '🌳', description: 'Your health tree is thriving', glow: '#16A34A' };
      case 'large_tree':
        return { emoji: '🌳', description: 'Strong and healthy lungs', glow: '#15803D' };
      case 'mighty_tree':
        return { emoji: '🌳', description: 'Fully healed - you did it!', glow: '#166534' };
      case 'firewood':
        return { emoji: '🪵', description: 'Tree cut down... plant again?', glow: '#DC2626' };
      default:
        return { emoji: '🌱', description: 'Ready to grow again', glow: '#4ADE80' };
    }
  };

  // Handle planting the seed
  const plantSeed = async () => {
    try {
      setTreePlanted(true);
      setShowSeedPrompt(false);
      // Save tree state to storage
      await AsyncStorage.setItem('treeState', JSON.stringify({ planted: true }));
    } catch (error) {
      console.error('Error saving tree state:', error);
    }
  };

  // Handle tree reset (when user relapses)
  const resetTree = async () => {
    try {
      setTreePlanted(false);
      setShowSeedPrompt(true);
      // Save reset state to storage
      await AsyncStorage.setItem('treeState', JSON.stringify({ planted: false }));
      // Show firewood animation briefly, then reset to seed prompt
    } catch (error) {
      console.error('Error saving tree reset:', error);
    }
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

  // Calendar functions - FIXED: No more random flashing!
  const calculateDayScore = (date: Date): number => {
    const dateStr = date.toISOString().split('T')[0];
    const quitDate = new Date(effectiveQuitData.quitDate);
    const isQuitDay = date >= quitDate;
    
    if (!isQuitDay) return 0;
    
    // STABLE activity data - use date as seed for consistent results
    const dayNumber = date.getDate();
    const monthNumber = date.getMonth();
    const seed = dayNumber + monthNumber * 31; // Consistent seed per day
    
    // Deterministic "random" values based on date seed
    const mockActivities = {
      pledgeCompleted: (seed % 7) > 2 ? 1 : 0, // ~70% completion rate
      panicModeUses: (seed % 5), // 0-4 uses
      urgeTimerCompletes: Math.floor((seed % 13) / 6), // 0-2 completes  
      breathworkSessions: Math.floor((seed % 11) / 5), // 0-2 sessions
      communityInteractions: (seed % 8), // 0-7 interactions
    };
    
    const dayActivities = {
      pledgeCompleted: mockActivities.pledgeCompleted * 25,
      panicModeUses: Math.min(mockActivities.panicModeUses, 2) * 20, // Cap at 2
      urgeTimerCompletes: mockActivities.urgeTimerCompletes * 15,
      breathworkSessions: mockActivities.breathworkSessions * 10,
      communityInteractions: Math.min(mockActivities.communityInteractions, 4) * 5, // Cap at 4
      baseQuitDay: 10
    };
    
    return Math.min(100, Object.values(dayActivities).reduce((a, b) => a + b, 0));
  };

  const getCalendarCellColor = (score: number): string => {
    if (score === 0) return '#374151'; // Gray for non-quit days
    const intensity = score / 100;
    return `rgba(139, 92, 246, ${0.3 + (intensity * 0.7)})`; // Purple gradient
  };

  // Premium calendar cell colors with glass morphism
  const getPremiumCellColor = (score: number): string => {
    if (score === 0) return 'rgba(255, 255, 255, 0.05)'; // Very subtle for inactive days
    if (score < 30) return 'rgba(139, 92, 246, 0.15)'; // Light purple for low activity
    if (score < 70) return 'rgba(139, 92, 246, 0.25)'; // Medium purple
    return 'rgba(139, 92, 246, 0.4)'; // Strong purple for high activity days
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
      <StarField />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          
          {/* App Logo/Icon */}
          <View style={styles.appIconContainer}>
            <Text style={styles.appIcon}>QUITHERO</Text>
            <View style={styles.streakBadge}>
              <Text style={styles.streakIcon}>🔥</Text>
              <Text style={styles.streakNumber}>1</Text>
            </View>
          </View>
          
          {/* Weekly Progress Circles */}
          <View style={styles.weeklyProgressContainer}>
            {['F', 'S', 'S', 'M', 'T', 'W', 'T'].map((day, index) => {
              const dayDate = new Date();
              dayDate.setDate(dayDate.getDate() - (6 - index)); // Calculate each day
              const isCompleted = dayDate >= new Date(effectiveQuitData.quitDate);
              const isToday = index === 6; // Thursday is today in the reference
              
              return (
                <View key={index} style={styles.weeklyProgressItem}>
                  <View style={[
                    styles.weeklyProgressCircle,
                    isCompleted && styles.weeklyProgressCompleted,
                    isToday && styles.weeklyProgressToday
                  ]}>
                    {isCompleted ? (
                      <Text style={styles.weeklyProgressCheck}>✓</Text>
                    ) : (
                      <Text style={styles.weeklyProgressMinus}>−</Text>
                    )}
                  </View>
                  <Text style={styles.weeklyProgressDay}>{day}</Text>
                </View>
              );
            })}
          </View>

          {/* Tree Growth System */}
          <View style={styles.treeContainer}>
            <TouchableOpacity 
              style={[
                styles.treeCircle,
                {
                  shadowColor: getTreeDisplay().glow,
                }
              ]}
              onPress={showSeedPrompt ? plantSeed : undefined}
              activeOpacity={showSeedPrompt ? 0.7 : 1}
            >
              <Animated.View style={[
                styles.treeInner,
                {
                  shadowOpacity: treeGrow.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.3, 0.8],
                  }),
                  shadowRadius: treeGrow.interpolate({
                    inputRange: [0, 1],
                    outputRange: [15, 25],
                  }),
                  shadowColor: getTreeDisplay().glow,
                  transform: [{
                    scale: treeGrow.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.05],
                    })
                  }]
                }
              ]}>
                <Text style={styles.treeEmoji}>{getTreeDisplay().emoji}</Text>
                {showSeedPrompt && (
                  <Animated.View style={[
                    styles.seedPromptPulse,
                    {
                      opacity: treeGrow.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.5, 1],
                      }),
                    }
                  ]} />
                )}
              </Animated.View>
            </TouchableOpacity>
            
            {/* Tree Stage Description */}
            <Text style={styles.treeDescription}>{getTreeDisplay().description}</Text>
            
            {/* Progress Ring */}
            <View style={styles.treeProgressRing}>
              <View style={[
                styles.treeProgressFill,
                {
                  width: `${Math.min(100, (calculateDaysSinceQuit() / 90) * 100)}%`,
                  backgroundColor: getTreeDisplay().glow,
                }
              ]} />
            </View>
          </View>

          {/* Quit Counter */}
          <View style={styles.quitCounterContainer}>
            <Text style={styles.quitCounterText}>You've been vape-free for:</Text>
            <View style={styles.timeDisplayContainer}>
              <Text style={styles.timeDisplayMain}>{calculateTimeSinceQuit().days > 0 ? `${calculateTimeSinceQuit().days}d` : `${calculateTimeSinceQuit().hours}h`}</Text>
              <Text style={styles.timeDisplaySub}>{calculateTimeSinceQuit().minutes}m</Text>
            </View>
            <View style={styles.secondsContainer}>
              <Text style={styles.secondsText}>{Math.floor((currentTime.getTime() - new Date(effectiveQuitData.quitDate).getTime()) / 1000) % 60}s</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={() => router.push('/(app)/tools/pledge' as any)}
            >
              <View style={styles.actionButtonIcon}>
                <Text style={styles.actionButtonEmoji}>✋</Text>
              </View>
              <Text style={styles.actionButtonLabel}>Pledge</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={() => router.push('/(app)/tools/breathwork' as any)}
            >
              <View style={styles.actionButtonIcon}>
                <Text style={styles.actionButtonEmoji}>🧘</Text>
              </View>
              <Text style={styles.actionButtonLabel}>Meditate</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={() => {
                // Reset functionality - tree gets cut down
                resetTree();
                // Also reset quit data
                updateQuitData({ quitDate: new Date() });
              }}
            >
              <View style={styles.actionButtonIcon}>
                <Text style={styles.actionButtonEmoji}>⏰</Text>
              </View>
              <Text style={styles.actionButtonLabel}>Reset</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={() => router.push('/(app)/(tabs)/tools')}
            >
              <View style={styles.actionButtonIcon}>
                <Text style={styles.actionButtonEmoji}>✏️</Text>
              </View>
              <Text style={styles.actionButtonLabel}>More</Text>
            </TouchableOpacity>
          </View>

          {/* Brain Rewiring Progress */}
          <View style={styles.brainRewiringContainer}>
            <View style={styles.brainRewiringHeader}>
              <Text style={styles.brainRewiringLabel}>Brain Rewiring</Text>
              <Text style={styles.brainRewiringPercent}>{Math.floor(Math.min(100, (daysSinceQuit / 90) * 100))}%</Text>
            </View>
            <View style={styles.brainRewiringBar}>
              <View style={[styles.brainRewiringFill, { width: `${Math.min(100, (daysSinceQuit / 90) * 100)}%` }]} />
            </View>
          </View>

          {/* Motivational Message */}
          <View style={styles.motivationalSection}>
            <Text style={styles.motivationalText}>
              Today marks the beginning of a powerful journey.{'\n'}
              This decision is a commitment to a better you.{'\n'}
              Remember, small steps lead to great changes.
            </Text>
          </View>

          {/* Panic Button */}
          <TouchableOpacity 
            style={styles.panicButton}
            onPress={() => router.push('/(app)/tools/panic' as any)}
          >
            <Text style={styles.panicButtonIcon}>⚠️</Text>
            <Text style={styles.panicButtonText}>Panic Button</Text>
          </TouchableOpacity>

          {/* Premium Quit Calendar */}
          <View style={styles.premiumCalendarCard}>
            {/* Premium Header */}
            <View style={styles.premiumCalendarHeader}>
              <Text style={styles.premiumCalendarTitle}>Your Quit Journey</Text>
              <View style={styles.premiumMonthNav}>
                <TouchableOpacity onPress={() => navigateMonth('prev')} style={styles.premiumNavButton}>
                  <Text style={styles.premiumNavText}>‹</Text>
                </TouchableOpacity>
                <Text style={styles.premiumMonthText}>
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </Text>
                <TouchableOpacity onPress={() => navigateMonth('next')} style={styles.premiumNavButton}>
                  <Text style={styles.premiumNavText}>›</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Premium Day Headers */}
            <View style={styles.premiumDayHeaders}>
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                <Text key={index} style={styles.premiumDayHeader}>{day}</Text>
              ))}
            </View>
            
            {/* Premium Calendar Grid */}
            <View style={styles.premiumCalendarGrid}>
              {getDaysInMonth(currentMonth).map((day, index) => {
                const score = calculateDayScore(day);
                const isToday = day.toDateString() === new Date().toDateString();
                const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
                const quitDate = new Date(effectiveQuitData.quitDate);
                const isQuitDay = day >= quitDate;
                
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.premiumDayCell,
                      {
                        backgroundColor: isQuitDay ? getPremiumCellColor(score) : 'rgba(255, 255, 255, 0.03)',
                        opacity: isCurrentMonth ? 1 : 0.4,
                        borderWidth: isToday ? 2 : 1,
                        borderColor: isToday ? '#8B5CF6' : 'rgba(255, 255, 255, 0.1)',
                      }
                    ]}
                    onPress={() => openDayModal(day)}
                  >
                    <Text style={[
                      styles.premiumDayText,
                      { 
                        color: isCurrentMonth ? '#FFFFFF' : '#888888',
                        fontWeight: isToday ? '600' : '400'
                      }
                    ]}>
                      {day.getDate()}
                    </Text>
                    {isQuitDay && score > 70 && (
                      <View style={styles.premiumSuccessIndicator}>
                        <Text style={styles.premiumSuccessIcon}>✨</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Motivational Message */}
          <Card style={styles.motivationCard}>
            <Text style={styles.motivationText}>{getMotivationalMessage()}</Text>
          </Card>

          {/* Premium Health Recovery Timeline */}
          <View style={styles.premiumHealthCard}>
            {/* Header Section */}
            <View style={styles.premiumHealthHeader}>
              <View style={styles.healthIconContainer}>
                <Text style={styles.healthIcon}>🫁</Text>
              </View>
              <View style={styles.healthHeaderText}>
                <Text style={styles.premiumHealthTitle}>Health Recovery Timeline</Text>
                <Text style={styles.premiumHealthSubtitle}>
                  Your body is healing! {achievedMilestones.length} of {milestoneStatus.length} milestones achieved.
                </Text>
              </View>
            </View>
            
            {/* Milestones List */}
            <View style={styles.premiumMilestonesContainer}>
              {milestoneStatus.slice(0, 6).map((milestone, index) => (
                <View key={index} style={styles.premiumMilestoneItem}>
                  <View style={[
                    styles.premiumMilestoneIcon,
                    milestone.isAchieved && styles.premiumMilestoneIconAchieved
                  ]}>
                    <Text style={styles.premiumMilestoneCheck}>
                      {milestone.isAchieved ? '✓' : milestone.icon}
                    </Text>
                  </View>
                  <View style={styles.premiumMilestoneContent}>
                    <Text style={[
                      styles.premiumMilestoneTitle,
                      milestone.isAchieved && styles.premiumMilestoneTitleAchieved
                    ]}>
                      {milestone.title}
                    </Text>
                    <Text style={styles.premiumMilestoneDescription}>
                      {milestone.description}
                    </Text>
                    {!milestone.isAchieved && (
                      <View style={styles.premiumProgressContainer}>
                        <View style={styles.premiumProgressBar}>
                          <View style={[
                            styles.premiumProgressFill,
                            { width: `${milestone.progress}%` }
                          ]} />
                        </View>
                        <Text style={styles.premiumProgressText}>{milestone.progress}%</Text>
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </View>

            {nextMilestone && (
              <View style={styles.premiumNextMilestoneCard}>
                <Text style={styles.premiumNextMilestoneLabel}>Next Milestone</Text>
                <Text style={styles.premiumNextMilestoneTitle}>
                  {nextMilestone.title} in {nextMilestone.time - daysSinceQuit} days
                </Text>
              </View>
            )}
          </View>

          {/* Premium Your Tools Section */}
          <View style={styles.premiumToolsCard}>
            {/* Header Section */}
            <View style={styles.premiumToolsHeader}>
              <View style={styles.toolsIconContainer}>
                <Text style={styles.toolsIcon}>🛠️</Text>
              </View>
              <View style={styles.toolsHeaderText}>
                <Text style={styles.premiumToolsTitle}>Your Tools</Text>
                <Text style={styles.premiumToolsSubtitle} numberOfLines={1}>
                  {totalUses} total uses • Most used: {mostUsedTool.name} {mostUsedTool.icon}
                </Text>
              </View>
            </View>
            
            {/* Tools Grid */}
            <View style={styles.premiumToolsGrid}>
              {toolStats.map((tool) => (
                <TouchableOpacity
                  key={tool.id}
                  style={styles.premiumToolCard}
                  onPress={() => navigateToTool(tool.id)}
                >
                  <View style={styles.premiumToolIconContainer}>
                    <Text style={styles.premiumToolIcon}>{tool.icon}</Text>
                  </View>
                  <Text style={styles.premiumToolName}>{tool.name}</Text>
                  <Text style={styles.premiumToolUses}>{tool.uses} uses</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

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
    backgroundColor: '#0B0B1A', // Deep space background with subtle blue tint
  },
  
  // Starfield Background
  starfield: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  star: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 2,
  },
  scrollView: {
    flex: 1,
    zIndex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 80, // Reduced top padding to move content up
    paddingBottom: 120, // More bottom padding for navigation safety
  },
  
  // App Icon/Logo Section
  appIconContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28, // Multiple of 4
  },
  appIcon: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 165, 0, 0.2)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#FFA500',
  },
  streakIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  streakNumber: {
    color: '#FFA500',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  // Weekly Progress Circles (Top Row)
  weeklyProgressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28, // Multiple of 4 - reduced
    paddingHorizontal: 20,
  },
  weeklyProgressItem: {
    alignItems: 'center',
  },
  weeklyProgressCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(75, 85, 99, 0.3)',
    borderWidth: 2,
    borderColor: 'rgba(75, 85, 99, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  weeklyProgressCompleted: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderColor: '#8B5CF6',
  },
  weeklyProgressToday: {
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
    borderColor: '#8B5CF6',
    borderWidth: 3,
  },
  weeklyProgressCheck: {
    color: '#8B5CF6',
    fontSize: 18,
    fontWeight: 'bold',
  },
  weeklyProgressMinus: {
    color: '#6B7280',
    fontSize: 20,
    fontWeight: 'bold',
  },
  weeklyProgressDay: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Tree Growth System - Compact
  treeContainer: {
    alignItems: 'center',
    marginBottom: 20, // Reduced from 24
  },
  treeCircle: {
    width: 120, // Much smaller - was 160
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    elevation: 12,
    position: 'relative',
  },
  treeInner: {
    width: 100, // Proportionally smaller
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    elevation: 8,
  },
  treeEmoji: {
    fontSize: 48, // Smaller - was 64
    textAlign: 'center',
  },
  seedPromptPulse: {
    position: 'absolute',
    width: 120, // Match new size
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(74, 222, 128, 0.2)',
    borderWidth: 2,
    borderColor: '#4ADE80',
  },
  treeDescription: {
    color: '#FFFFFF',
    fontSize: 12, // Smaller text
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 8, // Reduced spacing
    opacity: 0.9,
    letterSpacing: 0.3,
  },
  treeProgressRing: {
    width: 100, // Smaller progress bar
    height: 3, // Thinner
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    marginTop: 8, // Less spacing
    overflow: 'hidden',
  },
  treeProgressFill: {
    height: '100%',
    borderRadius: 2,
    shadowColor: '#4ADE80',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 3,
  },
  
  // Quit Counter - Compact Spacing
  quitCounterContainer: {
    alignItems: 'center',
    marginBottom: 32, // Multiple of 4 - reduced from 60
  },
  quitCounterText: {
    color: '#FFFFFF',
    fontSize: 18, // Slightly smaller
    fontWeight: '400',
    marginBottom: 16, // Multiple of 4
    letterSpacing: 0.5,
    opacity: 0.9,
  },
  timeDisplayContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: 12, // Multiple of 4
  },
  timeDisplayMain: {
    color: '#FFFFFF',
    fontSize: 72, // Slightly smaller to save space
    fontWeight: '600', // Much bolder - was 200
    letterSpacing: -4,
    textShadowColor: 'rgba(255, 255, 255, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  timeDisplaySub: {
    color: '#FFFFFF',
    fontSize: 36, // Proportionally smaller
    fontWeight: '500', // Bolder - was 200
    marginLeft: 8, // Multiple of 4
    opacity: 0.9, // Slightly more opaque for better visibility
  },
  secondsContainer: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  secondsText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '500',
    letterSpacing: 1,
  },
  
  // Action Buttons - Compact Spacing
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32, // Multiple of 4 - reduced from 50
    paddingHorizontal: 20,
  },
  actionButton: {
    alignItems: 'center',
    width: 75,
  },
  actionButtonIcon: {
    width: 56, // Slightly smaller
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8, // Multiple of 4 - reduced
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  actionButtonEmoji: {
    fontSize: 28,
  },
  actionButtonLabel: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: 0.3,
    opacity: 0.9,
  },
  
  // Brain Rewiring Progress Bar
  brainRewiringContainer: {
    marginBottom: 28, // Multiple of 4 - reduced
    paddingHorizontal: 20,
  },
  brainRewiringHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8, // Multiple of 4
  },
  brainRewiringBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  brainRewiringFill: {
    height: '100%',
    backgroundColor: '#8B5CF6',
    borderRadius: 4,
  },
  brainRewiringLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  brainRewiringPercent: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Motivational Section
  motivationalSection: {
    marginBottom: 28, // Multiple of 4 - reduced
    paddingHorizontal: 20,
  },
  motivationalText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.9,
  },
  
  // Panic Button - Compact
  panicButton: {
    backgroundColor: '#DC2626',
    borderRadius: 28, // Multiple of 4
    paddingVertical: 16, // Multiple of 4
    paddingHorizontal: 36, // Multiple of 4
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32, // Multiple of 4 - reduced from 50
    marginHorizontal: 20,
    borderWidth: 2,
    borderColor: '#EF4444',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  panicButtonIcon: {
    fontSize: 22,
    marginRight: 14,
  },
  panicButtonText: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '600',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
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
  // Premium Health Recovery Timeline Styles
  premiumHealthCard: {
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
  },
  premiumHealthHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  healthIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(236, 72, 153, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  healthIcon: {
    fontSize: 24,
  },
  healthHeaderText: {
    flex: 1,
  },
  premiumHealthTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  premiumHealthSubtitle: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
  },
  premiumMilestonesContainer: {
    gap: 16,
  },
  premiumMilestoneItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 4,
  },
  premiumMilestoneIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(75, 85, 99, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(75, 85, 99, 0.5)',
  },
  premiumMilestoneIconAchieved: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderColor: '#22C55E',
  },
  premiumMilestoneCheck: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  premiumMilestoneContent: {
    flex: 1,
  },
  premiumMilestoneTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  premiumMilestoneTitleAchieved: {
    color: '#22C55E',
  },
  premiumMilestoneDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
    marginBottom: 8,
  },
  premiumProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  premiumProgressBar: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  premiumProgressFill: {
    height: '100%',
    backgroundColor: '#8B5CF6',
    borderRadius: 3,
  },
  premiumProgressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8B5CF6',
    minWidth: 32,
  },
  premiumNextMilestoneCard: {
    marginTop: 20,
    padding: 16,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  premiumNextMilestoneLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8B5CF6',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  premiumNextMilestoneTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  
  // Premium Tools Section Styles
  premiumToolsCard: {
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
  },
  premiumToolsHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  toolsIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  toolsIcon: {
    fontSize: 26,
  },
  toolsHeaderText: {
    flex: 1,
  },
  premiumToolsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  premiumToolsSubtitle: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
    flexShrink: 1,
  },
  premiumToolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 4,
  },
  premiumToolCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#0F0F0F',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#333333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  premiumToolIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  premiumToolIcon: {
    fontSize: 28,
  },
  premiumToolName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  premiumToolUses: {
    fontSize: 13,
    color: '#888888',
    textAlign: 'center',
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
  
  // Premium Calendar Styles - BALANCED COMPACT
  premiumCalendarCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)', // Glass morphism background
    borderRadius: 16, // Compact radius
    padding: 12, // Tight internal padding
    paddingBottom: 16, // Perfect bottom padding for calendar days
    marginBottom: 32, // PROPER section spacing - restored!
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)', // Subtle glass border
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    // CRITICAL MOBILE FIX - FORCE EXACT HEIGHT BUT ALLOW FOR BOTTOM PADDING!
    minHeight: 'auto',
    maxHeight: 336, // Adjusted for reduced bottom padding (320 + 16)
    alignSelf: 'stretch',
    flexShrink: 1,
  },
  premiumCalendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12, // Even tighter - was 16
    paddingBottom: 8, // Tighter - was 12
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  premiumCalendarTitle: {
    fontSize: 18, // Smaller - was 20
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  premiumMonthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8, // Much tighter - was 12
  },
  premiumNavButton: {
    width: 28, // Smaller - was 32
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  premiumNavText: {
    color: '#FFFFFF',
    fontSize: 14, // Smaller - was 16
    fontWeight: '600',
  },
  premiumMonthText: {
    color: '#FFFFFF',
    fontSize: 16, // Smaller - was 17
    fontWeight: '600',
    textAlign: 'center',
    minWidth: 120, // Smaller - was 140
    letterSpacing: 0.3,
  },
  premiumDayHeaders: {
    flexDirection: 'row',
    marginBottom: 8, // Even tighter - was 12
    paddingHorizontal: 2,
  },
  premiumDayHeader: {
    flex: 1,
    textAlign: 'center',
    color: '#CCCCCC',
    fontSize: 12,
    fontWeight: '600',
    paddingVertical: 4, // Tighter - was 6
    letterSpacing: 0.5,
  },
  premiumCalendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 3, // Smaller gap - was 4
    justifyContent: 'space-between', // Perfect edge alignment
    // CRITICAL MOBILE FIX - FORCE TIGHT LAYOUT!
    flex: 0,
    minHeight: 'auto',
    alignSelf: 'stretch',
  },
  premiumDayCell: {
    width: '13.5%', // Adjusted for smaller gap
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8, // Smaller radius - was 12
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, // Minimal shadow
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  premiumDayText: {
    fontSize: 14, // Smaller - was 16
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  premiumSuccessIndicator: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(34, 197, 94, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  premiumSuccessIcon: {
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