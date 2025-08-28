/**
 * Personalization Engine for QuitHero
 * Generates personalized quit plans based on behavioral assessment data
 */

export interface UserBadge {
  type: 'VapeBreaker' | 'CloudWarrior' | 'LifeGuardian' | 'WealthBuilder'
  assignedAt: Date
  motivation: string
  displayName: string
  description: string
}

export interface VapingDependencyScore {
  total: number // 0-100
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Critical'
  breakdown: {
    morningDependency: number  // 0-25 points
    usageFrequency: number     // 0-25 points  
    behavioralCompulsion: number // 0-20 points
    environmentalFactors: number // 0-15 points
    struggleCount: number        // 0-15 points
  }
  riskDescription: string
}

export interface PersonalizedPlan {
  riskLevel: 'high' | 'medium' | 'low';
  riskScore: number;
  day0Checklist: string[];
  priorityTools: string[];
  nrtRecommendations: string[];
  expectedChallenges: string[];
  motivationalMessage: string;
  customStrategies: string[];
}

export function generatePersonalizedPlan(responses: Record<string, any>): PersonalizedPlan {
  const riskAssessment = calculateRiskLevel(responses);
  
  return {
    riskLevel: riskAssessment.level,
    riskScore: riskAssessment.score,
    day0Checklist: generateDay0Checklist(responses, riskAssessment.level),
    priorityTools: getPriorityTools(responses, riskAssessment.level),
    nrtRecommendations: getNRTRecommendations(responses),
    expectedChallenges: getExpectedChallenges(responses, riskAssessment.level),
    motivationalMessage: getMotivationalMessage(responses),
    customStrategies: getCustomStrategies(responses),
  };
}

function calculateRiskLevel(responses: Record<string, any>): { level: 'high' | 'medium' | 'low'; score: number } {
  let riskScore = 0;

  // Dependency signals (highest weight)
  if (responses.firstUseTime === 'within-5min') riskScore += 3;
  else if (responses.firstUseTime === 'within-30min') riskScore += 2;
  else if (responses.firstUseTime === 'within-1hour') riskScore += 1;

  // Usage intensity
  if (responses.substanceType === 'cigarettes') {
    if (responses.usageAmount >= 20) riskScore += 3;
    else if (responses.usageAmount >= 10) riskScore += 2;
    else if (responses.usageAmount >= 5) riskScore += 1;
  } else if (responses.substanceType === 'vape') {
    if (responses.usageAmount >= 3) riskScore += 3;
    else if (responses.usageAmount >= 2) riskScore += 2;
    else if (responses.usageAmount >= 1) riskScore += 1;
  }

  // Environmental and psychological factors
  if (responses.socialContext === 'daily') riskScore += 2;
  else if (responses.socialContext === 'sometimes') riskScore += 1;

  if (responses.stressLevel === 'high') riskScore += 2;
  else if (responses.stressLevel === 'medium') riskScore += 1;

  if (responses.sleepQuality === 'poor') riskScore += 1;

  if (responses.previousAttempts === 'multiple') riskScore += 1;

  // Multiple triggers increase risk
  const triggerCount = (responses.triggers || []).length;
  if (triggerCount >= 4) riskScore += 2;
  else if (triggerCount >= 2) riskScore += 1;

  // Determine risk level
  let level: 'high' | 'medium' | 'low';
  if (riskScore >= 8) level = 'high';
  else if (riskScore >= 4) level = 'medium';
  else level = 'low';

  return { level, score: riskScore };
}

function generateDay0Checklist(responses: Record<string, any>, riskLevel: string): string[] {
  const baseChecklist = [
    'Remove all smoking/vaping products from your space',
    'Download the QuitHero app and set up your profile',
    'Tell someone supportive about your quit date',
    'Plan your first smoke-free day hour by hour',
  ];

  const riskSpecificItems = {
    high: [
      'Stock up on healthy snacks and water',
      'Prepare 3 different distraction activities',
      'Set up your panic mode tools and practice once',
      'Consider nicotine replacement therapy',
      'Plan extra sleep and stress management',
    ],
    medium: [
      'Identify your top 3 triggers and replacement activities',
      'Prepare healthy alternatives for oral fixation',
      'Set up your support system contacts',
      'Plan physical activities for stress relief',
    ],
    low: [
      'Identify your main triggers and plan alternatives',
      'Prepare celebration rewards for milestones',
      'Set up progress tracking reminders',
    ],
  };

  return [...baseChecklist, ...riskSpecificItems[riskLevel as keyof typeof riskSpecificItems]];
}

function getPriorityTools(responses: Record<string, any>, riskLevel: string): string[] {
  const allTools = {
    'panic-mode': 'Panic Mode - 60-second emergency protocol',
    'urge-timer': 'Urge Timer - Track and time your cravings',
    'breathwork': 'Breathwork - Guided breathing exercises',
    'pledge': 'Daily Pledge - Commit to staying smoke-free',
    'distraction': 'Distraction Toolkit - Quick activities to redirect focus',
    'social-support': 'Social Support - Connect with your support network',
  };

  const priorityByRisk = {
    high: ['panic-mode', 'breathwork', 'urge-timer', 'distraction'],
    medium: ['urge-timer', 'breathwork', 'pledge', 'panic-mode'],
    low: ['pledge', 'urge-timer', 'breathwork', 'social-support'],
  };

  const triggers = responses.triggers || [];
  
  // Add trigger-specific tools
  if (triggers.includes('stress')) {
    priorityByRisk[riskLevel as keyof typeof priorityByRisk].unshift('breathwork');
  }
  if (triggers.includes('social')) {
    priorityByRisk[riskLevel as keyof typeof priorityByRisk].push('social-support');
  }

  return priorityByRisk[riskLevel as keyof typeof priorityByRisk]
    .slice(0, 4)
    .map(tool => allTools[tool as keyof typeof allTools]);
}

function getNRTRecommendations(responses: Record<string, any>): string[] {
  if (responses.nrtInterest === 'no') return [];
  if (responses.nrtInterest === 'already-using') {
    return ['Continue your current NRT as planned', 'Track your progress with the app'];
  }

  const recommendations = [];
  const isHighDependency = responses.firstUseTime === 'within-5min' || responses.firstUseTime === 'within-30min';
  const isHeavyUser = (responses.substanceType === 'cigarettes' && responses.usageAmount >= 10) ||
                     (responses.substanceType === 'vape' && responses.usageAmount >= 2);

  if (isHighDependency || isHeavyUser) {
    recommendations.push('Nicotine patch (21mg) for steady baseline relief');
    recommendations.push('Nicotine gum or lozenges for breakthrough cravings');
    recommendations.push('Consider combination therapy for first 2-4 weeks');
  } else {
    recommendations.push('Nicotine gum (2mg) for situational cravings');
    recommendations.push('Nicotine lozenges for oral fixation replacement');
  }

  recommendations.push('Consult your doctor or pharmacist for personalized dosing');
  recommendations.push('Plan to gradually reduce NRT over 8-12 weeks');

  return recommendations;
}

function getExpectedChallenges(responses: Record<string, any>, riskLevel: string): string[] {
  const challenges = [];
  const triggers = responses.triggers || [];

  // Timeline-based challenges
  if (responses.quitTimeline === 'today') {
    challenges.push('Intense cravings in first 72 hours');
    challenges.push('Possible irritability and restlessness');
  }

  // Trigger-based challenges
  if (triggers.includes('stress')) {
    challenges.push('Increased cravings during stressful situations');
  }
  if (triggers.includes('social')) {
    challenges.push('Difficulty in social situations where others smoke/vape');
  }
  if (triggers.includes('boredom')) {
    challenges.push('Strong urges during downtime or routine activities');
  }
  if (triggers.includes('routine')) {
    challenges.push('Breaking automatic smoking/vaping habits');
  }

  // Risk-level specific challenges
  if (riskLevel === 'high') {
    challenges.push('Physical withdrawal symptoms may be more intense');
    challenges.push('Sleep disruption in first week');
    challenges.push('Mood changes and anxiety');
  }

  // Social environment challenges
  if (responses.socialContext === 'daily') {
    challenges.push('Constant exposure to smoking/vaping triggers');
  }

  // Previous attempt challenges
  if (responses.previousAttempts === 'multiple') {
    challenges.push('Overcoming past quit attempt disappointments');
    challenges.push('Building confidence after previous setbacks');
  }

  return challenges.slice(0, 5); // Limit to top 5 challenges
}

function getMotivationalMessage(responses: Record<string, any>): string {
  const motivation = responses.primaryMotivation;
  const timeline = responses.quitTimeline;

  const messages = {
    health: {
      today: "Your lungs start healing within 20 minutes of your last cigarette. Every breath from now on is a step toward better health.",
      'this-week': "This week, you're giving your body the greatest gift possible - the chance to heal and thrive.",
      'next-week': "Next week marks the beginning of your health transformation. Your future self will thank you.",
      'this-month': "This month, you're choosing a longer, healthier life. Every day of preparation increases your success."
    },
    money: {
      today: "Starting today, every dollar you don't spend on smoking is an investment in your future.",
      'this-week': "This week, you'll start seeing real money back in your pocket instead of going up in smoke.",
      'next-week': "Next week, you'll begin building wealth instead of burning it away.",
      'this-month': "This month, you're choosing financial freedom over addiction."
    },
    family: {
      today: "Today, you're showing your loved ones what strength and commitment look like.",
      'this-week': "This week, you're setting an example that will inspire your family for years to come.",
      'next-week': "Next week, you'll start protecting your family's health and your own.",
      'this-month': "This month, you're choosing to be present and healthy for the people who matter most."
    },
    control: {
      today: "Today, you take back control from nicotine and reclaim your freedom.",
      'this-week': "This week, you prove to yourself that you're stronger than any addiction.",
      'next-week': "Next week, you'll start living life on your terms, not nicotine's.",
      'this-month': "This month, you're breaking free from the chains of addiction."
    }
  };

  return messages[motivation as keyof typeof messages]?.[timeline as keyof typeof messages.health] ||
         "You have the strength to overcome this addiction. Every step forward is a victory.";
}

function getCustomStrategies(responses: Record<string, any>): string[] {
  const strategies = [];
  const triggers = responses.triggers || [];

  // Trigger-specific strategies
  if (triggers.includes('stress')) {
    strategies.push('Practice 4-7-8 breathing when stress hits');
    strategies.push('Keep a stress ball or fidget toy handy');
  }
  if (triggers.includes('boredom')) {
    strategies.push('Create a "boredom buster" list of 10 quick activities');
    strategies.push('Keep your hands busy with puzzles or crafts');
  }
  if (triggers.includes('social')) {
    strategies.push('Practice saying "I don\'t smoke anymore" with confidence');
    strategies.push('Bring a supportive friend to social events');
  }
  if (triggers.includes('routine')) {
    strategies.push('Change your daily routine to break automatic habits');
    strategies.push('Replace smoking breaks with short walks');
  }

  // Sleep and stress strategies
  if (responses.sleepQuality === 'poor') {
    strategies.push('Establish a calming bedtime routine without nicotine');
    strategies.push('Avoid caffeine after 2 PM during your quit');
  }
  if (responses.stressLevel === 'high') {
    strategies.push('Schedule daily stress-relief activities');
    strategies.push('Consider meditation or yoga apps');
  }

  // Social environment strategies
  if (responses.socialContext === 'daily') {
    strategies.push('Ask family/friends to avoid smoking around you');
    strategies.push('Create smoke-free zones in your home and car');
  }

  return strategies.slice(0, 6); // Limit to top 6 strategies
}

export function assignUserBadge(motivation: string): UserBadge {
  const badgeMap = {
    'health': {
      type: 'VapeBreaker' as const,
      displayName: 'VapeBreaker',
      description: 'Ready to breathe free'
    },
    'control': {
      type: 'CloudWarrior' as const, 
      displayName: 'CloudWarrior',
      description: 'Taking back control'
    },
    'family': {
      type: 'LifeGuardian' as const,
      displayName: 'LifeGuardian', 
      description: 'Protecting what matters'
    },
    'money': {
      type: 'WealthBuilder' as const,
      displayName: 'WealthBuilder',
      description: 'Investing in your future'
    }
  }
  
  const badge = badgeMap[motivation as keyof typeof badgeMap] || badgeMap['health']
  return {
    ...badge,
    assignedAt: new Date(),
    motivation
  }
}

export function calculateVapingDependency(responses: any): VapingDependencyScore {
  let morningDependency = 0
  let usageFrequency = 0  
  let behavioralCompulsion = 0
  let environmentalFactors = 0
  let struggleCount = 0

  // Morning dependency (0-25 points)
  switch(responses.firstUseTime) {
    case 'within_5_min': morningDependency = 25; break
    case 'within_30_min': morningDependency = 20; break  
    case 'within_1_hour': morningDependency = 10; break
    case 'after_1_hour': morningDependency = 0; break
  }

  // Usage frequency (0-25 points)
  switch(responses.usageAmount) {
    case 'every_5_min': usageFrequency = 25; break
    case 'every_30_min': usageFrequency = 20; break
    case 'every_hour': usageFrequency = 15; break
    case 'few_times_day': usageFrequency = 5; break
  }

  // Behavioral compulsion (0-20 points)
  switch(responses.choiceVsNeed) {
    case 'gradually_months': behavioralCompulsion = 20; break
    case 'within_weeks': behavioralCompulsion = 15; break
    case 'within_days': behavioralCompulsion = 10; break
    case 'still_choice': behavioralCompulsion = 0; break
  }

  // Environmental factors (0-15 points)
  if (responses.socialContext === 'daily') environmentalFactors += 4
  if (responses.stressLevel === 'high') environmentalFactors += 4  
  if (responses.sleepQuality === 'poor') environmentalFactors += 3
  if (responses.previousAttempts === 'multiple') environmentalFactors += 4

  // Struggle count (0-15 points) 
  struggleCount = Math.min((responses.struggles?.length || 0) * 2, 15)

  const total = morningDependency + usageFrequency + behavioralCompulsion + environmentalFactors + struggleCount

  let riskLevel: 'Low' | 'Moderate' | 'High' | 'Critical'
  let riskDescription: string

  if (total >= 75) {
    riskLevel = 'Critical'
    riskDescription = 'Severe vaping dependency - immediate intervention recommended'
  } else if (total >= 50) {
    riskLevel = 'High' 
    riskDescription = 'Strong vaping dependency - structured support needed'
  } else if (total >= 25) {
    riskLevel = 'Moderate'
    riskDescription = 'Moderate vaping dependency - consistent support helpful'  
  } else {
    riskLevel = 'Low'
    riskDescription = 'Developing vaping dependency - good time to quit'
  }

  return {
    total,
    riskLevel,
    breakdown: {
      morningDependency,
      usageFrequency,
      behavioralCompulsion, 
      environmentalFactors,
      struggleCount
    },
    riskDescription
  }
}