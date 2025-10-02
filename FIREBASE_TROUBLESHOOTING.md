# Firebase Authentication 400 Error Troubleshooting

## 🚨 Error: 400 Bad Request on Firebase signUp

This error typically occurs when Firebase Authentication is not properly configured. Here's how to fix it:

### ✅ **Step 1: Enable Email/Password Authentication**

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: **data-rhythm-academy**
3. Navigate to **Authentication** → **Sign-in method**
4. Click on **Email/Password**
5. **Enable** the Email/Password provider
6. Click **Save**

### ✅ **Step 2: Check Authorized Domains**

1. In Firebase Console → Authentication → Settings → **Authorized domains**
2. Make sure these domains are added:
   - `localhost` (for development)
   - `data-rhythm-academy.web.app` (for production)
   - Any custom domains you're using

### ✅ **Step 3: Verify Firebase Configuration**

Check that your Firebase config in `/src/lib/firebase.ts` has the correct values:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC6uBm5cy5UdQ_HH7dg3hdhXj02M5ufSe4",
  authDomain: "data-rhythm-academy.firebaseapp.com",
  projectId: "data-rhythm-academy",
  storageBucket: "data-rhythm-academy.firebasestorage.app",
  messagingSenderId: "626593391633",
  appId: "1:626593391633:web:154889339a14409530fdb0"
};
```

### ✅ **Step 4: Test Registration**

After enabling Email/Password authentication:

1. Go to `http://localhost:3001/register`
2. Try registering with a test email
3. Check browser console for detailed error messages
4. Check Firebase Console → Authentication → Users to see if user was created

### 🔧 **Alternative: Use Setup Page**

If registration still fails, try the admin setup page:
- Go to `http://localhost:3001/setup`
- This uses the same Firebase authentication but with different error handling

### 📋 **Common Error Codes**

- **auth/operation-not-allowed**: Email/Password authentication not enabled
- **auth/weak-password**: Password should be at least 6 characters
- **auth/email-already-in-use**: Email already registered
- **auth/invalid-email**: Email format is invalid

### 🚀 **Quick Test**

Try this in your browser console:
```javascript
// Test Firebase connection
console.log('Firebase config:', firebase.app().options);
```