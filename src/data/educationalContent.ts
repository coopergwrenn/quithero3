/**
 * Educational Content Data
 * Evidence-based smoking cessation content with progressive unlocking
 */

export interface ContentSection {
  heading: string;
  content: string;
  pros?: string[];
  cons?: string[];
}

export interface Article {
  id: string;
  title: string;
  description: string;
  readTime: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  unlocked: boolean;
  unlockDays?: number;
  personalized?: boolean;
  sections: ContentSection[];
  keyTakeaways: string[];
  relatedTools?: string[];
  references: string[];
}

export interface ContentCategory {
  id: string;
  title: string;
  icon: string;
  description: string;
  unlocked: boolean;
  unlockDays?: number;
  articles: Article[];
}

// Foundation Knowledge Content
export const foundationContent = {
  whyQuittingHard: {
    id: 'why-quitting-hard',
    title: 'Why Quitting is Hard',
    description: 'The neuroscience behind nicotine addiction',
    readTime: '5 min',
    difficulty: 'Beginner' as const,
    unlocked: true,
    sections: [
      {
        heading: "The Nicotine Trap",
        content: "Nicotine hijacks your brain's reward system by flooding it with dopamine—the same chemical released when we eat, have sex, or achieve goals. This creates a powerful association: smoking equals reward. Your brain begins to expect this dopamine hit, creating physical dependence that makes quitting feel impossible."
      },
      {
        heading: "Neural Pathway Formation",
        content: "Every time you smoke, you strengthen neural pathways that link smoking with pleasure, stress relief, and habit. After years of smoking, these pathways become superhighways in your brain. Understanding this isn't about weakness—it's neuroscience."
      },
      {
        heading: "Breaking the Cycle",
        content: "The good news? Your brain has neuroplasticity—it can rewire itself. Studies show significant improvements in just 72 hours of being smoke-free. New, healthier neural pathways can form while old smoking pathways weaken from disuse."
      }
    ],
    keyTakeaways: [
      "Addiction is a medical condition, not a character flaw",
      "Your brain can heal and rewire itself",
      "Cravings are temporary and will decrease over time",
      "Understanding the science helps reduce self-blame"
    ],
    relatedTools: ["panic-mode", "urge-timer"],
    references: [
      "Journal of Neuroscience, 2019: Nicotine Addiction and Brain Plasticity",
      "New England Journal of Medicine, 2020: Neurobiological Mechanisms of Smoking Cessation"
    ]
  },

  quitTimeline: {
    id: 'quit-timeline',
    title: 'What Happens When You Quit',
    description: 'Your body\'s recovery timeline',
    readTime: '7 min',
    difficulty: 'Beginner' as const,
    unlocked: true,
    sections: [
      {
        heading: "First 20 Minutes",
        content: "Your heart rate and blood pressure begin to normalize. The nicotine in your bloodstream starts to decrease, and your body begins the healing process immediately."
      },
      {
        heading: "12 Hours",
        content: "Carbon monoxide levels in your blood return to normal. Your blood oxygen levels increase, helping your organs function better."
      },
      {
        heading: "24-72 Hours",
        content: "Nicotine is completely eliminated from your body. Withdrawal symptoms peak during this time but then begin to improve. Your sense of taste and smell start to recover."
      },
      {
        heading: "2 Weeks to 3 Months",
        content: "Your circulation improves dramatically. Lung function increases by up to 30%. Walking becomes easier, and your immune system strengthens."
      },
      {
        heading: "1-9 Months",
        content: "Coughing and shortness of breath decrease. Tiny hair-like structures (cilia) in your lungs start to regain normal function, helping clear your lungs."
      },
      {
        heading: "1 Year",
        content: "Your risk of heart disease is cut in half compared to a current smoker. Your circulation and lung function continue to improve."
      }
    ],
    keyTakeaways: [
      "Healing begins within minutes of quitting",
      "The worst withdrawal symptoms last only 72 hours",
      "Significant health improvements occur within weeks",
      "Long-term benefits continue for years"
    ],
    relatedTools: ["breathwork", "daily-pledge"],
    references: [
      "American Heart Association: Timeline of Smoking Cessation Benefits",
      "CDC: Health Benefits of Quitting Smoking"
    ]
  },

  understandingCravings: {
    id: 'understanding-cravings',
    title: 'Understanding Cravings',
    description: 'How urges work and why they fade',
    readTime: '4 min',
    difficulty: 'Beginner' as const,
    unlocked: true,
    sections: [
      {
        heading: "The Nature of Cravings",
        content: "Cravings are like waves—they build, peak, and then crash. Most cravings last only 3-5 minutes. They feel intense because your brain is used to getting nicotine, but they will pass even if you do nothing."
      },
      {
        heading: "Triggers and Associations",
        content: "Cravings are often triggered by environmental cues: coffee, driving, stress, or social situations. Your brain has learned to associate these situations with smoking. Breaking these associations takes time but is completely achievable."
      },
      {
        heading: "The Urge Surfing Technique",
        content: "Instead of fighting cravings, try 'surfing' them. Acknowledge the urge, observe it without judgment, and remind yourself it will pass. Use this time to practice breathing exercises or engage in a healthy distraction."
      }
    ],
    keyTakeaways: [
      "Cravings are temporary—they peak and then fade",
      "Most cravings last only 3-5 minutes",
      "Triggers can be identified and managed",
      "You don't have to act on every urge"
    ],
    relatedTools: ["urge-timer", "breathwork", "panic-mode"],
    references: [
      "Psychology of Addictive Behaviors, 2018: Craving Patterns in Smoking Cessation",
      "Nicotine & Tobacco Research: Understanding Urge Surfing"
    ]
  }
};

// NRT Content
export const nrtContent = {
  options: {
    id: 'nrt-options',
    title: 'NRT Options Explained',
    description: 'Patches, gum, lozenges, and more',
    readTime: '8 min',
    difficulty: 'Intermediate' as const,
    unlocked: true,
    sections: [
      {
        heading: "Nicotine Patches",
        content: "Transdermal patches provide steady nicotine levels throughout the day. They're applied to clean, dry skin and replaced every 24 hours. Best for heavy smokers who smoke consistently throughout the day.",
        pros: ["Convenient once-daily application", "Steady nicotine levels", "Discreet", "Covers baseline nicotine needs"],
        cons: ["Skin irritation possible", "Cannot adjust dose quickly", "Some people have vivid dreams"]
      },
      {
        heading: "Nicotine Gum",
        content: "Allows you to control nicotine intake when cravings hit. Requires proper 'chew and park' technique—chew until you taste nicotine, then park between cheek and gum.",
        pros: ["Control timing and dose", "Helps with oral fixation", "Various flavors available", "Can be combined with patches"],
        cons: ["Jaw soreness possible", "Proper technique required", "Not suitable with dental work"]
      },
      {
        heading: "Nicotine Lozenges",
        content: "Dissolve slowly in the mouth to release nicotine. Good alternative to gum for people with dental issues. Comes in different strengths based on time to first cigarette.",
        pros: ["Easy to use", "Good for dental issues", "Discreet", "Various strengths"],
        cons: ["Can cause hiccups", "Slower onset than gum", "May cause mouth irritation"]
      },
      {
        heading: "Nicotine Inhaler",
        content: "Provides nicotine through the mouth and throat, mimicking the hand-to-mouth action of smoking. Requires frequent puffing throughout the day.",
        pros: ["Mimics smoking behavior", "Satisfies hand-to-mouth habit", "User-controlled dosing"],
        cons: ["Frequent dosing needed", "May irritate mouth/throat", "Less convenient in cold weather"]
      }
    ],
    keyTakeaways: [
      "Different NRT methods work for different people",
      "Combination therapy (patch + gum/lozenge) is often more effective",
      "Proper technique is crucial for effectiveness",
      "NRT is much safer than continued smoking"
    ],
    references: [
      "Cochrane Review: Nicotine Replacement Therapy for Smoking Cessation",
      "FDA Guidelines: Safe Use of Nicotine Replacement Products"
    ]
  },

  dosing: {
    id: 'nrt-dosing',
    title: 'Dosing Guidelines',
    description: 'Safe and effective usage',
    readTime: '6 min',
    difficulty: 'Advanced' as const,
    unlocked: false,
    unlockDays: 1,
    sections: [
      {
        heading: "Patch Dosing",
        content: "Start with 21mg for heavy smokers (>20 cigarettes/day), 14mg for moderate smokers (10-20/day), or 7mg for light smokers (<10/day). Step down every 2-4 weeks."
      },
      {
        heading: "Gum and Lozenge Dosing",
        content: "Use 4mg if you smoke within 30 minutes of waking, 2mg if you wait longer. Maximum 24 pieces per day. Use regularly for first few weeks, then gradually reduce."
      },
      {
        heading: "Combination Therapy",
        content: "Patch for baseline nicotine + gum/lozenge for breakthrough cravings. This approach doubles quit rates compared to single NRT use."
      }
    ],
    keyTakeaways: [
      "Start with appropriate dose based on smoking habits",
      "Combination therapy is more effective",
      "Gradual reduction prevents rebound cravings",
      "Follow healthcare provider guidance"
    ],
    references: [
      "Clinical Practice Guidelines: NRT Dosing Protocols",
      "Journal of Addiction Medicine: Combination NRT Efficacy"
    ]
  }
};

// Behavioral Strategies Content
export const behavioralContent = {
  triggers: {
    id: 'trigger-management',
    title: 'Trigger Management',
    description: 'Identifying and avoiding smoking cues',
    readTime: '10 min',
    difficulty: 'Intermediate' as const,
    unlocked: false,
    unlockDays: 3,
    sections: [
      {
        heading: "Identifying Your Triggers",
        content: "Common triggers include stress, alcohol, coffee, driving, work breaks, social situations, and specific emotions. Keep a trigger diary for the first week to identify patterns."
      },
      {
        heading: "Environmental Triggers",
        content: "Change your environment: remove ashtrays, lighters, and cigarette smell. Take different routes, sit in non-smoking sections, and avoid smoking areas initially."
      },
      {
        heading: "Emotional Triggers",
        content: "Develop new coping strategies for stress, anxiety, boredom, and celebration. Practice deep breathing, exercise, call a friend, or use relaxation techniques."
      },
      {
        heading: "Social Triggers",
        content: "Plan responses for social situations. Tell friends about your quit attempt, avoid smoking areas at parties, and have an exit strategy for difficult situations."
      }
    ],
    keyTakeaways: [
      "Triggers are learned associations that can be unlearned",
      "Environmental changes support mental changes",
      "Having a plan reduces trigger impact",
      "New coping strategies take time to develop"
    ],
    relatedTools: ["panic-mode", "breathwork", "urge-timer"],
    references: [
      "Behavior Research and Therapy: Trigger Management in Addiction",
      "Journal of Consulting Psychology: Environmental Cue Management"
    ]
  },

  stress: {
    id: 'stress-management',
    title: 'Stress Without Smoking',
    description: 'Alternative coping mechanisms',
    readTime: '8 min',
    difficulty: 'Intermediate' as const,
    unlocked: false,
    unlockDays: 7,
    sections: [
      {
        heading: "Understanding Stress Response",
        content: "Smoking doesn't actually reduce stress—it temporarily relieves nicotine withdrawal. True stress management involves addressing the root cause, not masking symptoms."
      },
      {
        heading: "Immediate Stress Relief",
        content: "Use the 4-7-8 breathing technique, progressive muscle relaxation, or quick physical movement. These provide immediate relief without harmful chemicals."
      },
      {
        heading: "Long-term Stress Management",
        content: "Develop sustainable practices: regular exercise, adequate sleep, healthy nutrition, meditation, and time management skills. These build genuine resilience."
      }
    ],
    keyTakeaways: [
      "Smoking masks stress rather than solving it",
      "Healthy coping skills are more effective long-term",
      "Stress management improves overall quit success",
      "Multiple strategies work better than single approaches"
    ],
    relatedTools: ["breathwork", "daily-pledge"],
    references: [
      "Health Psychology: Stress and Smoking Cessation",
      "Mindfulness Research: Alternative Stress Management"
    ]
  }
};

// Advanced Content
export const advancedContent = {
  longTerm: {
    id: 'long-term-success',
    title: 'Long-term Success Strategies',
    description: 'Preventing relapse after 6 months',
    readTime: '12 min',
    difficulty: 'Advanced' as const,
    unlocked: false,
    unlockDays: 30,
    sections: [
      {
        heading: "The Identity Shift",
        content: "Successful long-term quitters shift their identity from 'smoker trying to quit' to 'non-smoker.' This mental transition is crucial for lasting success."
      },
      {
        heading: "Handling Complacency",
        content: "After months of success, vigilance can decrease. Maintain awareness of triggers and continue using coping strategies even when they seem unnecessary."
      },
      {
        heading: "Social Support Systems",
        content: "Build and maintain connections with other non-smokers or successful quitters. Consider becoming a mentor to others starting their quit journey."
      }
    ],
    keyTakeaways: [
      "Identity change is key to long-term success",
      "Continued vigilance prevents relapse",
      "Helping others reinforces your own quit",
      "Success builds on itself over time"
    ],
    references: [
      "Addiction Science: Long-term Smoking Cessation Maintenance",
      "Psychology of Addictive Behaviors: Identity and Behavior Change"
    ]
  }
};

// Generate personalized NRT content based on user data
export const generatePersonalizedNRTContent = (quitData: any) => {
  const { usageAmount, substanceType, triggers } = quitData;
  
  let recommendation = "Based on your smoking pattern, here are personalized NRT recommendations:";
  
  if (usageAmount && usageAmount > 20) {
    recommendation += "\n\n**High Usage Pattern**: Consider starting with 21mg patches plus breakthrough gum or lozenges for cravings.";
  } else if (usageAmount && usageAmount > 10) {
    recommendation += "\n\n**Moderate Usage Pattern**: 14mg patches may be appropriate, with 2mg gum for breakthrough cravings.";
  } else {
    recommendation += "\n\n**Light Usage Pattern**: 7mg patches or gum/lozenges alone may be sufficient.";
  }
  
  if (triggers && triggers.includes('stress')) {
    recommendation += "\n\n**Stress Trigger**: Since stress is a trigger, consider gum or lozenges that allow you to actively manage cravings as they arise.";
  }
  
  if (triggers && triggers.includes('social')) {
    recommendation += "\n\n**Social Trigger**: Discreet options like patches or lozenges may work better in social situations.";
  }
  
  return {
    id: 'choosing-nrt',
    title: 'Choosing Your NRT',
    description: 'Personalized recommendations',
    readTime: '6 min',
    difficulty: 'Intermediate' as const,
    unlocked: true,
    personalized: true,
    sections: [
      {
        heading: "Your Personalized Recommendation",
        content: recommendation
      },
      {
        heading: "Next Steps",
        content: "Consult with your healthcare provider to finalize your NRT plan. They can provide prescriptions and monitor your progress."
      }
    ],
    keyTakeaways: [
      "Personalized NRT is more effective than one-size-fits-all",
      "Your smoking pattern guides NRT selection",
      "Healthcare provider consultation is recommended",
      "Combination therapy often works best"
    ],
    references: [
      "Personalized Medicine in Smoking Cessation",
      "Tailored NRT Approaches: Clinical Evidence"
    ]
  };
};

// Content Categories Configuration
export const getContentCategories = (daysSinceQuit: number, quitData: any): ContentCategory[] => [
  {
    id: 'foundation',
    title: 'Foundation',
    icon: '🧠',
    description: 'Essential knowledge for your quit journey',
    unlocked: true,
    articles: [
      foundationContent.whyQuittingHard,
      foundationContent.quitTimeline,
      foundationContent.understandingCravings
    ]
  },
  {
    id: 'nrt',
    title: 'NRT Guide',
    icon: '💊',
    description: 'Nicotine replacement therapy guidance',
    unlocked: true,
    articles: [
      nrtContent.options,
      generatePersonalizedNRTContent(quitData),
      {
        ...nrtContent.dosing,
        unlocked: daysSinceQuit >= 1
      }
    ]
  },
  {
    id: 'behavioral',
    title: 'Strategies',
    icon: '🎯',
    description: 'Behavioral tools and techniques',
    unlocked: daysSinceQuit >= 3,
    unlockDays: 3,
    articles: [
      {
        ...behavioralContent.triggers,
        unlocked: daysSinceQuit >= 3
      },
      {
        ...behavioralContent.stress,
        unlocked: daysSinceQuit >= 7
      }
    ]
  },
  {
    id: 'advanced',
    title: 'Advanced',
    icon: '🏆',
    description: 'Long-term success strategies',
    unlocked: daysSinceQuit >= 30,
    unlockDays: 30,
    articles: [
      {
        ...advancedContent.longTerm,
        unlocked: daysSinceQuit >= 30
      }
    ]
  }
];
