#!/usr/bin/env node

// Admin User Removal Script
// Run this script to remove temporarily created admin users

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs, deleteDoc, doc } = require('firebase/firestore');

// You'll need to replace this with your actual Firebase config
const firebaseConfig = {
  // Add your Firebase config here if you want to run this standalone
  // Or use the existing config from your project
};

async function removeTemporaryAdminUser() {
  try {
    console.log('🔍 Searching for temporary admin users...');
    
    // Initialize Firebase (comment out if using existing config)
    // const app = initializeApp(firebaseConfig);
    // const db = getFirestore(app);
    
    // Import from existing setup
    const { db } = require('../src/lib/firebase');
    
    // Query for admin users
    const adminQuery = query(collection(db, 'users'), where('role', '==', 'admin'));
    const adminSnapshot = await getDocs(adminQuery);
    
    if (adminSnapshot.empty) {
      console.log('✅ No admin users found');
      return;
    }
    
    console.log(`📋 Found ${adminSnapshot.size} admin user(s):`);
    
    let tempAdminFound = false;
    
    for (const docSnapshot of adminSnapshot.docs) {
      const userData = docSnapshot.data();
      const userId = docSnapshot.id;
      
      console.log(`   - ${userData.displayName || 'No name'} (${userData.email}) - ID: ${userId}`);
      
      // Check if this is the temporary admin user
      if (userData.email === 'admin@dataridythmacademy.com' && 
          userData.displayName === 'System Administrator') {
        tempAdminFound = true;
        
        console.log('🗑️  Removing temporary admin user...');
        await deleteDoc(doc(db, 'users', userId));
        console.log('✅ Temporary admin user removed successfully!');
      }
    }
    
    if (!tempAdminFound) {
      console.log('ℹ️  No temporary admin user found (admin@dataridythmacademy.com)');
      console.log('   The existing admin users appear to be legitimate accounts.');
    }
    
  } catch (error) {
    console.error('❌ Error removing temporary admin user:', error);
  }
}

// Check if we're running this script directly
if (require.main === module) {
  removeTemporaryAdminUser();
}

module.exports = { removeTemporaryAdminUser };