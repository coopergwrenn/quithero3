# QuitHero3 - Developer Setup Guide

## 🚀 Getting Started

This guide will help you set up the QuitHero3 development environment for collaborative development.

## Prerequisites

### Required Software
- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **Git** - [Download here](https://git-scm.com/)
- **Cursor IDE** - [Download here](https://cursor.sh/)
- **Expo CLI** - Install via: `npm install -g @expo/cli`

### Mobile Testing Options
- **Expo Go App** (Recommended for testing)
  - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)
  - Android: [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)
- **iOS Simulator** (Mac only) - Comes with Xcode
- **Android Studio Emulator** - [Setup Guide](https://docs.expo.dev/workflow/android-studio-emulator/)

## 📁 Project Setup

### 1. Clone the Repository
```bash
git clone https://github.com/coopergwrenn/quithero3.git
cd quithero3
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env.local` file (ask Cooper for the actual values):
```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Start Development Server
```bash
npx expo start
```

## 🌿 Branch Strategy

We use a **feature branch workflow**:

### Main Branches
- **`main`** - Production-ready code (Cooper manages)
- **`feature/chatbot-integration`** - Your dedicated chatbot work

### Your Workflow

#### Starting New Work
```bash
# Switch to your branch
git checkout feature/chatbot-integration

# Pull latest changes
git pull origin feature/chatbot-integration

# Create a sub-feature branch (optional for large features)
git checkout -b feature/chatbot-ui-components
```

#### Daily Development
```bash
# Stage your changes
git add .

# Commit with descriptive message
git commit -m "Add chatbot message bubble component"

# Push to your branch
git push origin feature/chatbot-integration
```

#### Getting Cooper's Latest Changes
```bash
# Switch to main and pull latest
git checkout main
git pull origin main

# Switch back to your branch and merge main
git checkout feature/chatbot-integration
git merge main

# Resolve any conflicts, then push
git push origin feature/chatbot-integration
```

## 🧪 Testing Setup

### Running the App
1. **Start Expo**: `npx expo start`
2. **Scan QR Code** with Expo Go app on your phone
3. **Or Press**: 
   - `i` for iOS Simulator
   - `a` for Android Emulator
   - `w` for Web (limited functionality)

### Test Accounts
Ask Cooper for test account credentials to avoid creating new accounts repeatedly.

## 🤖 Chatbot Development Area

Your main focus will be in these directories:

### Suggested File Structure
```
src/
├── components/
│   └── chatbot/
│       ├── ChatInterface.tsx
│       ├── MessageBubble.tsx
│       ├── ChatInput.tsx
│       └── index.ts
├── services/
│   └── aiCoaching.ts (already exists - you can extend this)
├── stores/
│   └── chatStore.ts (create this)
└── types/
    └── chat.ts (create this)
```

### Integration Points
- **Coach Tab**: `app/(app)/(tabs)/coach.tsx`
- **AI Service**: `src/services/aiCoaching.ts`
- **Design System**: Use components from `src/design-system/`

## 🔧 Development Tips

### Hot Reloading
- Changes auto-reload on save
- Shake device to open developer menu
- Press `r` in terminal to reload manually

### Debugging
- Use `console.log()` - appears in terminal
- React Native Debugger for advanced debugging
- Expo Dev Tools: press `d` in terminal

### Code Style
- Follow existing patterns in the codebase
- Use TypeScript for all new files
- Import components from design system when possible

## 📱 App Architecture Overview

### Key Technologies
- **Expo Router** - File-based routing
- **Supabase** - Backend/Database/Auth
- **Zustand** - State management
- **TypeScript** - Type safety
- **React Native** - Mobile framework

### Current App Structure
```
app/
├── (app)/(tabs)/
│   ├── coach.tsx          ← Your main integration point
│   ├── dashboard.tsx
│   ├── community.tsx
│   ├── learn.tsx
│   └── tools.tsx
├── (auth)/
│   └── signin.tsx
└── (onboarding)/
    └── index.tsx
```

## 🚨 Important Notes

### DO NOT:
- Push directly to `main` branch
- Commit sensitive data (API keys, passwords)
- Break existing functionality
- Work on authentication/onboarding (Cooper's area)

### DO:
- Test on real device with Expo Go
- Write descriptive commit messages
- Ask questions in our communication channel
- Follow the existing code patterns

## 🆘 Common Issues & Solutions

### "Metro bundler not starting"
```bash
npx expo start --clear
```

### "Module not found" errors
```bash
npm install
npx expo start --clear
```

### "Network timeout" on device
- Ensure phone and computer are on same WiFi
- Try `npx expo start --tunnel`

### Git merge conflicts
1. Open conflicted files in Cursor
2. Choose which changes to keep
3. Remove conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`)
4. `git add .` and `git commit`

## 📞 Getting Help

1. **Check this guide first**
2. **Look at existing code patterns**
3. **Ask Cooper** for architecture decisions
4. **Google/Stack Overflow** for React Native issues

## 🎯 Your Mission

Focus on building an amazing chatbot experience in the **Coach tab** that helps users with:
- Personalized quit coaching
- Crisis support
- Motivational messaging
- Progress tracking conversations

Good luck! 🚀
