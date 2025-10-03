import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  User
} from 'firebase/auth';
import { 
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  onSnapshot
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: (import.meta as any).env.VITE_FIREBASE_API_KEY || "AIzaSyC6uBm5cy5UdQ_HH7dg3hdhXj02M5ufSe4",
  authDomain: (import.meta as any).env.VITE_FIREBASE_AUTH_DOMAIN || "data-rhythm-academy.firebaseapp.com",
  projectId: (import.meta as any).env.VITE_FIREBASE_PROJECT_ID || "data-rhythm-academy",
  storageBucket: (import.meta as any).env.VITE_FIREBASE_STORAGE_BUCKET || "data-rhythm-academy.firebasestorage.app",
  messagingSenderId: (import.meta as any).env.VITE_FIREBASE_MESSAGING_SENDER_ID || "626593391633",
  appId: (import.meta as any).env.VITE_FIREBASE_APP_ID || "1:626593391633:web:154889339a14409530fdb0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Debug: Log current configuration in development
if ((import.meta as any).env.DEV) {
  console.log('Firebase Config:', {
    authDomain: firebaseConfig.authDomain,
    projectId: firebaseConfig.projectId,
    currentDomain: window.location.hostname
  });
}

// Auth providers
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

// Add additional scopes for better user data
googleProvider.addScope('email');
googleProvider.addScope('profile');
githubProvider.addScope('user:email');

// Auth helper functions
export const authHelpers = {
  // Sign up with email and password
  signUp: async (email: string, password: string, additionalData?: any) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return { 
        data: { user: userCredential.user }, 
        error: null 
      };
    } catch (error: any) {
      return { 
        data: null, 
        error: { message: error.message } 
      };
    }
  },

  // Sign in with email and password
  signIn: async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { 
        data: { user: userCredential.user }, 
        error: null 
      };
    } catch (error: any) {
      return { 
        data: null, 
        error: { message: error.message } 
      };
    }
  },

  // Sign in with OAuth (Google, GitHub, etc.)
  signInWithOAuth: async (provider: 'google' | 'github') => {
    try {
      const authProvider = provider === 'google' ? googleProvider : githubProvider;
      
      // Debug logging in development
      if ((import.meta as any).env.DEV) {
        console.log(`Attempting ${provider} OAuth sign-in...`);
        console.log('Auth domain:', firebaseConfig.authDomain);
        console.log('Current domain:', window.location.hostname);
      }
      
      const result = await signInWithPopup(auth, authProvider);
      return { 
        data: { user: result.user }, 
        error: null 
      };
    } catch (error: any) {
      // Enhanced error logging
      console.error(`${provider} OAuth Error:`, error);
      
      let errorMessage = error.message;
      if (error.code === 'auth/unauthorized-domain') {
        errorMessage = `Domain not authorized. Please add ${window.location.hostname} to Firebase authorized domains.`;
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Popup was blocked by browser. Please allow popups and try again.';
      }
      
      return { 
        data: null, 
        error: { message: errorMessage, code: error.code } 
      };
    }
  },

  // Sign out
  signOut: async () => {
    try {
      await signOut(auth);
      return { error: null };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  },

  // Get current user
  getCurrentUser: (): User | null => {
    return auth.currentUser;
  },

  // Listen to auth changes
  onAuthStateChange: (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
  },

  // Reset password
  resetPassword: async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { 
        data: { message: 'Password reset email sent' }, 
        error: null 
      };
    } catch (error: any) {
      return { 
        data: null, 
        error: { message: error.message } 
      };
    }
  }
};

// Firestore helper functions
export const dbHelpers = {
  // Create or update user profile
  createUserProfile: async (userId: string, userData: any) => {
    try {
      await setDoc(doc(db, 'users', userId), {
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date()
      }, { merge: true });
      return { success: true, error: null };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Get user profile
  getUserProfile: async (userId: string) => {
    try {
      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { data: docSnap.data(), error: null };
      } else {
        return { data: null, error: 'User profile not found' };
      }
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  // Update user profile
  updateUserProfile: async (userId: string, updates: any) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        ...updates,
        updatedAt: new Date()
      });
      return { success: true, error: null };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Create a new post
  createPost: async (postData: any) => {
    try {
      const docRef = await addDoc(collection(db, 'posts'), {
        ...postData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return { id: docRef.id, error: null };
    } catch (error: any) {
      return { id: null, error: error.message };
    }
  },

  // Get all posts
  getPosts: async () => {
    try {
      const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const posts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      return { data: posts, error: null };
    } catch (error: any) {
      return { data: [], error: error.message };
    }
  },

  // Listen to posts in real-time
  listenToPosts: (callback: (posts: any[]) => void) => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (querySnapshot) => {
      const posts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(posts);
    });
  }
};