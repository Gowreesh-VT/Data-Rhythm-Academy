// Firebase Debug Test
import { auth, db } from './firebase';

export const testFirebaseConnection = async () => {
  console.log('=== Firebase Connection Test ===');
  
  try {
    // Test Firebase config
    console.log('1. Firebase Config:', {
      apiKey: auth.app.options.apiKey?.substring(0, 10) + '...',
      authDomain: auth.app.options.authDomain,
      projectId: auth.app.options.projectId,
    });
    
    // Test auth connection
    console.log('2. Auth State:', {
      currentUser: auth.currentUser,
      isConnected: auth.app !== null
    });
    
    // Test if we can reach Firebase
    console.log('3. Testing auth methods availability...');
    const authMethods = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:createAuthUri?key=${auth.app.options.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        identifier: 'test@example.com',
        continueUri: window.location.origin
      })
    });
    
    console.log('4. Auth API Response Status:', authMethods.status);
    
    if (authMethods.status === 400) {
      console.error('❌ Firebase API returned 400 - Check if Email/Password auth is enabled');
    } else {
      console.log('✅ Firebase API accessible');
    }
    
  } catch (error) {
    console.error('❌ Firebase connection test failed:', error);
  }
};

// Call this in browser console to test
if (typeof window !== 'undefined') {
  (window as any).testFirebaseConnection = testFirebaseConnection;
}