# Firebase Setup Guide

This project uses Firebase for authentication and Firestore for the database.

## 🔥 Firebase Configuration

### 1. Create a Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Follow the setup wizard

### 2. Enable Authentication
1. In the Firebase console, go to **Authentication** → **Sign-in method**
2. Enable the following providers:
   - **Email/Password**
   - **Google** (configure OAuth consent screen)
   - **GitHub** (add your GitHub OAuth app credentials)

### 3. Set up Firestore Database
1. Go to **Firestore Database** → **Create database**
2. Choose **Start in production mode**
3. Select a location close to your users

### 4. Configure Environment Variables
Create a `.env.local` file in your project root with your Firebase config:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 5. Configure Authorized Domains

**IMPORTANT**: Add these domains to Firebase Auth authorized domains:

1. Go to Firebase Console → Authentication → Settings → Authorized domains
2. Add these domains:
   - `data-rhythm-academy.web.app`
   - `data-rhythm-academy.firebaseapp.com`
   - `localhost` (for development)

### 6. Configure OAuth Providers

#### GitHub OAuth
1. Go to GitHub → Settings → Developer settings → OAuth Apps
2. Create a new OAuth app with:
   - **Application name**: Data Rhythm Academy
   - **Homepage URL**: `https://data-rhythm-academy.web.app`
   - **Authorization callback URL**: `https://data-rhythm-academy.firebaseapp.com/__/auth/handler`
3. Copy the Client ID and Client Secret
4. In Firebase Console → Authentication → Sign-in method → GitHub:
   - Enable GitHub
   - Enter Client ID and Client Secret

#### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the Google+ API
3. Configure OAuth consent screen
4. Create OAuth 2.0 Client ID:
   - **Application type**: Web application
   - **Authorized JavaScript origins**: 
     - `https://data-rhythm-academy.web.app`
     - `https://data-rhythm-academy.firebaseapp.com`
   - **Authorized redirect URIs**:
     - `https://data-rhythm-academy.firebaseapp.com/__/auth/handler`
5. Copy the Client ID
6. In Firebase Console → Authentication → Sign-in method → Google:
   - Enable Google
   - Enter Client ID
   - `data-rhythm-academy.web.app`
   - `data-rhythm-academy.firebaseapp.com`

## 🔒 Security Rules

The project includes Firestore security rules in `firestore.rules`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Posts collection - read public, write authenticated
    match /posts/{postId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## 🚀 Deployment

Deploy both hosting and Firestore rules:
```bash
npm run deploy
```

This will:
1. Build the React app
2. Deploy to Firebase Hosting
3. Deploy Firestore security rules
4. Deploy Firestore indexes

## 📊 Database Structure

### Users Collection (`/users/{userId}`)
```javascript
{
  email: "user@example.com",
  name: "User Name",
  photoURL: "https://...",
  provider: "google|github|email",
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Posts Collection (`/posts/{postId}`)
```javascript
{
  title: "Post Title",
  content: "Post content...",
  authorId: "user_id",
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## 🛠️ Available Functions

### Authentication
- `authHelpers.signUp(email, password, additionalData)`
- `authHelpers.signIn(email, password)`
- `authHelpers.signInWithOAuth(provider)` // 'google' | 'github'
- `authHelpers.signOut()`
- `authHelpers.resetPassword(email)`

### Database
- `dbHelpers.createUserProfile(userId, userData)`
- `dbHelpers.getUserProfile(userId)`
- `dbHelpers.updateUserProfile(userId, updates)`
- `dbHelpers.createPost(postData)`
- `dbHelpers.getPosts()`
- `dbHelpers.listenToPosts(callback)` // Real-time listener

## � Analytics

The project includes Google Analytics for tracking user behavior and site performance:

- **Google Analytics ID**: `G-H3XRRBC8L6`
- **Tracking**: Page views, user interactions, conversion events
- **Privacy**: Compliant with GDPR and privacy regulations

The Google Analytics code is automatically included in the production build.

## �🔧 Local Development

1. Install dependencies: `npm install`
2. Set up environment variables in `.env.local`
3. Start development server: `npm run dev`
4. The app will be available at `http://localhost:5173`

## 📱 Features

- ✅ Email/Password Authentication
- ✅ Google OAuth
- ✅ GitHub OAuth
- ✅ User Profile Management
- ✅ Firestore Database Integration
- ✅ Real-time Data Updates
- ✅ Security Rules
- ✅ Automatic User Profile Creation
- ✅ Google Analytics Integration