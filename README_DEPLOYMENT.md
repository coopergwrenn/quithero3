# QuitHero - EAS Build & App Store Deployment Guide

This guide covers the complete deployment process for QuitHero from development to App Store submission.

## 🚀 Prerequisites

### Required Accounts & Tools
- **Apple Developer Account** ($99/year) - Required for iOS App Store
- **Google Play Console Account** ($25 one-time) - Required for Android Play Store
- **Expo Account** - Free, for EAS Build services
- **EAS CLI** - Install with `npm install -g @expo/eas-cli`

### Development Environment
- Node.js 18+ 
- Expo CLI 6+
- Xcode 15+ (for iOS builds)
- Android Studio (for Android builds)

## 📱 App Store Connect Setup

### 1. Create App Store Connect App
1. Log into [App Store Connect](https://appstoreconnect.apple.com)
2. Click "My Apps" → "+" → "New App"
3. Fill in app information:
   - **Platform**: iOS
   - **Name**: QuitHero
   - **Primary Language**: English (US)
   - **Bundle ID**: `com.quithero.app`
   - **SKU**: `quithero-ios`

### 2. App Information
- **Category**: Health & Fitness → Medical
- **Age Rating**: 17+ (due to tobacco/addiction content)
- **Content Rights**: Check if you own or have licensed all content

### 3. Privacy Policy & Terms
- **Privacy Policy URL**: `https://quithero.app/privacy`
- **Terms of Service URL**: `https://quithero.app/terms`
- **Support URL**: `https://quithero.app/support`

## 🔧 EAS Configuration

### 1. Initialize EAS Project
```bash
# Login to Expo
eas login

# Initialize EAS in your project
eas build:configure

# Update eas.json with your project ID
eas project:info
```

### 2. Update Configuration Files

Update `eas.json` with your Apple Team ID:
```json
{
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "your-app-store-connect-app-id",
        "appleTeamId": "YOUR_TEAM_ID"
      }
    }
  }
}
```

Update `app.json` with your EAS project ID:
```json
{
  "extra": {
    "eas": {
      "projectId": "your-eas-project-id"
    }
  }
}
```

## 🏗️ Build Process

### 1. Development Build (Testing)
```bash
# iOS development build
eas build --platform ios --profile development

# Android development build  
eas build --platform android --profile development
```

### 2. Preview Build (Internal Testing)
```bash
# iOS preview build
eas build --platform ios --profile preview

# Android preview build
eas build --platform android --profile preview
```

### 3. Production Build (App Store)
```bash
# iOS production build
eas build --platform ios --profile production

# Android production build
eas build --platform android --profile production

# Build both platforms
eas build --platform all --profile production
```

## 📋 Pre-Submission Checklist

### App Store Requirements
- [ ] App icons (1024x1024 for App Store, various sizes for app)
- [ ] Screenshots for all required device sizes
- [ ] App description and keywords
- [ ] Age rating questionnaire completed
- [ ] Privacy nutrition labels configured
- [ ] In-app purchase products configured (if applicable)

### Compliance Requirements
- [ ] Medical disclaimers implemented
- [ ] Age verification (16+) enforced
- [ ] Crisis resource contacts included
- [ ] Privacy policy accessible in-app
- [ ] Terms of service accessible in-app
- [ ] Subscription terms clearly disclosed

### Technical Requirements
- [ ] App builds successfully with production profile
- [ ] All features work on physical devices
- [ ] App handles network failures gracefully
- [ ] Proper error boundaries implemented
- [ ] App state persists through backgrounding
- [ ] Push notifications work correctly (if implemented)

## 🚀 Submission Process

### 1. Upload Build to App Store Connect
```bash
# Submit iOS build to App Store Connect
eas submit --platform ios --profile production

# Submit Android build to Google Play Console
eas submit --platform android --profile production
```

### 2. Configure App Store Connect

#### App Information
- **Name**: QuitHero
- **Subtitle**: Personalized Quit Smoking Support
- **Description**: Evidence-based tools and personalized support to help you quit smoking and vaping permanently.

#### Keywords (100 characters max)
```
quit smoking,stop smoking,vape,nicotine,addiction,health,wellness,support
```

#### App Review Information
- **Demo Account**: Not required (no login needed)
- **Review Notes**: 
  ```
  QuitHero is a smoking cessation support app that provides:
  - Personalized quit plans based on behavioral assessment
  - Evidence-based tools for managing cravings
  - Educational content about nicotine replacement therapy
  - Progress tracking and milestone celebrations
  
  The app includes appropriate medical disclaimers and age verification.
  No demo account needed - full functionality available without signup.
  ```

#### Age Rating
- **Age Rating**: 17+
- **Reasons**: 
  - Simulated Gambling: None
  - Medical/Treatment Information: Frequent/Intense
  - Tobacco or Drug Use: References to tobacco use for cessation purposes

### 3. Privacy Nutrition Labels

Configure the following data types in App Store Connect:

#### Data Used to Track You
- None (we don't track users across apps)

#### Data Linked to You
- Health & Fitness: Smoking/vaping usage data, quit progress
- Usage Data: App interactions for personalization

#### Data Not Linked to You
- Diagnostics: Crash logs and performance data

## 🔍 Testing & Quality Assurance

### Pre-Submission Testing
1. **Device Testing**: Test on multiple iOS devices and screen sizes
2. **Network Testing**: Test with poor/no network connectivity
3. **Background Testing**: Ensure app state persists when backgrounded
4. **Notification Testing**: Verify push notifications work correctly
5. **Purchase Testing**: Test subscription flow with sandbox accounts
6. **Accessibility Testing**: Ensure app works with VoiceOver and other accessibility features

### TestFlight Distribution
```bash
# Upload to TestFlight for beta testing
eas submit --platform ios --profile production
```

1. Add internal testers in App Store Connect
2. Create external test groups for broader testing
3. Collect feedback and iterate before final submission

## 🚨 Common Issues & Troubleshooting

### Build Failures
- **Missing certificates**: Run `eas credentials` to manage certificates
- **Bundle identifier mismatch**: Ensure `app.json` matches App Store Connect
- **Dependency conflicts**: Clear node_modules and reinstall

### App Store Rejection Reasons
- **Medical claims**: Ensure all medical disclaimers are prominent
- **Age rating**: Verify 17+ rating is appropriate for tobacco content
- **Subscription terms**: Ensure terms are clearly disclosed before purchase
- **Privacy policy**: Must be accessible within the app

### Performance Issues
- **Bundle size**: Use `npx expo install --fix` to optimize dependencies
- **Memory usage**: Profile app with Xcode Instruments
- **Startup time**: Optimize initial bundle loading

## 📊 Post-Launch Monitoring

### Analytics Setup
- Monitor crash rates and performance metrics
- Track user engagement and retention
- Analyze conversion funnel performance
- Monitor subscription metrics and churn

### App Store Optimization
- Monitor keyword rankings and adjust
- A/B test app store screenshots and descriptions
- Respond to user reviews promptly
- Update app regularly based on user feedback

## 🔄 Update Process

### Regular Updates
```bash
# Increment version in app.json
# Build and submit new version
eas build --platform all --profile production
eas submit --platform all --profile production
```

### Emergency Updates
- Use Expo Updates for JavaScript-only changes
- Submit expedited review for critical fixes
- Communicate with users through in-app messaging

## 📞 Support Resources

- **Expo Documentation**: https://docs.expo.dev/
- **App Store Connect Help**: https://developer.apple.com/support/app-store-connect/
- **Google Play Console Help**: https://support.google.com/googleplay/android-developer/
- **EAS Build Status**: https://status.expo.dev/

---

## 🎯 Launch Checklist

Before submitting to App Store:

- [ ] All compliance modals implemented and tested
- [ ] Medical disclaimers reviewed by legal team
- [ ] Privacy policy and terms of service finalized
- [ ] Crisis resource contacts verified and current
- [ ] Subscription products configured in App Store Connect
- [ ] Age verification enforced (16+ requirement)
- [ ] App tested on multiple devices and iOS versions
- [ ] Screenshots and app store assets prepared
- [ ] Keywords and description optimized for discovery
- [ ] TestFlight beta testing completed with positive feedback

**Ready for App Store submission! 🚀**