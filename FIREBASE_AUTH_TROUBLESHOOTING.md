# Firebase Authentication Troubleshooting

## 🚨 Common Issues and Solutions

### Issue: `auth/unauthorized-domain` Error

This error occurs when Firebase doesn't recognize your domain as authorized for authentication.

#### ✅ **Step 1: Add Authorized Domains**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: `data-rhythm-academy`
3. Navigate to: **Authentication** → **Settings** → **Authorized domains** tab
4. Click **Add domain** and add these domains:
   ```
   data-rhythm-academy.web.app
   data-rhythm-academy.firebaseapp.com
   localhost
   ```

#### ✅ **Step 2: Configure OAuth Providers**

##### Google OAuth Setup:
1. **Firebase Console** → **Authentication** → **Sign-in method**
2. Click **Google** and enable it
3. **Google Cloud Console** setup:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Select project: `data-rhythm-academy`
   - Go to **APIs & Services** → **Credentials**
   - Create **OAuth 2.0 Client ID**:
     - Application type: **Web application**
     - Authorized JavaScript origins:
       ```
       https://data-rhythm-academy.web.app
       https://data-rhythm-academy.firebaseapp.com
       http://localhost:5173
       ```
     - Authorized redirect URIs:
       ```
       https://data-rhythm-academy.firebaseapp.com/__/auth/handler
       ```

##### GitHub OAuth Setup:
1. **Firebase Console** → **Authentication** → **Sign-in method**
2. Click **GitHub** and enable it
3. **GitHub** setup:
   - Go to GitHub → Settings → Developer settings → OAuth Apps
   - Create new OAuth App:
     - Application name: `Data Rhythm Academy`
     - Homepage URL: `https://data-rhythm-academy.web.app`
     - Authorization callback URL: `https://data-rhythm-academy.firebaseapp.com/__/auth/handler`
   - Copy Client ID and Client Secret to Firebase Console

#### ✅ **Step 3: Verify Configuration**

Current Firebase Config (from your code):
```javascript
{
  apiKey: "AIzaSyC6uBm5cy5UdQ_HH7dg3hdhXj02M5ufSe4",
  authDomain: "data-rhythm-academy.firebaseapp.com",
  projectId: "data-rhythm-academy",
  storageBucket: "data-rhythm-academy.firebasestorage.app",
  messagingSenderId: "626593391633",
  appId: "1:626593391633:web:154889339a14409530fdb0"
}
```

## 🔧 Testing Authentication

### Test OAuth in Browser Console:
```javascript
// Test Google Sign-in
firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider())
  .then((result) => console.log('Google Auth Success:', result))
  .catch((error) => console.error('Google Auth Error:', error));

// Test GitHub Sign-in  
firebase.auth().signInWithPopup(new firebase.auth.GithubAuthProvider())
  .then((result) => console.log('GitHub Auth Success:', result))
  .catch((error) => console.error('GitHub Auth Error:', error));
```

## 📋 Checklist

- [ ] Added `data-rhythm-academy.web.app` to Firebase authorized domains
- [ ] Added `data-rhythm-academy.firebaseapp.com` to Firebase authorized domains
- [ ] Added `localhost` to Firebase authorized domains
- [ ] Enabled Google sign-in method in Firebase Console
- [ ] Enabled GitHub sign-in method in Firebase Console
- [ ] Configured Google OAuth in Google Cloud Console
- [ ] Configured GitHub OAuth in GitHub Developer settings
- [ ] Added correct redirect URIs to OAuth providers
- [ ] Verified Firebase config values

## 🌐 URLs to Configure

### Firebase Console URLs:
- Project Console: https://console.firebase.google.com/project/data-rhythm-academy
- Authentication: https://console.firebase.google.com/project/data-rhythm-academy/authentication/users
- Authorized Domains: https://console.firebase.google.com/project/data-rhythm-academy/authentication/settings

### OAuth Provider URLs:
- Google Cloud Console: https://console.cloud.google.com/apis/credentials?project=data-rhythm-academy
- GitHub OAuth Apps: https://github.com/settings/developers

## 🔍 Debug Information

If you're still having issues, check:

1. **Browser Developer Tools** → **Console** for detailed error messages
2. **Network Tab** to see if requests are being blocked
3. **Application Tab** → **Cookies** to verify Firebase session cookies
4. Try **Incognito/Private browsing** to rule out cache issues

## 🚀 Quick Fix Commands

After configuring OAuth providers, redeploy:
```bash
npm run build
npm run deploy
```

Wait 5-10 minutes after configuration changes before testing, as OAuth settings can take time to propagate.