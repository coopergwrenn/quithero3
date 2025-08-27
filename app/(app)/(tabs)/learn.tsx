import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal, Dimensions, Animated, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '@/src/design-system/theme';
import { Card, Badge, Button } from '@/src/design-system/components';
import { useQuitStore } from '@/src/stores/quitStore';
import { analytics } from '@/src/services/analytics';

const { width } = Dimensions.get('window');

export default function LearnScreen() {
  const [selectedCategory, setSelectedCategory] = useState('quick-start');
  const [readArticles, setReadArticles] = useState(new Set());
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [showArticleModal, setShowArticleModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [bookmarkedArticles, setBookmarkedArticles] = useState(new Set());
  const [showBookmarks, setShowBookmarks] = useState(false);
  const { quitData } = useQuitStore();

  useEffect(() => {
    analytics.track('learn_tab_opened');
  }, []);

  const categories = [
    { id: 'quick-start', title: 'Quick Start', icon: '🚀' },
    { id: 'health', title: 'Health Recovery', icon: '🫁' },
    { id: 'nrt', title: 'NRT Guide', icon: '💊' },
    { id: 'science', title: 'Science', icon: '🧠' },
    { id: 'strategies', title: 'Strategies', icon: '🎯' }
  ];

  // Health Recovery Timeline Milestones with Personalization
  const getRecoveryMilestones = () => {
    const quitDate = quitData?.quitDate;
    const now = new Date();
    
    const timeSinceQuit = quitDate ? now.getTime() - new Date(quitDate).getTime() : 0;
    const minutesSinceQuit = Math.floor(timeSinceQuit / (1000 * 60));
    const hoursSinceQuit = Math.floor(timeSinceQuit / (1000 * 60 * 60));
    const daysSinceQuit = Math.floor(timeSinceQuit / (1000 * 60 * 60 * 24));
    const yearsSinceQuit = daysSinceQuit / 365;

    return [
      { 
        time: '20 minutes', 
        title: 'Heart Rate Normalizes', 
        description: 'Heart rate and blood pressure drop to normal levels',
        achieved: minutesSinceQuit >= 20,
        timeframe: 20 * 60 * 1000, // 20 minutes in milliseconds
        emoji: '❤️'
      },
      { 
        time: '12 hours', 
        title: 'Carbon Monoxide Clears', 
        description: 'CO levels drop, oxygen levels increase to normal',
        achieved: hoursSinceQuit >= 12,
        timeframe: 12 * 60 * 60 * 1000, // 12 hours
        emoji: '🫁'
      },
      { 
        time: '2 weeks', 
        title: 'Circulation Improves', 
        description: 'Circulation improves, lung function increases up to 30%',
        achieved: daysSinceQuit >= 14,
        timeframe: 14 * 24 * 60 * 60 * 1000, // 2 weeks
        emoji: '🩸'
      },
      { 
        time: '1 month', 
        title: 'Lung Function Boost', 
        description: 'Coughing and shortness of breath decrease significantly',
        achieved: daysSinceQuit >= 30,
        timeframe: 30 * 24 * 60 * 60 * 1000, // 1 month
        emoji: '💨'
      },
      { 
        time: '3 months', 
        title: 'Major Recovery', 
        description: 'Circulation dramatically improves, lung function increases',
        achieved: daysSinceQuit >= 90,
        timeframe: 90 * 24 * 60 * 60 * 1000, // 3 months
        emoji: '⚡'
      },
      { 
        time: '1 year', 
        title: 'Heart Disease Risk Halved', 
        description: 'Risk of coronary heart disease is cut in half',
        achieved: yearsSinceQuit >= 1,
        timeframe: 365 * 24 * 60 * 60 * 1000, // 1 year
        emoji: '💪'
      },
      { 
        time: '5 years', 
        title: 'Stroke Risk Normalized', 
        description: 'Stroke risk reduced to that of a non-smoker',
        achieved: yearsSinceQuit >= 5,
        timeframe: 5 * 365 * 24 * 60 * 60 * 1000, // 5 years
        emoji: '🧠'
      },
      { 
        time: '10 years', 
        title: 'Lung Cancer Risk Halved', 
        description: 'Lung cancer death rate is half that of a smoker',
        achieved: yearsSinceQuit >= 10,
        timeframe: 10 * 365 * 24 * 60 * 60 * 1000, // 10 years
        emoji: '🏆'
      },
      { 
        time: '15 years', 
        title: 'Full Recovery', 
        description: 'Heart disease risk is the same as a non-smoker',
        achieved: yearsSinceQuit >= 15,
        timeframe: 15 * 365 * 24 * 60 * 60 * 1000, // 15 years
        emoji: '👑'
      }
    ];
  };

  const quickStartContent = [
    {
      id: 'first-24-hours',
      title: 'Your First 24 Hours',
      readTime: '5 min read',
      preview: 'Essential survival guide for your first day smoke-free',
      content: `Your First 24 Hours Smoke-Free

Congratulations on taking the first step! The first 24 hours are crucial for setting the foundation of your quit journey.

What to Expect

Physical symptoms:
• Cravings every 15-30 minutes (lasting 3-5 minutes each)
• Slight anxiety or restlessness  
• Possible mild headache
• Increased appetite

Emotional symptoms:
• Mood swings
• Irritability
• Feeling of loss or grief
• Excitement about quitting

Hour-by-Hour Guide

Hours 1-4: The Decision Phase
• Cravings are manageable
• Focus on your reasons for quitting
• Remove all smoking materials from your environment

Hours 4-8: Peak Initial Withdrawal
• Cravings intensify
• Use your panic mode tool
• Stay busy with hands-on activities

Hours 8-16: Habit Disruption
• Strongest urges during usual smoking times
• Change your routine
• Avoid triggers when possible

Hours 16-24: First Milestone Approaching
• Physical symptoms peak then begin to fade
• Celebrate making it through the hardest part
• Plan rewards for completing day 1

Emergency Strategies

When cravings hit:
1. Use the 4-7-8 breathing technique
2. Drink cold water slowly
3. Go for a 5-minute walk
4. Call a supportive friend
5. Use your urge timer tool

Tips for Success

• Stay hydrated: Drink water every hour
• Keep hands busy: Stress ball, pen, toothpick
• Change environment: Avoid smoking areas
• Reward yourself: Plan something special for completing day 1

Remember: Every craving you overcome makes you stronger. You can do this!`
    },
    {
      id: 'week-1-survival',
      title: 'Week 1 Survival Guide', 
      readTime: '7 min read',
      preview: 'Navigate the most challenging week of your quit journey',
      content: `Week 1 Survival Guide

The first week is the most challenging but also the most important for long-term success.

Day 1-3: Peak Withdrawal
These are typically the hardest days as nicotine leaves your system.

What's happening in your body:
• Nicotine levels drop to zero
• Acetylcholine receptors are readjusting
• Dopamine production is irregular

Strategies:
• Use NRT if planned (patch, gum, lozenge)
• Stay extremely busy
• Avoid alcohol and caffeine late in day
• Go to bed early to avoid evening cravings

Day 4-7: Habit Reconstruction
Physical withdrawal eases, but psychological habits remain strong.

Focus areas:
• Breaking routine triggers
• Developing new coping mechanisms
• Building confidence in your quit

Daily activities:
• Morning: Set daily quit intention
• Afternoon: Practice breathing exercises
• Evening: Reflect on daily victories

Common Week 1 Challenges

"I can't concentrate"
• Normal - brain is readjusting to functioning without nicotine
• Try 10-minute focused work sessions
• Take frequent breaks
• Use peppermint tea or gum for mental clarity

"I'm incredibly irritable"
• Expected response to breaking addiction
• Warn family/friends in advance
• Practice patience with yourself
• Use physical exercise to release tension

Week 1 Milestones to Celebrate

• Day 1: You chose your health
• Day 2: Nicotine is leaving your system
• Day 3: You're through the hardest part
• Day 4: New habits are forming
• Day 5: You're proving you can do this
• Day 6: Almost at one week!
• Day 7: You're officially a non-smoker for a full week!

You're building the foundation for lifelong freedom. Every hour matters!`
    }
  ];

  const healthContent = [
    {
      id: 'recovery-timeline',
      title: 'Health Recovery Timeline',
      readTime: '6 min read', 
      preview: 'Discover how your body heals after quitting smoking',
      content: `Your Body's Amazing Recovery Timeline

Your body begins healing within minutes of your last cigarette. Here's the science-backed timeline:

Immediate Recovery (0-72 Hours)

20 Minutes:
• Heart rate drops to normal levels
• Blood pressure begins to decrease
• Circulation to hands and feet improves
• Body temperature of hands and feet increases

12 Hours:
• Carbon monoxide level drops to normal
• Blood oxygen level increases to normal
• Risk of heart attack begins to decrease

24 Hours:
• Anxiety peaks and then begins to decrease
• Chance of heart attack decreases significantly

48 Hours:
• Nerve endings begin to regenerate
• Sense of smell and taste start to improve
• Ability to smell and taste is enhanced

72 Hours:
• Bronchial tubes relax, breathing becomes easier
• Lung capacity increases
• Nicotine is completely eliminated from the body

Short-term Recovery (1 Week - 3 Months)

1 Week:
• Risk of relapse decreases significantly
• Confidence in quit ability increases
• Sleep patterns normalize

2 Weeks:
• Circulation continues to improve
• Walking becomes easier
• Lung function increases up to 30%
• Withdrawal symptoms largely subside

1 Month:
• Coughing and shortness of breath decrease
• Energy levels increase noticeably
• Immune system function improves
• Risk of infection decreases

3 Months:
• Circulation improves significantly
• Lung function increases by up to 30%
• Cough and breathing problems continue to improve
• Overall physical fitness improves

Long-term Recovery (1+ Years)

1 Year:
• Risk of coronary heart disease is cut in half
• Risk of stroke decreases significantly
• Lung function and circulation improve dramatically
• Cancer risk begins to decrease

5 Years:
• Risk of stroke reduces to that of non-smokers
• Risk of mouth, throat, esophagus, and bladder cancer is cut in half
• Cervical cancer risk falls to that of non-smokers

10 Years:
• Risk of lung cancer falls to half that of smokers
• Risk of pancreatic and kidney cancer decreases significantly
• Pre-cancerous cells are replaced with healthy cells

15 Years:
• Risk of coronary heart disease equals that of non-smokers
• Risk of death returns to nearly the level of people who have never smoked
• Life expectancy approaches that of non-smokers

What You Can Do to Accelerate Healing

Nutrition:
• Eat antioxidant-rich foods (berries, leafy greens)
• Increase vitamin C intake
• Stay hydrated with 8+ glasses of water daily
• Reduce inflammatory foods

Exercise:
• Start with light cardio (walking, swimming)
• Focus on breathing exercises
• Gradually increase intensity as lung function improves
• Include strength training after first month

Environment:
• Avoid secondhand smoke completely
• Use air purifiers if possible
• Spend time in clean, outdoor air
• Avoid other pollutants when possible

Your body is incredibly resilient and wants to heal. Every day smoke-free is a gift to your future self!`
    }
  ];

  const nrtContent = [
    {
      id: 'nrt-guide',
      title: 'Complete NRT Guide',
      readTime: '10 min read',
      preview: 'Everything you need to know about nicotine replacement therapy',
      content: `Complete Guide to Nicotine Replacement Therapy (NRT)

MEDICAL DISCLAIMER: This information is for educational purposes only. Always consult your healthcare provider before starting any NRT. This is not a substitute for professional medical advice.

What is NRT?

Nicotine Replacement Therapy provides controlled doses of nicotine without the harmful chemicals found in cigarettes. It helps manage withdrawal symptoms while you break behavioral habits.

Types of NRT

Nicotine Patches
• Deliver steady nicotine through skin over 16-24 hours
• Reduce overall withdrawal symptoms
• Most convenient option - apply once daily

Dosing guidelines:
• 21mg patch: For heavy smokers (20+ cigarettes/day)
• 14mg patch: For moderate smokers (10-19 cigarettes/day)
• 7mg patch: For light smokers (<10 cigarettes/day) or step-down

Step-down protocol:
• Start with appropriate dose for 6-8 weeks
• Step down to next lower dose for 2-4 weeks
• Step down to lowest dose for 2-4 weeks
• Total treatment: 10-16 weeks

Nicotine Gum
• Fast-acting nicotine absorption through mouth lining
• User controls timing and amount
• Helps with hand-to-mouth habit

Dosing:
• 4mg gum: For heavy smokers or strong cravings
• 2mg gum: For light-moderate smokers

Proper technique:
• Chew slowly until peppery taste appears
• "Park" between cheek and gum for 20-30 minutes
• Do NOT continuously chew like regular gum
• Avoid eating/drinking 15 minutes before and during use

Nicotine Lozenges
• Dissolve slowly in mouth for steady nicotine release
• No chewing required
• Discrete and convenient

Dosing:
• 4mg lozenge: If you smoke within 30 minutes of waking
• 2mg lozenge: If you smoke more than 30 minutes after waking

Combination Therapy

Patch + Fast-Acting NRT:
• Patch provides steady baseline nicotine
• Gum/lozenge handles breakthrough cravings
• Studies show 15-25% higher success rates
• Always consult healthcare provider first

Choosing the Right NRT

Consider patches if you:
• Want convenience (once daily)
• Have steady cravings throughout day
• Don't want to think about timing
• Have jaw problems preventing gum use

Consider gum/lozenges if you:
• Have irregular smoking patterns
• Want control over timing and dose
• Have skin sensitivity to patches
• Need help with hand-to-mouth habit

Success Tips

• Start on quit day: Don't wait for cravings to begin
• Use full recommended duration: Don't stop early
• Combine with behavioral support: Apps, counseling, support groups
• Be patient: NRT reduces but doesn't eliminate all cravings
• Step down gradually: Sudden stopping may trigger relapse

Remember: NRT is a tool, not a magic cure. Success rates double when NRT is used properly compared to willpower alone!`
    },
    {
      id: 'nicotine-gum-masterclass',
      title: 'Nicotine Gum Masterclass',
      readTime: '6 min read',
      preview: 'Complete guide to using nicotine gum effectively',
      content: `# Nicotine Gum Masterclass

## ⚠️ Medical Disclaimer
This information is for educational purposes only. Always consult your healthcare provider before starting nicotine gum. Individual needs vary based on medical history and smoking patterns.

## Understanding Nicotine Gum

### How It Works
- 🎯 **Fast-acting relief** - nicotine absorbed through mouth lining
- ⏱️ **User-controlled dosing** - you decide when and how much
- 🤲 **Satisfies hand-to-mouth habit** - helps behavioral aspects

### Choosing Your Strength

**4mg Gum (Higher Strength):**
- Heavy smokers (20+ cigarettes/day)
- First cigarette within 30 minutes of waking
- Strong, frequent cravings
- Previous quit attempts with 2mg were insufficient

**2mg Gum (Regular Strength):**
- Light to moderate smokers (<20 cigarettes/day)
- First cigarette 30+ minutes after waking
- Mild to moderate cravings
- Concerned about side effects

## The Proper Technique (Critical for Success!)

### Step-by-Step Method
1. **Chew slowly** until you taste pepper or feel tingling
2. **STOP chewing** immediately when you taste nicotine
3. **"Park" the gum** between your cheek and gum
4. **Wait 20-30 minutes** while nicotine absorbs
5. **Chew again briefly** when taste fades
6. **Repeat park-and-chew cycle** for up to 30 minutes
7. **Dispose after 30 minutes** - no more nicotine left

### ❌ Common Mistakes That Reduce Effectiveness
- **Continuous chewing** (like regular gum) - causes stomach upset
- **Swallowing nicotine juice** - reduces absorption, causes nausea
- **Eating/drinking** 15 minutes before or during use
- **Using too few pieces** per day
- **Stopping too quickly** before habit change is complete

## Dosing Schedule

### Week 1-6: Full Strength
- **Heavy smokers**: 1 piece every 1-2 hours (max 24 pieces/day)
- **Moderate smokers**: 1 piece every 2-3 hours (max 20 pieces/day)
- **Light smokers**: 1 piece every 3-4 hours (max 12 pieces/day)

### Week 7-9: Reduce Frequency
- Gradually increase time between pieces
- Aim for 50% reduction in daily pieces
- Use during highest craving times

### Week 10-12: Taper Off
- Use only during strong cravings
- Switch to lower strength if needed
- Complete cessation by week 12

## Maximizing Success

### Timing Tips
- 🌅 **First piece** within 1 hour of usual first cigarette
- 🍽️ **Before meals** - when cravings often spike
- ☕ **With coffee breaks** - replace smoking ritual
- 🚗 **Before driving** - common trigger time
- 📞 **During phone calls** - habitual smoking time

### Side Effects Management
**Common (Usually Mild):**
- Mouth/jaw soreness - chew more slowly, use less force
- Hiccups - chewing too fast, park gum longer
- Heartburn - avoid on empty stomach
- Dizziness - using too much, reduce frequency

**When to Contact Doctor:**
- Severe nausea or vomiting
- Irregular heartbeat
- Severe jaw pain
- Allergic reactions (rash, swelling)

## Cost-Effectiveness Tips

### Making It Affordable
- 💰 **Generic brands** work just as well as name brands
- 🏪 **Bulk purchasing** reduces per-piece cost
- 🎫 **Manufacturer coupons** often available online
- 🏥 **Insurance coverage** - check with your plan
- 📊 **Compare to smoking costs** - still much cheaper!

### Budget Planning
- **4mg gum**: ~$50-80/month for heavy smokers
- **2mg gum**: ~$30-50/month for moderate smokers
- **Compare to smoking**: Average smoker spends $200+/month
- **Net savings**: $120-150/month while quitting!

## Success Strategies

### Combination Approaches
- **Patch + Gum**: Steady baseline (patch) + breakthrough relief (gum)
- **Behavioral support**: Counseling increases success rates
- **Mobile apps**: Track usage and savings
- **Support groups**: Online or in-person communities

### Troubleshooting Common Issues

**"The gum doesn't work for me"**
- ✅ Check your technique (most important!)
- ✅ Increase frequency or strength
- ✅ Try combination with patch
- ✅ Consider lozenges instead

**"I'm using too much gum"**
- ✅ Better than smoking! Gradually reduce
- ✅ Set daily limits and track usage
- ✅ Use behavioral distractions
- ✅ Combine with patch for baseline relief

**"I can't stop the gum"**
- ✅ Reduce strength to 2mg first
- ✅ Gradual tapering over 2-4 weeks
- ✅ Replace with sugar-free gum temporarily
- ✅ Address underlying anxiety/stress

## Key Success Factors

1. **Proper technique** - makes or breaks effectiveness
2. **Adequate dosing** - don't under-dose
3. **Consistent use** - especially first 6 weeks
4. **Gradual reduction** - avoid sudden stopping
5. **Behavioral support** - address habits too

Remember: Nicotine gum is a **medical treatment**, not candy. Used properly, it can double your chances of successfully quitting smoking!

---
⚠️ **Always consult your healthcare provider before starting NRT, especially if you have heart conditions, high blood pressure, diabetes, or are pregnant/nursing.**`
    },
    {
      id: 'patch-progression-protocol',
      title: 'Patch Progression Protocol',
      readTime: '5 min read',
      preview: 'Step-by-step guide to using nicotine patches effectively',
      content: `# Patch Progression Protocol

## ⚠️ Medical Disclaimer
Consult your healthcare provider before starting nicotine patches, especially if you have heart conditions, skin sensitivities, or take medications. This is educational information only.

## Understanding Nicotine Patches

### How Patches Work
- 🔄 **Steady nicotine delivery** through skin absorption
- ⏱️ **24-hour or 16-hour options** available
- 📈 **Prevents withdrawal symptoms** with consistent levels
- 🎯 **Reduces cravings** throughout the day

## Choosing Your Starting Strength

### Patch Strength Selection

**21mg Patch (Step 1):**
- Heavy smokers: 20+ cigarettes per day
- First cigarette within 30 minutes of waking
- Smoke throughout the day consistently
- Strong physical dependence

**14mg Patch (Step 2):**
- Moderate smokers: 10-19 cigarettes per day
- First cigarette 30-60 minutes after waking
- Some smoke-free periods during day
- Moderate dependence

**7mg Patch (Step 3):**
- Light smokers: <10 cigarettes per day
- First cigarette 1+ hours after waking
- Can go hours without smoking
- Primarily habitual smoking

## The 8-Week Progression Protocol

### Phase 1: Weeks 1-4 (Starting Strength)
**21mg → 21mg → 21mg → 21mg**
- Apply same strength for 4 full weeks
- Allow body to adjust to steady nicotine levels
- Focus on breaking behavioral habits
- Don't reduce too quickly

### Phase 2: Weeks 5-6 (Step Down)
**21mg → 14mg** or **14mg → 7mg**
- Reduce to next lower strength
- May experience mild withdrawal - this is normal
- Use breakthrough NRT (gum/lozenge) if needed
- Continue for 2 weeks minimum

### Phase 3: Weeks 7-8 (Final Step)
**14mg → 7mg** or **7mg → 0mg**
- Final strength reduction
- Prepare for patch-free life
- Have backup plan for strong cravings
- Complete cessation by week 8

## Proper Application Technique

### Daily Application
1. **Choose clean, dry, hairless skin** (upper arm, chest, back)
2. **Rotate application sites** daily to prevent irritation
3. **Press firmly for 10-15 seconds** to ensure adhesion
4. **Apply at same time daily** for consistent levels
5. **Remove old patch** before applying new one

### Site Rotation Schedule
- **Day 1**: Right upper arm
- **Day 2**: Left upper arm  
- **Day 3**: Right chest/shoulder
- **Day 4**: Left chest/shoulder
- **Day 5**: Upper back (if reachable)
- **Day 6**: Return to right arm (different spot)

### 16-Hour vs 24-Hour Patches

**24-Hour Patches:**
- ✅ Continuous protection, including sleep
- ✅ Convenient - no daily removal
- ❌ May cause sleep disruption/vivid dreams
- ❌ Slightly higher side effect risk

**16-Hour Patches:**
- ✅ Removed at bedtime - better sleep
- ✅ Mimics natural daily smoking pattern
- ❌ No morning craving protection
- ❌ Daily removal/application routine

## Managing Side Effects

### Common Side Effects (Usually Mild)
**Skin Irritation:**
- Rotate application sites daily
- Clean skin before application
- Remove if severe redness/rash develops
- Try different brand if persistent

**Sleep Issues:**
- Switch to 16-hour patches
- Remove patch 1-2 hours before bed
- Practice good sleep hygiene
- Consider lower strength

**Vivid Dreams:**
- Normal side effect for many users
- Usually decreases after 1-2 weeks
- Remove patch before bed if bothersome
- Keep dream journal if concerning

### When to Contact Healthcare Provider
- Severe skin allergic reactions
- Chest pain or irregular heartbeat
- Persistent nausea or dizziness
- Severe sleep disruption >1 week

## Combination Therapy Options

### Patch + Short-Acting NRT
**Why Combine:**
- Patch provides steady baseline nicotine
- Gum/lozenge handles breakthrough cravings
- Higher success rates than patch alone
- Addresses different aspects of addiction

**Recommended Combinations:**
- **21mg patch + 2mg gum** (heavy smokers)
- **14mg patch + 2mg lozenges** (moderate smokers)
- **7mg patch + 2mg gum** (light smokers)

## Cost and Insurance

### Making Patches Affordable
- 💰 **Generic versions** available at lower cost
- 🏥 **Insurance coverage** - check your benefits
- 🎫 **Manufacturer rebates** and pharmacy discounts
- 🏪 **Bulk purchasing** reduces per-patch cost

### Monthly Cost Estimates
- **Name brand**: $120-150/month
- **Generic**: $80-120/month
- **With insurance**: $20-50/month
- **Compare to smoking**: Still 50-70% savings!

## Troubleshooting Common Issues

**"Patches keep falling off"**
- ✅ Ensure skin is completely clean and dry
- ✅ Press firmly for full 15 seconds
- ✅ Avoid lotions/oils before application
- ✅ Try different brand with better adhesive

**"Not controlling my cravings"**
- ✅ May need higher starting strength
- ✅ Add breakthrough NRT (gum/lozenge)
- ✅ Ensure proper application technique
- ✅ Address behavioral aspects too

**"I want to quit patches early"**
- ✅ Follow full 8-week protocol for best results
- ✅ Gradual reduction prevents rebound cravings
- ✅ Have support plan before stopping
- ✅ Consider extended low-dose use if needed

## Success Tips

1. **Start on quit day** - don't wait
2. **Follow full protocol** - resist urge to rush
3. **Address habits separately** - patches handle physical addiction
4. **Track your progress** - celebrate milestones
5. **Have backup plan** - keep breakthrough NRT available

Remember: Patches work best when combined with behavioral support and proper technique. They're a proven method that can double your chances of success!

---
⚠️ **Do not smoke while using patches. This can cause nicotine overdose. If you slip and smoke, remove patch immediately and wait 24 hours before reapplying.**`
    }
  ];

  const scienceContent = [
    {
      id: 'how-addiction-works',
      title: 'How Nicotine Addiction Works',
      readTime: '8 min read',
      preview: 'Understanding the brain science behind nicotine addiction',
      content: `# How Nicotine Addiction Works

## The Brain Science Behind Addiction

Understanding **why** nicotine is so addictive helps you understand that quitting isn't about willpower—it's about **rewiring your brain**.

## What Happens in Your Brain

### The Reward Pathway
When you smoke, nicotine reaches your brain in **10-20 seconds**—faster than intravenous drugs. Here's what happens:

1. **Nicotine binds** to acetylcholine receptors
2. **Dopamine floods** the nucleus accumbens (reward center)
3. **Brain registers** this as "extremely important for survival"
4. **Memory forms** linking smoking with reward

### The Addiction Cycle

**Phase 1: Initial Reward**
- 🧠 Brain: "This feels amazing!"
- 📈 Dopamine spikes dramatically
- 🎯 Strong positive association forms
- 🔄 Behavior reinforced powerfully

**Phase 2: Tolerance Development**
- 📉 Brain reduces natural dopamine production
- 🔢 More nicotine needed for same effect
- ⬆️ Smoking frequency increases
- 🔄 "Normal" now requires nicotine

**Phase 3: Physical Dependence**
- 🧠 Brain structure changes permanently
- 📊 Nicotine receptors multiply (up to 300% more!)
- ⚖️ Without nicotine, brain chemistry imbalanced
- 😰 Withdrawal symptoms emerge

## Why Nicotine Is So Uniquely Addictive

### Multiple Brain Systems Affected

**Dopamine System (Reward):**
- Makes smoking feel rewarding
- Creates powerful motivation to smoke
- Responsible for cravings

**Acetylcholine System (Learning):**
- Enhances memory formation
- Links smoking to situations/emotions
- Creates automatic habits

**GABA System (Relaxation):**
- Nicotine provides artificial relaxation
- Brain reduces natural calm chemicals
- Anxiety increases without nicotine

**Norepinephrine System (Alertness):**
- Nicotine improves focus temporarily
- Brain becomes dependent for concentration
- Mental fog during withdrawal

### Speed of Delivery Matters
- **Cigarettes**: 10-20 seconds to brain
- **Patches**: 1-2 hours to peak levels
- **Gum**: 20-30 minutes to peak levels

**Why this matters**: Faster delivery = stronger addiction potential

## The Habit Formation Process

### Neuroplasticity and Smoking
Your brain is constantly **rewiring** itself based on repeated behaviors. With smoking:

**Trigger → Routine → Reward**
- 🚨 **Trigger**: Stress, coffee, break time
- 🚬 **Routine**: Smoke cigarette
- 🎉 **Reward**: Temporary relief/pleasure

**After thousands of repetitions:**
- Pathways become "superhighways"
- Response becomes automatic
- Conscious thought not required

### Why "Just Don't Think About It" Doesn't Work
- 🧠 Subconscious brain controls 95% of decisions
- 🔄 Habit pathways are deeply ingrained
- ⚡ Triggers activate before conscious awareness
- 🎯 Need active rewiring, not just avoidance

## Individual Differences in Addiction

### Genetic Factors (40-50% of addiction risk)
**CYP2A6 Gene:**
- Controls nicotine metabolism speed
- Slow metabolizers: Less addicted, easier to quit
- Fast metabolizers: More addicted, need higher doses

**DRD2 Gene:**
- Affects dopamine receptor density
- Fewer receptors = higher addiction risk
- More receptors = better natural mood regulation

**CHRNA5 Gene:**
- Affects nicotine receptor sensitivity
- Variants linked to heavy smoking
- May need different quit strategies

### Environmental Factors
**Early Exposure:**
- 🧒 Starting before age 18 = 3x addiction risk
- 🧠 Adolescent brain more vulnerable
- 📈 Earlier start = stronger addiction

**Stress and Trauma:**
- 😰 High stress increases addiction risk
- 🔄 Nicotine becomes primary coping mechanism
- 💪 Need alternative stress management

**Social Environment:**
- 👥 Smoking friends/family increase difficulty
- 🏠 Smoke-free environments help recovery
- 🎭 Social identity tied to smoking

## Why Quitting Is So Hard

### Physical Withdrawal
**Timeline of Changes:**
- **Hours 1-3**: Nicotine levels drop rapidly
- **Hours 4-24**: Withdrawal symptoms peak
- **Days 2-3**: Most difficult period
- **Week 1**: Physical symptoms improve
- **Weeks 2-4**: Psychological adjustment
- **Months 1-12**: Brain continues rebalancing

### Psychological Dependence
**Learned Associations:**
- ☕ Coffee = cigarette
- 📞 Phone calls = cigarette  
- 😠 Stress = cigarette
- 🚗 Driving = cigarette

**Identity Issues:**
- "I am a smoker" vs "I used to smoke"
- Loss of smoking as stress relief
- Social identity changes
- Fear of weight gain

## The Good News: Your Brain Can Heal

### Neuroplasticity Works Both Ways
- 🔄 Same process that created addiction can reverse it
- 🧠 New pathways can be stronger than old ones
- ⏱️ Takes time but changes are permanent
- 💪 Each day smoke-free strengthens new patterns

### Recovery Timeline
**Week 1**: Acute withdrawal subsides
**Month 1**: New routines becoming automatic
**Month 3**: Significant reduction in cravings
**Year 1**: New identity as non-smoker solidifies
**Year 2+**: Old smoking patterns largely overwritten

### Strategies That Work With Your Brain

**Replace Rewards:**
- 🏃 Exercise releases natural dopamine
- 🧘 Meditation calms GABA system
- 🎵 Music activates reward pathways
- 🤗 Social connection releases oxytocin

**Rewire Habits:**
- 🔄 Keep triggers, change routines
- ⏱️ Practice new responses repeatedly
- 🎯 Make new behaviors more rewarding
- 📱 Use apps to track progress

**Support Brain Chemistry:**
- 🥗 Nutrition affects neurotransmitter production
- 😴 Sleep allows brain repair and consolidation
- 💧 Hydration maintains optimal brain function
- 💊 Consider NRT to ease transition

## Understanding = Empowerment

Knowing that addiction is a **brain disease**, not a character flaw, helps you:
- 🚫 Reduce self-blame and shame
- 🎯 Choose evidence-based treatments
- 🛠️ Use tools that work with brain science
- 💪 Maintain motivation during difficult times

Remember: Your brain **wants** to heal. Addiction hijacked natural reward systems, but recovery restores them to healthy function.

Every day smoke-free is literally **rewiring your brain** back to its natural, healthy state!`
    },
    {
      id: 'understanding-withdrawal',
      title: 'Understanding Withdrawal',
      readTime: '6 min read',
      preview: 'The science behind withdrawal symptoms and how to manage them',
      content: `# Understanding Withdrawal

## What Is Withdrawal Really?

Withdrawal isn't punishment for smoking—it's your **brain healing** and returning to its natural, healthy state. Understanding the science helps you work **with** your body during recovery.

## The Neurochemical Explanation

### Your Brain on Nicotine
After years of smoking, your brain has made major adaptations:

**Receptor Changes:**
- 🔢 **300% more** nicotine receptors than normal
- 📉 **Reduced natural** dopamine production
- ⚖️ **Chemical imbalance** without nicotine
- 🧠 **Structural changes** in reward pathways

### What Happens When You Quit
**Hour 1-3: Nicotine Depletion**
- 📉 Blood nicotine levels drop rapidly
- 🧠 Brain notices missing nicotine
- 🚨 Stress response activates
- 😰 First cravings begin

**Hours 4-24: Peak Physical Withdrawal**
- ⚡ All brain systems affected simultaneously
- 📈 Stress hormones spike
- 🔥 Inflammatory response increases
- 💥 Symptoms reach maximum intensity

**Days 2-3: The Peak**
- 🧠 Brain working hardest to rebalance
- 😵 Most intense psychological symptoms
- 🎢 Extreme mood swings common
- 🔄 Critical period for relapse risk

## Timeline of Withdrawal Symptoms

### Physical Symptoms

**Hours 1-4:**
- 🫁 Breathing feels different
- 💓 Heart rate changes
- 🤲 Restless hands
- 😶 Dry mouth

**Hours 4-24:**
- 🤕 Headaches (blood vessels readjusting)
- 😴 Fatigue (brain working overtime)
- 🤧 Increased cough (lungs clearing)
- 🥵 Temperature regulation issues

**Days 2-7:**
- 💩 Constipation (digestive system adjusting)
- 😵‍💫 Dizziness (circulation improving)
- 🦷 Mouth sores (immune system changes)
- 🛌 Sleep disruption (brain chemistry shifting)

**Weeks 2-4:**
- 📈 Gradual improvement in all areas
- ⚡ Energy levels recovering
- 😴 Sleep patterns normalizing
- 🧠 Concentration returning

### Psychological Symptoms

**The Emotional Rollercoaster:**
- 😠 **Irritability**: Stress response amplified
- 😰 **Anxiety**: Brain's alarm system hyperactive
- 😢 **Depression**: Dopamine system recovering
- 🤯 **Brain fog**: Neurotransmitter rebalancing

**Why Emotions Are So Intense:**
- 🧠 Emotional regulation centers affected
- 🔄 Brain learning new response patterns
- ⚖️ Chemical systems finding new balance
- 💪 Psychological adjustment to new identity

## The Science of Cravings

### What Triggers a Craving?
**Environmental Cues:**
- 👁️ Visual: Seeing cigarettes, ashtrays
- 👃 Smell: Tobacco smoke, certain perfumes
- 🎵 Auditory: Lighters clicking, music associated with smoking
- 🤲 Tactile: Holding pens, coffee cups

**Internal Cues:**
- 😰 Emotional states (stress, boredom, anger)
- ⏰ Time-based (break times, after meals)
- 🏠 Location-based (car, balcony, bar)
- 👥 Social situations (parties, work breaks)

### The Craving Wave
**Minute 1:** Initial trigger recognition
**Minutes 2-3:** Intensity builds rapidly  
**Minutes 3-5:** Peak intensity (feels overwhelming)
**Minutes 5-7:** Intensity begins to fade
**Minutes 7-10:** Craving substantially reduced
**After 10 minutes:** Back to baseline

**Key insight**: Cravings are **temporary waves**, not permanent states!

## Why Some People Have Easier Withdrawals

### Genetic Factors
**Fast vs Slow Nicotine Metabolizers:**
- 🐌 **Slow metabolizers**: Milder withdrawal, nicotine stays longer
- 🏃 **Fast metabolizers**: More intense withdrawal, rapid clearance

**Dopamine Receptor Variants:**
- 🧠 More natural receptors = easier emotional regulation
- 📉 Fewer receptors = more severe mood symptoms

### Lifestyle Factors
**Exercise History:**
- 🏃 Regular exercisers: Better stress management
- 📈 Higher natural dopamine production
- 💪 Stronger stress resilience

**Stress Levels:**
- 😌 Low baseline stress = easier withdrawal
- 😰 High chronic stress = more severe symptoms

**Support Systems:**
- 👥 Strong social support = better outcomes
- 🏠 Supportive environment = reduced trigger exposure

## Managing Withdrawal Effectively

### Work With Your Brain Chemistry

**Support Dopamine Production:**
- 🏃 **Exercise**: Natural dopamine release
- 🎵 **Music**: Activates reward pathways
- ✅ **Small accomplishments**: Build confidence
- 🤗 **Social connection**: Oxytocin release

**Calm Stress Response:**
- 🧘 **Deep breathing**: Activates parasympathetic nervous system
- 🛁 **Warm baths**: Physical relaxation
- 🌱 **Nature exposure**: Reduces cortisol
- 😴 **Adequate sleep**: Brain repair and consolidation

**Stabilize Blood Sugar:**
- 🍎 **Regular meals**: Prevents mood swings
- 🥜 **Protein snacks**: Steady energy
- 💧 **Hydration**: Supports all brain functions
- 🚫 **Limit caffeine**: Reduces anxiety

### The WAVE Technique for Cravings

**W - Wait**: Don't act immediately
**A - Acknowledge**: "I'm having a craving"
**V - Visualize**: The wave building and then falling
**E - Engage**: In a distracting activity

### Breakthrough Strategies

**Physical Movement:**
- 🚶 5-minute walk
- 🤸 Stretching routine
- 🤲 Hand exercises
- 🫁 Deep breathing

**Mental Distraction:**
- 📱 Call a friend
- 🧩 Puzzle or game
- 📖 Read something engaging
- 📝 Write in journal

**Sensory Replacement:**
- 🥤 Cold water
- 🍃 Mint toothpick
- 🧊 Ice cube
- 🌿 Essential oils

## When to Seek Additional Help

### Normal vs Concerning Symptoms

**Normal (Temporary):**
- Mood swings and irritability
- Sleep disruption for 1-2 weeks
- Increased appetite
- Difficulty concentrating

**Seek Help For:**
- 😰 Severe anxiety or panic attacks
- 😢 Persistent depression >2 weeks
- 💔 Thoughts of self-harm
- 🔄 Multiple failed quit attempts

### Professional Support Options
- 👨‍⚕️ **Primary care physician**: Medical supervision
- 🧠 **Mental health counselor**: Emotional support
- 📞 **Quitlines**: Free telephone counseling
- 👥 **Support groups**: Peer understanding

## The Light at the End of the Tunnel

### Recovery Milestones
**Week 1**: "I survived the worst part"
**Month 1**: "This is getting easier"
**Month 3**: "I rarely think about smoking"
**Year 1**: "I can't believe I ever smoked"

### Brain Healing Timeline
- **72 hours**: Nicotine completely cleared
- **2 weeks**: Circulation dramatically improved
- **1 month**: Brain fog lifting significantly
- **3 months**: Major neurochemical rebalancing
- **1 year**: New neural pathways strongly established

Remember: **Every difficult moment is your brain healing**. Withdrawal symptoms aren't signs that something is wrong—they're signs that everything is going **right**!

You're not just quitting smoking; you're **reclaiming your natural brain chemistry** and returning to the person you were meant to be.`
    }
  ];

  const strategiesContent = [
    {
      id: 'trigger-management-master',
      title: 'Trigger Management Master Guide',
      readTime: '8 min read',
      preview: 'Complete system for identifying and managing smoking triggers',
      content: `# Trigger Management Master Guide

## Understanding Your Triggers

Triggers are **automatic cues** that make you want to smoke. They're not character flaws - they're learned responses that can be **unlearned and replaced**.

## The 4 Types of Triggers

### 1. Environmental Triggers
**Physical locations and objects:**
- 🚗 **Car** - driving, traffic, commuting
- 🏠 **Specific rooms** - balcony, kitchen, bathroom
- ☕ **Coffee shops** - smell and atmosphere
- 🍺 **Bars and restaurants** - social smoking areas
- 📱 **Smoking paraphernalia** - lighters, ashtrays

**Weather and time:**
- 🌤️ **Nice weather** - wanting to be outside
- ❄️ **Cold mornings** - warming up routine
- 🌅 **Specific times** - morning coffee, lunch break
- 🌙 **Evening wind-down** - end of day ritual

### 2. Emotional Triggers
**Negative emotions:**
- 😰 **Stress** - work pressure, deadlines
- 😠 **Anger** - frustration, conflict
- 😢 **Sadness** - grief, depression, loneliness
- 😴 **Boredom** - nothing to do, restlessness
- 😨 **Anxiety** - nervousness, panic

**Positive emotions:**
- 🎉 **Celebration** - achievements, parties
- 😌 **Relaxation** - after accomplishing something
- 😊 **Happiness** - good news, social connection
- 💪 **Confidence** - feeling in control

### 3. Social Triggers
**People and situations:**
- 👥 **Smoking friends** - peer pressure, habit
- 🍻 **Drinking** - alcohol lowers inhibition
- 📞 **Phone calls** - hand-to-mouth habit
- 💼 **Work breaks** - social smoking time
- 🎭 **Social events** - parties, networking

**Relationship dynamics:**
- 💔 **Relationship stress** - arguments, breakups
- 👨‍👩‍👧‍👦 **Family gatherings** - traditional smoking times
- 💼 **Work pressure** - colleague smoking breaks

### 4. Physical Triggers
**Bodily sensations:**
- ☕ **After eating** - digestive routine
- 😴 **Fatigue** - energy boost seeking
- 🤲 **Restless hands** - need something to do
- 🫁 **Deep breathing urge** - mistaking for smoking need
- 💊 **Withdrawal symptoms** - mistaking for triggers

## The STOP-THINK-ACT Method

### STOP (Pause Response)
When you notice a trigger:
- 🛑 **Freeze** - don't act immediately
- 🧘 **Take 3 deep breaths**
- ⏰ **Count to 10** slowly
- 🎯 **Acknowledge**: "I'm being triggered"

### THINK (Analyze Situation)
Ask yourself:
- 🤔 **What exactly triggered me?** (specific identification)
- 😰 **What am I really feeling?** (emotion beneath urge)
- 🎯 **What do I actually need?** (real need vs smoking)
- 💪 **What's my healthier option?** (alternative response)

### ACT (Execute Alternative)
Choose your response:
- 🏃 **Physical** - walk, stretch, exercise
- 🧠 **Mental** - call friend, read, puzzle
- 🎨 **Creative** - draw, write, music
- 🧘 **Mindful** - meditate, breathe, observe

## Specific Trigger Strategies

### Stress Triggers
**Immediate Response (0-5 minutes):**
- 🫁 **4-7-8 breathing** - inhale 4, hold 7, exhale 8
- 🚶 **Walk outside** - change environment
- 💧 **Cold water** - drink slowly, splash face
- 📱 **Text a friend** - quick support

**Medium-term (5-30 minutes):**
- 🏃 **Physical exercise** - jog, yoga, stretching
- 🎵 **Music therapy** - calming or energizing playlist
- 📝 **Journal** - write out stressors
- 🛁 **Relaxation** - hot shower, bath

**Long-term (daily practice):**
- 🧘 **Meditation** - 10 minutes daily
- 💪 **Regular exercise** - stress resilience
- 😴 **Better sleep** - stress recovery
- 🥗 **Nutrition** - stable blood sugar

### Social Triggers
**Before the situation:**
- 📋 **Plan ahead** - know your strategy
- 🗣️ **Tell friends** - inform about your quit
- 🚗 **Have an exit plan** - car keys, ride home
- 🥤 **Bring alternatives** - toothpicks, gum

**During the situation:**
- 🤲 **Keep hands busy** - drink, fidget tool
- 🚶 **Take breaks** - step away from smokers
- 💬 **Change the topic** - redirect conversation
- 🎯 **Focus on benefits** - remind yourself why you quit

**After the situation:**
- ✅ **Celebrate success** - acknowledge victory
- 📝 **Learn from experience** - what worked/didn't
- 🎁 **Reward yourself** - non-smoking treat
- 💪 **Build confidence** - "I can handle this"

### Emotional Triggers
**For negative emotions:**
- 🎯 **Address root cause** - solve actual problem
- 💬 **Talk it out** - friend, family, therapist
- 🏃 **Physical release** - exercise, dance, punch pillow
- 🎨 **Creative expression** - art, music, writing

**For positive emotions:**
- 🎉 **Alternative celebrations** - special meal, activity
- 📸 **Capture moment differently** - photos, journaling
- 🤗 **Share with others** - call family, post online
- 🏆 **Healthy rewards** - treat yourself well

## Creating New Habits

### The Replacement Strategy
**Don't just remove smoking - replace it:**

**Morning routine:**
- ❌ Coffee + cigarette
- ✅ Coffee + 5-minute walk + podcast

**Stress response:**
- ❌ Problem + cigarette
- ✅ Problem + deep breathing + solution brainstorm

**Social breaks:**
- ❌ Coworkers + smoking area
- ✅ Coworkers + coffee shop + meaningful conversation

### The 21-Day Rule
**Building new neural pathways:**
- 📅 **Days 1-7**: Conscious effort required, feels unnatural
- 📅 **Days 8-14**: Getting easier, occasional lapses
- 📅 **Days 15-21**: Becoming automatic, feels natural

**Tips for success:**
- 📱 **Track daily** - habit tracking app
- 🏆 **Celebrate milestones** - day 7, 14, 21
- 👥 **Get support** - accountability partner
- 💪 **Be patient** - neural rewiring takes time

## Advanced Trigger Management

### The Trigger Map Exercise
**Create your personal trigger profile:**

1. **List your top 10 triggers** (be specific)
2. **Rate intensity** (1-10 scale)
3. **Identify patterns** (time, place, emotion)
4. **Develop specific responses** for each
5. **Practice alternatives** when not triggered

### Trigger Surfing Technique
**Ride the wave instead of fighting it:**
- 🌊 **Observe the trigger** without judgment
- 📈 **Notice intensity building**
- ⏱️ **Time the peak** (usually 3-5 minutes)
- 📉 **Watch it naturally fade**
- 🏄 **Celebrate riding it out**

### Environmental Design
**Modify your surroundings:**
- 🏠 **Remove smoking items** completely
- 🌱 **Add positive cues** - plants, photos, quotes
- 🎵 **Change sensory environment** - music, scents
- 🪑 **Rearrange furniture** - break location associations

## Building Long-Term Resilience

### Stress Inoculation
**Gradually expose yourself to triggers:**
- 📅 **Week 1**: Avoid triggers completely
- 📅 **Week 2**: Brief exposure with support
- 📅 **Week 3**: Longer exposure with coping tools
- 📅 **Week 4+**: Confident trigger management

### The HALT Check
**Prevent trigger vulnerability:**
- 🍽️ **H**ungry - eat regular, healthy meals
- 😠 **A**ngry - address conflicts, practice forgiveness
- 😴 **L**onely - maintain social connections
- 😴 **T**ired - prioritize adequate sleep

### Success Metrics
**Track your progress:**
- 📊 **Trigger encounters survived**
- ⏱️ **Time between trigger and urge fade**
- 💪 **Confidence level** (1-10 daily rating)
- 🏆 **Successful alternative behaviors used**

## Emergency Action Plan

### High-Risk Situations
**When triggers feel overwhelming:**

**Level 1 - Mild urge:**
- 🫁 Deep breathing (2 minutes)
- 🥤 Cold water sip slowly
- 📱 Quick distraction app

**Level 2 - Moderate urge:**
- 🚶 Leave environment immediately
- 📞 Call your quit buddy
- 🏃 Physical movement (5 minutes)

**Level 3 - Intense urge:**
- 🚨 Use panic mode tool in app
- 📞 Call quitline or counselor
- 🏥 Consider nicotine replacement
- 👥 Reach out to community support

Remember: **Triggers are temporary, but your success is permanent**. Every trigger you overcome makes you stronger and builds your confidence for the next one.

You're not just avoiding cigarettes - you're **building a trigger-resistant lifestyle** that will serve you for life!`
    },
    {
      id: 'social-situations-survival',
      title: 'Social Situations Survival Guide',
      readTime: '7 min read',
      preview: 'Navigate parties, bars, work breaks, and social smoking scenarios',
      content: `# Social Situations Survival Guide

## The Social Challenge

Social situations are often the **highest risk** scenarios for relapse. The combination of peer pressure, alcohol, habit disruption, and emotional triggers creates a perfect storm. But with the right strategies, you can not only survive but **thrive** in social settings as a non-smoker.

## Pre-Event Preparation

### The GAME Plan
**G - Goal Setting**
- 🎯 **Clear intention**: "I will not smoke tonight"
- 📝 **Write it down** and read before going
- 💪 **Visualize success** - see yourself enjoying the event smoke-free

**A - Ally Recruitment**
- 👥 **Tell trusted friends** about your quit
- 📞 **Designate a quit buddy** to call if needed
- 🤝 **Ask for specific support** - "Help me avoid the smoking area"

**M - Method Selection**
- 🛠️ **Choose 3 coping strategies** for different situations
- 🎒 **Pack your toolkit** - gum, toothpicks, fidget items
- 📱 **Download apps** or have quick distractions ready

**E - Exit Strategy**
- 🚗 **Have transportation** ready (own car, ride app)
- ⏰ **Set time limits** - "I'll leave by 10 PM"
- 🗣️ **Practice excuses** - "Early morning tomorrow"

### Mental Rehearsal
**Visualize challenging scenarios:**
- 🚬 **Someone offers you a cigarette** - practice polite decline
- 🍻 **Drinking lowers your guard** - remind yourself of consequences
- 👥 **Everyone goes for a smoke break** - have alternative planned
- 😰 **Feeling left out** - remember your reasons for quitting

## Situation-Specific Strategies

### Parties and Celebrations

**Arrival strategy:**
- 🕐 **Arrive early** - before heavy drinking/smoking starts
- 🏠 **Tour the space** - identify non-smoking areas
- 🥤 **Get a drink immediately** - keep hands busy
- 👋 **Find non-smoking friends** first

**During the party:**
- 🍽️ **Stay near food** - snacking keeps mouth busy
- 🎵 **Dance or be active** - physical distraction
- 🤳 **Take photos** - different hand activity
- 🏠 **Stay indoors** - avoid smoking areas

**When others smoke:**
- 🚶 **Take bathroom breaks** during smoke breaks
- 📱 **Check phone/social media** - solo activity
- 🍕 **Volunteer for tasks** - get drinks, help host
- 💬 **Start conversations** with non-smokers

### Bars and Restaurants

**Seating strategy:**
- 🏠 **Request indoor seating** away from smoking areas
- 🪟 **Avoid patio/outdoor sections** in smoking venues
- 👥 **Sit between non-smokers** if possible
- 🚪 **Position away from entrances** where smokers gather

**Ordering tactics:**
- ☕ **Start with coffee/tea** - warm drink for oral satisfaction
- 🥤 **Use straws** - mimics smoking motion
- 🍿 **Order appetizers** - finger foods keep hands busy
- 🧊 **Ice water backup** - always have something to sip

**Alcohol considerations:**
- 🍷 **Limit alcohol intake** - impairs judgment
- 🥤 **Alternate with water** - every other drink
- 🍽️ **Eat before drinking** - food slows alcohol absorption
- ⏰ **Set drink limits** before arriving

### Work Social Events

**Professional networking:**
- ☕ **Suggest coffee meetings** instead of smoking breaks
- 🚶 **Walking meetings** - productive and healthy
- 🏢 **Use indoor conference rooms** for discussions
- 📊 **Focus on work topics** - professional distraction

**After-work gatherings:**
- 🕕 **Limit time** - leave before drinking gets heavy
- 👥 **Partner with non-smoking colleagues**
- 🍽️ **Focus on food and conversation**
- 📱 **Have work excuse ready** - "Early meeting tomorrow"

### Wedding and Family Events

**Family dynamics:**
- 🗣️ **Inform family beforehand** about your quit
- 👨‍👩‍👧‍👦 **Enlist supportive relatives** as allies
- 🎂 **Focus on celebration** - why you're there
- 📸 **Volunteer as photographer** - keeps hands busy

**Long events (all day):**
- 🚶 **Plan regular walks** - solo recharge time
- 🥤 **Stay hydrated** - carry water bottle
- 🍎 **Healthy snacks** - nuts, mints, fruit
- 😴 **Rest breaks** - step away when overwhelmed

## Communication Scripts

### Declining Cigarettes
**Casual offers:**
- 😊 **"Thanks, but I quit smoking"**
- 💪 **"I'm good, thanks - feeling great without them"**
- 🎯 **"Nah, I'm done with that"**

**Persistent offers:**
- 🛑 **"I appreciate it, but I'm serious about quitting"**
- 💰 **"I'm saving money for [specific goal]"**
- 🏥 **"Doctor's orders - I need to stay quit"**

**From close friends:**
- 🤝 **"I really need your support with this"**
- 💔 **"It would really hurt my progress if I smoked"**
- 👥 **"Help me stay strong - this is important to me"**

### Explaining Your Quit
**Keep it simple:**
- 💪 **"I'm taking better care of my health"**
- 💰 **"Saving money for [vacation/house/etc.]"**
- 👨‍👩‍👧‍👦 **"Setting a good example for my family"**

**If pressed for details:**
- 🫁 **"I feel so much better without them"**
- ⚡ **"I have more energy now"**
- 😊 **"It's one of the best decisions I've made"**

### Handling Peer Pressure
**Direct pressure:**
- 🛑 **"I understand you're just being friendly, but no thanks"**
- 🎯 **"I'm really committed to this decision"**
- 💪 **"I'd rather stick to my goals"**

**Indirect pressure ("Come on, one won't hurt"):**
- 🧠 **"That's exactly the thinking that kept me smoking"**
- 📈 **"One always leads to more for me"**
- 🏆 **"I'm not willing to restart my quit counter"**

## Managing Specific Emotions

### FOMO (Fear of Missing Out)
**Remember what you're actually missing:**
- 💸 **Spending money** on something harmful
- 🫁 **Damaging your lungs** and health
- 😷 **Smelling like smoke** tomorrow
- 💔 **Breaking your quit streak**

**Focus on what you're gaining:**
- 💰 **Money in your pocket**
- 🫁 **Better breathing** tonight and tomorrow
- 💪 **Stronger willpower** and self-respect
- 🏆 **Progress toward your goals**

### Feeling Left Out
**When smokers go outside:**
- 📱 **Use phone time** - social media, games, texts
- 🚻 **Bathroom break** - good timing
- 🍕 **Kitchen visit** - chat with host, get food
- 💬 **Start conversation** with other non-smokers

**Create new social patterns:**
- ☕ **Coffee dates** instead of smoke breaks
- 🚶 **Walking meetings** for work
- 🏃 **Exercise buddies** for stress relief
- 🍽️ **Meal-based socializing**

### Social Anxiety
**Without cigarettes as social lubricant:**
- 🥤 **Keep drink in hand** - gives you something to do
- 🗣️ **Ask questions** - people love talking about themselves
- 👂 **Be a good listener** - takes pressure off you
- 🏠 **Arrive early** - easier to socialize before crowds

## Building New Social Identity

### From "Smoker" to "Non-Smoker"
**Language shifts:**
- ❌ **"I'm trying to quit"** → ✅ **"I'm a non-smoker"**
- ❌ **"I can't smoke"** → ✅ **"I don't smoke"**
- ❌ **"I'm quitting"** → ✅ **"I quit smoking"**

**Behavioral changes:**
- 🏠 **Spend more time indoors** at social events
- ☕ **Lead coffee/tea suggestions** instead of smoke breaks
- 🏃 **Suggest active social activities** - hiking, sports
- 🍽️ **Focus on food experiences** - restaurants, cooking

### Finding Your Tribe
**Connect with other non-smokers:**
- 👥 **Join quit smoking groups** - online or in-person
- 🏃 **Fitness communities** - healthy lifestyle focus
- 🌱 **Wellness groups** - yoga, meditation, nutrition
- 🎯 **Goal-oriented groups** - book clubs, hobby groups

## Long-Term Social Strategies

### Changing Your Social Environment
**Gradual shifts:**
- 🍻 **Choose venues** with good non-smoking areas
- 👥 **Cultivate friendships** with non-smokers
- 🎯 **Suggest activities** that don't revolve around smoking
- 🏠 **Host gatherings** where you control the environment

### Supporting Others
**Become a quit advocate:**
- 💬 **Share your experience** (when appropriate)
- 👥 **Support other quitters** in your social circle
- 🏆 **Model success** - show it's possible and enjoyable
- 🌟 **Inspire by example** rather than preaching

## Success Metrics

**Track your social victories:**
- 🎉 **Events attended smoke-free**
- ⏱️ **Hours spent in social situations without smoking**
- 💪 **Confidence level** in social settings (1-10)
- 👥 **New non-smoking friends made**
- 🎯 **Social goals achieved** (networking, dates, etc.)

## Emergency Social Protocol

**If you feel overwhelmed:**
1. 🚶 **Step outside** (away from smokers) for fresh air
2. 📞 **Text your quit buddy** immediately
3. 🧘 **Do 4-7-8 breathing** for 2 minutes
4. 💭 **Visualize tomorrow morning** smoke-free and proud
5. 🏠 **Consider leaving early** - not failure, smart planning

Remember: **You can be social AND smoke-free**. In fact, you'll discover that socializing without cigarettes is more authentic, memorable, and enjoyable than you ever imagined.

Your new social identity as a confident non-smoker will attract like-minded people and create healthier, more meaningful connections!`
    },
    {
      id: 'relapse-prevention-roadmap',
      title: 'Relapse Prevention Roadmap',
      readTime: '9 min read',
      preview: 'Complete system for preventing slips and getting back on track',
      content: `# Relapse Prevention Roadmap

## Understanding Relapse

**Relapse is NOT failure** - it's valuable data about your quit process. Research shows that most successful quitters had previous attempts. Each "failed" quit teaches you something important about **what works and what doesn't**.

## The Relapse Cycle

Understanding the pattern helps you interrupt it:

### Stage 1: Emotional Buildup (Days to Weeks Before)
**Warning signs:**
- 😰 **Increased stress** without healthy coping
- 😴 **Poor sleep patterns** and fatigue
- 🍔 **Neglecting self-care** - nutrition, exercise
- 👥 **Social isolation** - avoiding support systems
- 🧠 **Romanticizing smoking** - "just one wouldn't hurt"

**What's happening:**
- 🧠 **Old neural pathways** becoming active again
- ⚖️ **Coping resources** becoming depleted
- 🎭 **Identity confusion** - "am I really a non-smoker?"

### Stage 2: Mental Preparation (Hours to Days Before)
**Warning signs:**
- 💭 **Bargaining thoughts** - "I'll just smoke socially"
- 🎯 **Planning scenarios** - when/where you might smoke
- 🛒 **Testing behaviors** - going to smoke shops, carrying money
- 😤 **Justification building** - creating "good reasons" to smoke

### Stage 3: The Slip (Minutes to Hours)
**Common triggers:**
- 🍺 **Alcohol consumption** - lowered inhibition
- 😠 **Intense emotions** - anger, sadness, stress
- 👥 **Social pressure** - offers from friends
- 🏠 **Environmental cues** - familiar smoking locations

### Stage 4: The Abstinence Violation Effect
**What happens after:**
- 😞 **Shame and guilt** - "I'm a failure"
- 🎯 **All-or-nothing thinking** - "I already messed up"
- 📈 **Permission to continue** - "might as well finish the pack"
- 🔄 **Return to regular smoking** patterns

## The SLIP-STOP Protocol

### S - Stop Immediately
**The moment you realize you've slipped:**
- 🛑 **Put out the cigarette** immediately (even mid-puff)
- 🗑️ **Dispose of remaining cigarettes** - don't save them
- 🏠 **Leave the smoking environment** right away
- 📱 **Remove yourself from triggers**

### L - Learn From It
**Analyze without judgment:**
- 📝 **Write down exactly what happened** - time, place, emotion
- 🔍 **Identify the trigger chain** - what led to this moment?
- 🎯 **Spot the decision points** - where could you have chosen differently?
- 💡 **Extract the lesson** - what will you do differently next time?

### I - Immediately Restart
**Don't wait for Monday:**
- ⏰ **Your quit restarts NOW** - not tomorrow, not Monday
- 🧽 **Oral hygiene** - brush teeth, mouthwash, remove taste
- 👔 **Change clothes** - remove smoke smell
- 💪 **Recommit** to your reasons for quitting

### P - Plan Prevention
**Strengthen your quit:**
- 🛠️ **Adjust your strategy** based on what you learned
- 📞 **Contact support** - tell someone what happened
- 🎯 **Identify needed resources** - therapy, NRT, apps
- 📋 **Update your quit plan** with new information

### S - Seek Support
**You don't have to restart alone:**
- 📞 **Call your quit buddy** or support group
- 👨‍⚕️ **Contact healthcare provider** if needed
- 💬 **Share in online communities** - others understand
- 📱 **Reset your quit apps** - fresh start tracking

### T - Take Action
**Implement immediate changes:**
- 🏠 **Modify environment** - remove any remaining triggers
- 📅 **Schedule support** - therapy, group meetings
- 💊 **Consider NRT** - if you weren't using it before
- 🎯 **Set short-term goals** - focus on next 24 hours

### O - Optimize Moving Forward
**Long-term improvements:**
- 📊 **Track patterns** - look for slip warning signs
- 🛠️ **Upgrade tools** - better apps, resources, support
- 🧠 **Address root causes** - stress, depression, anxiety
- 💪 **Build resilience** - healthier coping mechanisms

### P - Persist
**Maintain perspective:**
- 📈 **Track overall progress** - count smoke-free days vs. slip days
- 🏆 **Celebrate improvements** - even if not perfect
- 🎯 **Focus on learning** - each attempt builds knowledge
- 💪 **Maintain hope** - most successful quitters had previous slips

## High-Risk Situations Map

### Immediate Risk (Next 24 Hours)
**Red Alert Situations:**
- 🍺 **Drinking alcohol** - severely impaired judgment
- 😠 **Major conflict** - relationship, work issues
- 📰 **Bad news** - health, financial, family problems
- 🎉 **Celebrations** - traditionally smoking occasions

**Emergency protocols:**
- 📞 **Pre-arrange check-ins** with support person
- 🏠 **Avoid trigger environments** completely
- 💊 **Have NRT ready** for breakthrough cravings
- 🚨 **Use panic mode tools** in app

### Medium Risk (Next Week)
**Yellow Alert Situations:**
- 👥 **Social events** with smoking friends
- 💼 **Work stress** periods - deadlines, presentations
- 🏠 **Being alone** for extended periods
- 🌙 **Sleep disruption** - travel, schedule changes

**Preparation strategies:**
- 📋 **Script responses** to cigarette offers
- 🎒 **Pack coping toolkit** - gum, fidgets, apps
- 📅 **Schedule support check-ins**
- 🎯 **Set realistic expectations**

### Long-term Risk (Next Month)
**Ongoing vulnerabilities:**
- 💼 **Chronic stress** without healthy coping
- 👥 **Social isolation** - lack of support
- 😷 **Health issues** - depression, anxiety
- 🏠 **Environmental triggers** not addressed

**Systematic solutions:**
- 🧘 **Stress management training** - therapy, classes
- 👥 **Build support network** - groups, friends
- 👨‍⚕️ **Address health issues** - medical, mental health
- 🏠 **Environmental design** - remove all triggers

## The Slip vs. Relapse Distinction

### A Slip Is:
- 🚬 **One cigarette** or brief smoking episode
- ⏱️ **Short duration** - minutes to hours
- 🎯 **Followed by recommitment** to quitting
- 📚 **Learning opportunity** used for improvement
- 💪 **Part of the process** for many successful quitters

### A Relapse Is:
- 🔄 **Return to regular** smoking patterns
- 📅 **Extended duration** - days to months
- 😞 **Abandonment of quit attempt**
- 🚫 **No immediate plan** to quit again
- 💔 **Loss of non-smoker identity**

**Key insight**: You control whether a slip becomes a relapse through your **response**, not the slip itself.

## Building Relapse Resilience

### The 4 Pillars of Prevention

#### 1. Awareness
**Know your patterns:**
- 📊 **Track mood and cravings** daily (1-10 scale)
- 📝 **Journal trigger encounters** and responses
- ⚠️ **Recognize early warning signs** - stress, isolation, romanticizing
- 📱 **Use apps** for real-time monitoring

#### 2. Skills
**Develop specific competencies:**
- 🧘 **Stress management** - breathing, meditation, exercise
- 💬 **Communication** - assertiveness, saying no, asking for help
- 🛠️ **Problem-solving** - addressing issues vs. avoiding with smoking
- ⏰ **Time management** - reducing chronic stress

#### 3. Support
**Build robust networks:**
- 👥 **Quit buddy** - someone to call 24/7
- 🏥 **Professional support** - counselor, doctor, quitline
- 💻 **Online communities** - forums, apps, social media groups
- 👨‍👩‍👧‍👦 **Family involvement** - educate and engage loved ones

#### 4. Structure
**Create supportive environment:**
- 📅 **Daily routines** - replace smoking times with healthy habits
- 🏠 **Physical environment** - remove all smoking paraphernalia
- 👥 **Social environment** - spend time with non-smokers
- 🎯 **Goal structure** - short and long-term quit milestones

## Specific Relapse Scenarios

### The "Just One" Trap
**Common thoughts:**
- 💭 "I'll just have one to get through this"
- 💭 "I can control it now"
- 💭 "I won't get hooked again"

**Reality check:**
- 🧠 **Addiction pathways** are permanent - dormant but not gone
- ⚡ **Tolerance returns** within days
- 🔄 **"Just one" leads to more** in 90% of cases
- 💔 **You'll lose everything** you've gained

### The Stress Rationalization
**Common thoughts:**
- 💭 "This situation is too stressful to handle without smoking"
- 💭 "I'll quit again when things calm down"
- 💭 "I need cigarettes to cope right now"

**Alternative responses:**
- 🎯 **Address the actual stressor** - problem-solve or get help
- 🧘 **Use proven stress techniques** - breathing, exercise, talk therapy
- ⏰ **Remember: stress is temporary** - smoking consequences are long-term
- 💪 **Prove to yourself** you can handle anything smoke-free

### The Social Pressure Cave
**Common thoughts:**
- 💭 "Everyone will think I'm weird if I don't smoke"
- 💭 "I need to fit in"
- 💭 "It's just this one time"

**Boundary responses:**
- 🛑 **Firm but friendly**: "Thanks, but I don't smoke"
- 💪 **Confident**: "I feel great without them"
- 🎯 **Redirect**: "Let's talk about something else"
- 🚪 **Leave if necessary**: Your health > social approval

## Recovery After Relapse

### If You Return to Regular Smoking

**Step 1: Stop the Shame Spiral**
- 🚫 **Avoid self-blame** - addiction is a brain disease
- 📚 **Treat as learning experience** - data for next attempt
- 💪 **Remember past successes** - you've done it before
- 🎯 **Focus on next attempt** - not past "failure"

**Step 2: Analyze What Happened**
- 📝 **Write detailed timeline** of return to smoking
- 🔍 **Identify decision points** where things went wrong
- 🎯 **Spot missing skills** or resources
- 👥 **Get objective perspective** from counselor or support group

**Step 3: Plan Your Comeback**
- 📅 **Set new quit date** (ideally within 2 weeks)
- 🛠️ **Upgrade your toolkit** based on lessons learned
- 👨‍⚕️ **Consider professional help** if you haven't tried it
- 💊 **Explore medication options** - NRT, prescription aids

**Step 4: Rebuild Motivation**
- 📝 **Update your reasons** for quitting
- 💰 **Calculate money lost** during relapse period
- 🫁 **Notice health impacts** from return to smoking
- 🎯 **Set new goals** and rewards for quit milestones

## Success Metrics

### Track Progress, Not Perfection
**Measure these improvements:**
- 📅 **Smoke-free days** vs. smoking days ratio
- ⏱️ **Time between slips** (increasing intervals)
- 🧠 **Craving intensity** (decreasing over time)
- 💪 **Confidence levels** (1-10 daily rating)
- 🎯 **Coping skills used** instead of smoking

### Celebrate All Victories
- ✅ **24 hours smoke-free** after a slip
- ✅ **Resisting a craving** in high-risk situation
- ✅ **Using healthy coping** instead of smoking
- ✅ **Learning from experience** rather than giving up
- ✅ **Seeking help** when needed

Remember: **Relapse prevention is a skill that improves with practice**. Each challenge you face and overcome makes you stronger and more confident in your ability to live smoke-free permanently.

The goal isn't perfection - it's **progress toward a permanently smoke-free life**. Every day you choose not to smoke, you're building the person you want to become.`
    }
  ];

  const getAllContent = () => {
    switch(selectedCategory) {
      case 'quick-start':
        return quickStartContent;
      case 'health':
        return healthContent;
      case 'nrt':
        return nrtContent;
      case 'science':
        return scienceContent;
      case 'strategies':
        return strategiesContent;
      default:
        return quickStartContent;
    }
  };

  const openArticle = (article: any) => {
    setSelectedArticle(article);
    setShowArticleModal(true);
    analytics.track('learn_article_opened', { 
      article_id: article.id,
      article_title: article.title 
    });
  };

  const markAsRead = (articleId: string) => {
    if (!articleId) return;
    const newReadArticles = new Set(readArticles);
    newReadArticles.add(articleId);
    setReadArticles(newReadArticles);
    analytics.track('learn_article_completed', { article_id: articleId });
  };

  const toggleBookmark = (articleId: string) => {
    if (!articleId) return;
    const newBookmarks = new Set(bookmarkedArticles);
    if (newBookmarks.has(articleId)) {
      newBookmarks.delete(articleId);
      analytics.track('learn_article_unbookmarked', { article_id: articleId });
    } else {
      newBookmarks.add(articleId);
      analytics.track('learn_article_bookmarked', { article_id: articleId });
    }
    setBookmarkedArticles(newBookmarks);
  };

  const searchArticles = (query: string) => {
    if (!query.trim()) return getAllContent();
    
    const allContent = [
      ...quickStartContent,
      ...healthContent,
      ...nrtContent,
      ...scienceContent,
      ...strategiesContent
    ];
    
    const searchTerm = query.toLowerCase();
    return allContent.filter(article => 
      article.title.toLowerCase().includes(searchTerm) ||
      article.preview.toLowerCase().includes(searchTerm) ||
      article.content.toLowerCase().includes(searchTerm)
    );
  };

  const getPersonalizedRecommendations = () => {
    const allContent = [
      ...quickStartContent,
      ...healthContent,
      ...nrtContent,
      ...scienceContent,
      ...strategiesContent
    ];
    
    // Get user's quit stage for personalized recommendations
    const quitDate = quitData?.quitDate;
    const daysSinceQuit = quitDate ? Math.floor((new Date().getTime() - new Date(quitDate).getTime()) / (1000 * 60 * 60 * 24)) : 0;
    
    // Prioritize content based on quit stage
    let priorityContent = [];
    
    if (daysSinceQuit <= 7) {
      // First week - focus on survival
      priorityContent = quickStartContent.concat(strategiesContent.filter(a => a.id.includes('trigger')));
    } else if (daysSinceQuit <= 30) {
      // First month - focus on building habits and understanding health benefits
      priorityContent = healthContent.concat(strategiesContent);
    } else if (daysSinceQuit <= 90) {
      // First 3 months - focus on long-term strategies and science
      priorityContent = scienceContent.concat(strategiesContent.filter(a => a.id.includes('social')));
    } else {
      // Long-term - maintenance and helping others
      priorityContent = strategiesContent.concat(nrtContent);
    }
    
    // Exclude already read articles from top recommendations
    const unreadPriority = priorityContent.filter(article => !readArticles.has(article.id));
    const readPriority = priorityContent.filter(article => readArticles.has(article.id));
    
    return [...unreadPriority, ...readPriority].slice(0, 6);
  };

  // Interactive Health Recovery Timeline Component
  const renderHealthTimeline = () => {
    const milestones = getRecoveryMilestones();
    const quitDate = quitData?.quitDate;
    
    if (!quitDate) {
      return (
        <Card style={styles.timelineCard}>
          <View style={styles.timelineHeader}>
            <Text style={styles.timelineTitle}>🫁 Your Recovery Timeline</Text>
            <Text style={styles.timelineSubtitle}>Set your quit date to see your personalized progress</Text>
          </View>
        </Card>
      );
    }

    const achievedCount = milestones.filter(m => m.achieved).length;
    const nextMilestone = milestones.find(m => !m.achieved);

    return (
      <Card style={styles.timelineCard}>
        <View style={styles.timelineHeader}>
          <Text style={styles.timelineTitle}>🫁 Your Recovery Timeline</Text>
          <Text style={styles.timelineSubtitle}>
            {achievedCount} of {milestones.length} milestones achieved!
          </Text>
          {nextMilestone && (
            <Text style={styles.nextMilestone}>
              Next: {nextMilestone.title} in {nextMilestone.time}
            </Text>
          )}
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timelineScroll}>
          {milestones.map((milestone, index) => (
            <View key={index} style={styles.milestoneContainer}>
              <View style={[
                styles.milestoneNode,
                milestone.achieved ? styles.milestoneAchieved : styles.milestonePending
              ]}>
                <Text style={styles.milestoneEmoji}>{milestone.emoji}</Text>
              </View>
              
              <View style={styles.milestoneContent}>
                <Text style={styles.milestoneTime}>{milestone.time}</Text>
                <Text style={[
                  styles.milestoneTitle,
                  milestone.achieved ? styles.achievedText : styles.pendingText
                ]}>
                  {milestone.title}
                </Text>
                <Text style={styles.milestoneDescription}>
                  {milestone.description}
                </Text>
              </View>
              
              {index < milestones.length - 1 && (
                <View style={[
                  styles.timelineConnector,
                  milestone.achieved ? styles.connectorAchieved : styles.connectorPending
                ]} />
              )}
            </View>
          ))}
        </ScrollView>
        
        <View style={styles.timelineFooter}>
          <Text style={styles.disclaimer}>
            ⚠️ Medical Disclaimer: This timeline is for educational purposes only. 
            Individual recovery varies. Consult your healthcare provider for personalized advice.
          </Text>
        </View>
      </Card>
    );
  };

  // Premium Header with Search and Navigation
  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <Text style={styles.headerTitle}>Learn</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            onPress={() => setShowSearch(!showSearch)}
            style={[styles.headerButton, showSearch && styles.headerButtonActive]}
          >
            <Text style={[styles.headerButtonText, showSearch && styles.headerButtonTextActive]}>
              🔍
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setShowBookmarks(!showBookmarks)}
            style={[styles.headerButton, showBookmarks && styles.headerButtonActive]}
          >
            <Text style={[styles.headerButtonText, showBookmarks && styles.headerButtonTextActive]}>
              📚
            </Text>
            {bookmarkedArticles.size > 0 && (
              <View style={styles.badgeIndicator}>
                <Text style={styles.badgeText}>{bookmarkedArticles.size}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
      
      {showSearch && (
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search articles..."
            placeholderTextColor={Theme.colors.text.tertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
        </View>
      )}
    </View>
  );

  // Personalized Recommendations Section
  const renderRecommendations = () => {
    if (showSearch || showBookmarks) return null;
    
    const recommendations = getPersonalizedRecommendations();
    const quitDate = quitData?.quitDate;
    const daysSinceQuit = quitDate ? Math.floor((new Date().getTime() - new Date(quitDate).getTime()) / (1000 * 60 * 60 * 24)) : 0;
    
    let sectionTitle = "Recommended for You";
    let sectionSubtitle = "Personalized content for your journey";
    
    if (daysSinceQuit <= 7) {
      sectionTitle = "🔥 Survive Your First Week";
      sectionSubtitle = "Essential strategies for your critical first days";
    } else if (daysSinceQuit <= 30) {
      sectionTitle = "💪 Build Strong Foundations";
      sectionSubtitle = "Focus on health benefits and habit formation";
    } else if (daysSinceQuit <= 90) {
      sectionTitle = "🧠 Master Long-term Success";
      sectionSubtitle = "Advanced strategies for permanent change";
    } else {
      sectionTitle = "🏆 Maintain Your Victory";
      sectionSubtitle = "Stay strong and help others succeed";
    }
    
    return (
      <View style={styles.recommendationsSection}>
        <View style={styles.recommendationsHeader}>
          <Text style={styles.recommendationsTitle}>{sectionTitle}</Text>
          <Text style={styles.recommendationsSubtitle}>{sectionSubtitle}</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recommendationsScroll}>
          {recommendations.map(article => (
            <TouchableOpacity 
              key={article.id}
              onPress={() => openArticle(article)}
              style={styles.recommendationCard}
            >
              <Card style={styles.recommendationCardInner}>
                <View style={styles.recommendationHeader}>
                  <Text style={styles.recommendationTitle} numberOfLines={2}>
                    {article.title}
                  </Text>
                  <View style={styles.recommendationBadges}>
                    {readArticles.has(article.id) && (
                      <Badge variant="success" size="sm">✓</Badge>
                    )}
                    {bookmarkedArticles.has(article.id) && (
                      <Badge variant="secondary" size="sm" style={styles.bookmarkBadge}>📚</Badge>
                    )}
                  </View>
                </View>
                <Text style={styles.recommendationPreview} numberOfLines={3}>
                  {article.preview}
                </Text>
                <Text style={styles.recommendationReadTime}>{article.readTime}</Text>
              </Card>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderContent = () => {
    let content;
    
    if (showSearch && searchQuery.trim()) {
      content = searchArticles(searchQuery);
    } else if (showBookmarks) {
      const allContent = [
        ...quickStartContent,
        ...healthContent,
        ...nrtContent,
        ...scienceContent,
        ...strategiesContent
      ];
      content = allContent.filter(article => bookmarkedArticles.has(article.id));
    } else {
      content = getAllContent();
    }
    
    // Special case for health category timeline
    if (selectedCategory === 'health' && !showSearch && !showBookmarks) {
      return (
        <View>
          {renderHealthTimeline()}
          <View style={styles.sectionSpacer} />
          {healthContent.map(article => renderArticleCard(article))}
        </View>
      );
    }
    
    // Show empty state for bookmarks or search
    if (content.length === 0) {
      return renderEmptyState();
    }
    
    return content.map(article => renderArticleCard(article));
  };

  const renderArticleCard = (article: any) => (
    <TouchableOpacity 
      key={article.id} 
      onPress={() => openArticle(article)}
      style={styles.articleCard}
    >
      <Card style={styles.articleCardInner}>
        <View style={styles.articleHeader}>
          <View style={styles.articleTitleContainer}>
            <Text style={styles.articleTitle}>{article.title || 'Untitled'}</Text>
            <View style={styles.articleBadges}>
              {readArticles.has(article.id) && (
                <Badge variant="success" style={styles.readBadge}>
                  ✓ Read
                </Badge>
              )}
              {bookmarkedArticles.has(article.id) && (
                <Badge variant="secondary" style={styles.bookmarkBadgeSmall}>
                  📚
                </Badge>
              )}
            </View>
          </View>
          <TouchableOpacity 
            onPress={(e) => {
              e.stopPropagation();
              toggleBookmark(article.id);
            }}
            style={styles.bookmarkButton}
          >
            <Text style={[
              styles.bookmarkIcon,
              bookmarkedArticles.has(article.id) && styles.bookmarkIconActive
            ]}>
              {bookmarkedArticles.has(article.id) ? '📚' : '📖'}
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.articlePreview}>{article.preview || 'No preview available'}</Text>
        <View style={styles.articleMeta}>
          <Text style={styles.readTime}>{article.readTime || '5 min read'}</Text>
        </View>
      </Card>
    </TouchableOpacity>
  );

  const renderEmptyState = () => {
    if (showBookmarks) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateIcon}>📚</Text>
          <Text style={styles.emptyStateTitle}>No Bookmarks Yet</Text>
          <Text style={styles.emptyStateText}>
            Tap the bookmark icon on articles you want to save for later reading.
          </Text>
        </View>
      );
    }
    
    if (showSearch) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateIcon}>🔍</Text>
          <Text style={styles.emptyStateTitle}>No Results Found</Text>
          <Text style={styles.emptyStateText}>
            Try searching for different keywords like "withdrawal", "triggers", or "NRT".
          </Text>
        </View>
      );
    }
    
    return null;
  };

  const renderArticleModal = () => (
    <Modal
      visible={showArticleModal}
      animationType="slide"
      presentationStyle="fullScreen"
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity 
            onPress={() => setShowArticleModal(false)}
            style={styles.modalBackButton}
          >
            <Text style={styles.modalBackText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Learn</Text>
          <TouchableOpacity 
            onPress={() => markAsRead(selectedArticle?.id)}
            style={styles.markReadButton}
          >
            <Text style={styles.markReadText}>
              {readArticles.has(selectedArticle?.id) ? '✓ Read' : 'Mark Read'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          {selectedArticle && (
            <View style={styles.articleContent}>
              <Text style={styles.articleFullTitle}>{selectedArticle.title}</Text>
              <Text style={styles.articleFullText}>{selectedArticle.content}</Text>
              </View>
          )}
        </ScrollView>

        <View style={styles.modalFooter}>
          <Text style={styles.disclaimer}>
            This information is for educational purposes only. Consult your healthcare provider for medical advice.
                </Text>
              </View>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {!showSearch && !showBookmarks && (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
            contentContainerStyle={styles.categoryScrollContent}
          >
            {categories.map(category => (
              <TouchableOpacity
                key={category.id}
                onPress={() => setSelectedCategory(category.id)}
                style={[
                  styles.categoryButton,
                  selectedCategory === category.id && styles.categoryButtonActive
                ]}
              >
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <Text style={[
                  styles.categoryText,
                  selectedCategory === category.id && styles.categoryTextActive
                ]}>
                  {category.title}
                  </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {renderRecommendations()}

        <View style={styles.contentSection}>
          {renderContent()}
        </View>
      </ScrollView>

      {renderArticleModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.dark.background,
  },
  header: {
    padding: Theme.spacing.lg,
    paddingBottom: Theme.spacing.md,
  },
  title: {
    ...Theme.typography.largeTitle,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.sm,
  },
  subtitle: {
    ...Theme.typography.body,
    color: Theme.colors.text.secondary,
    lineHeight: 24,
  },
  categoryScroll: {
    paddingLeft: Theme.spacing.lg,
    marginBottom: Theme.spacing.lg,
  },
  categoryScrollContent: {
    paddingRight: Theme.spacing.lg,
  },
  categoryButton: {
    alignItems: 'center',
    padding: Theme.spacing.md,
    marginRight: Theme.spacing.sm,
    backgroundColor: Theme.colors.dark.surface,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 80,
  },
  categoryButtonActive: {
    backgroundColor: Theme.colors.purple[500] + '20',
    borderColor: Theme.colors.purple[500],
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: Theme.spacing.xs,
  },
  categoryText: {
    ...Theme.typography.footnote,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  categoryTextActive: {
    color: Theme.colors.purple[500],
    fontWeight: '600',
  },
  contentSection: {
    paddingHorizontal: Theme.spacing.lg,
    paddingBottom: Theme.spacing.xl,
  },
  articleCard: {
    marginBottom: Theme.spacing.md,
  },
  articleCardInner: {
    padding: Theme.spacing.lg,
  },
  articleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Theme.spacing.sm,
  },
  articleTitle: {
    ...Theme.typography.headline,
    color: Theme.colors.text.primary,
    flex: 1,
    marginRight: Theme.spacing.md,
  },
  readBadge: {
    flexShrink: 0,
  },
  articlePreview: {
    ...Theme.typography.body,
    color: Theme.colors.text.secondary,
    lineHeight: 22,
    marginBottom: Theme.spacing.md,
  },
  articleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  readTime: {
    ...Theme.typography.footnote,
    color: Theme.colors.text.tertiary,
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
    padding: Theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.dark.border,
  },
  modalBackButton: {
    padding: Theme.spacing.sm,
  },
  modalBackText: {
    ...Theme.typography.body,
    color: Theme.colors.purple[500],
    fontWeight: '600',
  },
  modalTitle: {
    ...Theme.typography.headline,
    color: Theme.colors.text.primary,
  },
  markReadButton: {
    padding: Theme.spacing.sm,
  },
  markReadText: {
    ...Theme.typography.footnote,
    color: Theme.colors.purple[500],
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: Theme.spacing.lg,
  },
  articleContent: {
    paddingBottom: Theme.spacing.xl,
  },
  articleFullTitle: {
    ...Theme.typography.title1,
    color: Theme.colors.text.primary,
    fontWeight: 'bold',
    marginBottom: Theme.spacing.lg,
  },
  articleFullText: {
    ...Theme.typography.body,
    color: Theme.colors.text.primary,
    lineHeight: 26,
  },
  modalFooter: {
    padding: Theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.dark.border,
  },
  disclaimer: {
    ...Theme.typography.footnote,
    color: Theme.colors.text.tertiary,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  
  // Timeline styles
  timelineCard: {
    marginHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.lg,
    padding: Theme.spacing.lg,
  },
  timelineHeader: {
    marginBottom: Theme.spacing.lg,
  },
  timelineTitle: {
    ...Theme.typography.title2,
    color: Theme.colors.text.primary,
    fontWeight: '700',
    marginBottom: Theme.spacing.xs,
  },
  timelineSubtitle: {
    ...Theme.typography.body,
    color: Theme.colors.text.secondary,
    marginBottom: Theme.spacing.xs,
  },
  nextMilestone: {
    ...Theme.typography.footnote,
    color: Theme.colors.purple[500],
    fontWeight: '600',
  },
  timelineScroll: {
    marginBottom: Theme.spacing.lg,
  },
  milestoneContainer: {
    alignItems: 'center',
    marginRight: Theme.spacing.lg,
    width: 120,
  },
  milestoneNode: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    marginBottom: Theme.spacing.sm,
  },
  milestoneAchieved: {
    backgroundColor: Theme.colors.success.background,
    borderColor: Theme.colors.success.text,
  },
  milestonePending: {
    backgroundColor: Theme.colors.dark.surfaceElevated,
    borderColor: Theme.colors.dark.border,
  },
  milestoneEmoji: {
    fontSize: 24,
  },
  milestoneContent: {
    alignItems: 'center',
    width: '100%',
  },
  milestoneTime: {
    ...Theme.typography.caption1,
    color: Theme.colors.text.tertiary,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 2,
  },
  milestoneTitle: {
    ...Theme.typography.footnote,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  achievedText: {
    color: Theme.colors.success.text,
  },
  pendingText: {
    color: Theme.colors.text.secondary,
  },
  milestoneDescription: {
    ...Theme.typography.caption2,
    color: Theme.colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 14,
  },
  timelineConnector: {
    position: 'absolute',
    top: 30,
    right: -Theme.spacing.lg,
    width: Theme.spacing.lg,
    height: 3,
    borderRadius: 1.5,
  },
  connectorAchieved: {
    backgroundColor: Theme.colors.success.text,
  },
  connectorPending: {
    backgroundColor: Theme.colors.dark.border,
  },
  timelineFooter: {
    paddingTop: Theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.dark.border,
  },
  sectionSpacer: {
    height: Theme.spacing.lg,
  },
  
  // Enhanced Header Styles
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  headerTitle: {
    ...Theme.typography.largeTitle,
    color: Theme.colors.text.primary,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Theme.colors.dark.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Theme.spacing.sm,
    position: 'relative',
  },
  headerButtonActive: {
    backgroundColor: Theme.colors.purple[500] + '20',
    borderWidth: 1,
    borderColor: Theme.colors.purple[500],
  },
  headerButtonText: {
    fontSize: 18,
  },
  headerButtonTextActive: {
    transform: [{ scale: 1.1 }],
  },
  badgeIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: Theme.colors.purple[500],
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Theme.colors.dark.background,
  },
  badgeText: {
    ...Theme.typography.caption2,
    color: Theme.colors.text.primary,
    fontWeight: '700',
    fontSize: 10,
  },
  
  // Search Styles
  searchContainer: {
    marginTop: Theme.spacing.md,
  },
  searchInput: {
    backgroundColor: Theme.colors.dark.surface,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    color: Theme.colors.text.primary,
    fontSize: 16,
    borderWidth: 2,
    borderColor: Theme.colors.dark.border,
  },
  
  // Recommendations Styles
  recommendationsSection: {
    marginBottom: Theme.spacing.xl,
  },
  recommendationsHeader: {
    paddingHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
  },
  recommendationsTitle: {
    ...Theme.typography.title2,
    color: Theme.colors.text.primary,
    fontWeight: '700',
    marginBottom: Theme.spacing.xs,
  },
  recommendationsSubtitle: {
    ...Theme.typography.body,
    color: Theme.colors.text.secondary,
  },
  recommendationsScroll: {
    paddingLeft: Theme.spacing.lg,
  },
  recommendationCard: {
    width: 280,
    marginRight: Theme.spacing.md,
  },
  recommendationCardInner: {
    padding: Theme.spacing.lg,
    height: 140,
  },
  recommendationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Theme.spacing.sm,
  },
  recommendationTitle: {
    ...Theme.typography.headline,
    color: Theme.colors.text.primary,
    fontWeight: '600',
    flex: 1,
    marginRight: Theme.spacing.sm,
  },
  recommendationBadges: {
    flexDirection: 'row',
    gap: Theme.spacing.xs,
  },
  recommendationPreview: {
    ...Theme.typography.footnote,
    color: Theme.colors.text.secondary,
    lineHeight: 18,
    flex: 1,
  },
  recommendationReadTime: {
    ...Theme.typography.caption1,
    color: Theme.colors.text.tertiary,
    marginTop: Theme.spacing.xs,
  },
  bookmarkBadge: {
    marginLeft: Theme.spacing.xs,
  },
  
  // Enhanced Article Card Styles
  articleTitleContainer: {
    flex: 1,
    marginRight: Theme.spacing.sm,
  },
  articleBadges: {
    flexDirection: 'row',
    marginTop: Theme.spacing.xs,
    gap: Theme.spacing.xs,
  },
  bookmarkButton: {
    padding: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.sm,
  },
  bookmarkIcon: {
    fontSize: 20,
    opacity: 0.6,
  },
  bookmarkIconActive: {
    opacity: 1,
    transform: [{ scale: 1.1 }],
  },
  bookmarkBadgeSmall: {
    marginLeft: Theme.spacing.xs,
  },
  
  // Empty State Styles
  emptyState: {
    alignItems: 'center',
    paddingVertical: Theme.spacing.xxl,
    paddingHorizontal: Theme.spacing.lg,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: Theme.spacing.lg,
    opacity: 0.6,
  },
  emptyStateTitle: {
    ...Theme.typography.title3,
    color: Theme.colors.text.primary,
    fontWeight: '600',
    marginBottom: Theme.spacing.sm,
    textAlign: 'center',
  },
  emptyStateText: {
    ...Theme.typography.body,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 280,
  },
});