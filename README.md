# QuitHero - Evidence-Based Smoking Cessation App

QuitHero is a premium mobile application designed to help people quit smoking and vaping using evidence-based behavioral science techniques. Built on ACT/CBT frameworks proven in clinical trials.

## 🎯 Mission

Help people quit smoking/vaping permanently through science-backed tools, personalized support, and privacy-first design.

## 🧬 Behavioral Science Foundation

- **ACT/CBT Frameworks**: Based on Acceptance and Commitment Therapy and Cognitive Behavioral Therapy
- **Clinical Evidence**: Inspired by successful RCTs like the iCanQuit study
- **Core Interventions**: 90-second personalized planning, high-friction moment support, pharmacotherapy education
- **No Shame Philosophy**: Supportive, non-judgmental approach focused on empowerment

## 🚀 Technical Stack

- **Framework**: Expo SDK 53 + TypeScript
- **Navigation**: expo-router (file-based routing)
- **State Management**: Zustand
- **Storage**: MMKV (fast) + expo-secure-store (sensitive data)
- **Notifications**: expo-notifications
- **Payments**: RevenueCat (cross-platform IAP)
- **Animations**: Lottie + react-native-reanimated

## 📱 App Architecture

### User Flow
```
Landing → 90s Onboarding → Personalized Plan → Paywall → Main App
```

### Core Features
- **Tools**: Panic Mode, Urge Timer, Breathwork, Pledge Tracker
- **Dashboard**: Progress tracking, health milestones, savings calculator
- **Onboarding**: 12-step assessment for personalized quit plan
- **Paywall**: Risk-based pricing with trial option

### Tab Structure
- Dashboard: Progress overview and quick stats
- Tools: Emergency protocols and coping strategies  
- Learn: Educational content and pharmacotherapy guidance
- Community: Support groups and success stories
- Coach: Personalized guidance and check-ins

## 🎨 Design Philosophy

- **Premium Dark UI**: Single electric purple accent (#8B5CF6)
- **Apple HIG Compliance**: Typography scales, spacing, accessibility
- **Conversion-Focused**: Inspired by QUITTR's proven patterns
- **Minimal & Clean**: Generous white space, legible typography

## 🛡️ Privacy & Data

- **Local-First**: No accounts required for MVP
- **Privacy-Focused**: Sensitive data stored securely on-device
- **Anonymous**: Progress tracking without personal identification
- **HIPAA Consideration**: Health data handled with clinical standards

## 📦 Project Structure

```
src/
├── design-system/     # Theme, tokens, and reusable components
├── stores/           # Zustand state management
├── utils/            # Helper functions and calculations
└── types/            # TypeScript type definitions

app/
├── index.tsx         # Landing/hero screen
├── (onboarding)/     # 90-second assessment flow
├── (paywall)/        # Subscription and trial flow
└── (app)/(tabs)/     # Main application tabs
```

## 🏗️ Development Roadmap

1. **Step 0**: Project foundation ✅
2. **Step 1**: Premium UI implementation
3. **Step 2**: Onboarding flow with personalization
4. **Step 3**: Core tools (Panic Mode, Urge Timer, Breathwork)
5. **Step 4**: RevenueCat integration and paywall
6. **Step 5**: Notifications and analytics
7. **Step 6**: EAS Build preparation and deployment

## 🎯 Key Success Metrics

- **Behavioral**: 7-day quit rate, tool engagement, plan completion
- **Business**: Trial-to-paid conversion, LTV, retention cohorts
- **Clinical**: Abstinence rates, withdrawal severity, long-term success

## 🔬 Evidence Base

Built on research showing:
- Personalized interventions increase success rates by 40%
- Just-in-time support during high-risk moments doubles outcomes
- Combining behavioral therapy with NRT triples quit rates
- Social support and progress tracking improve long-term abstinence

---

**Privacy-First • Evidence-Based • Conversion-Optimized**