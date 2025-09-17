#!/bin/bash

# QuitHero Development Startup Script
# This script helps avoid Expo login issues during development

echo "🚀 Starting QuitHero development server..."
echo "📱 This will start the server without requiring Expo login"

# Clear any cached data that might cause issues
echo "🧹 Clearing Expo cache..."
npx expo start --clear --offline

echo "✅ Development server should now be running without login requirements!"
echo "📱 Open Expo Go on your phone and scan the QR code to test"
echo "🌐 The chatbot should now have internet access for Voiceflow connection"
