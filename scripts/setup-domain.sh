#!/bin/bash

# Firebase Hosting Setup Script for Data Rhythm Academy
# This script helps configure Firebase hosting for the custom domain

echo "🚀 Setting up Firebase Hosting for datarhythmacademy.in"
echo "=================================================="

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI is not installed. Please install it first:"
    echo "   npm install -g firebase-tools"
    exit 1
fi

# Check if user is logged in to Firebase
if ! firebase projects:list &> /dev/null; then
    echo "❌ Please login to Firebase first:"
    echo "   firebase login"
    exit 1
fi

echo "✅ Firebase CLI is ready"

# Set the correct Firebase project
echo "🔧 Setting Firebase project..."
firebase use the-data-rhythm-academy

# List current hosting sites
echo "📋 Current hosting sites:"
firebase hosting:sites:list

# Check if the custom site already exists
if firebase hosting:sites:get datarhythmacademy &> /dev/null; then
    echo "✅ Custom site 'datarhythmacademy' already exists"
else
    echo "🔧 Creating custom hosting site..."
    firebase hosting:sites:create datarhythmacademy
fi

echo ""
echo "🎯 Next Steps:"
echo "=============="
echo "1. Go to Firebase Console: https://console.firebase.google.com/project/the-data-rhythm-academy/hosting/main"
echo "2. Click 'Add custom domain'"
echo "3. Enter: datarhythmacademy.in"
echo "4. Follow the domain verification and DNS setup instructions"
echo ""
echo "📝 DNS Records to add:"
echo "====================="
echo "Root domain (datarhythmacademy.in):"
echo "  Type: A, Name: @, Value: 151.101.1.195"
echo "  Type: A, Name: @, Value: 151.101.65.195"
echo ""
echo "WWW subdomain:"
echo "  Type: CNAME, Name: www, Value: datarhythmacademy.in.web.app"
echo ""
echo "🚀 To deploy to the custom domain:"
echo "   npm run deploy:domain"
echo ""
echo "✅ Setup script completed!"