#!/usr/bin/env node

// Admin User Setup Script
// Run this script to create an initial admin user for testing

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp, query, where, getDocs } = require('firebase/firestore');

// Firebase configuration (you should use your project config)
const firebaseConfig = {
  // Add your Firebase config here
  // You can get this from your Firebase project settings
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function createAdminUser() {
  try {
    console.log('🔍 Checking for existing admin users...');
    
    // Check if admin users already exist
    const adminQuery = query(collection(db, 'users'), where('role', '==', 'admin'));
    const adminSnapshot = await getDocs(adminQuery);
    
    if (!adminSnapshot.empty) {
      console.log('✅ Admin users already exist:', adminSnapshot.size);
      return;
    }
    
    console.log('🆕 Creating initial admin user...');
    
    const adminUser = {
      email: 'admin@dataridythmacademy.com',
      displayName: 'System Administrator',
      photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin&backgroundColor=b6e3f4',
      role: 'admin',
      profileStatus: 'active',
      permissions: {
        canManageUsers: true,
        canManageCourses: true,
        canViewAnalytics: true,
        canManagePayments: true,
        canManageContent: true,
        canAccessSystemSettings: true,
        canChangeUserRoles: true,
        canSuspendUsers: true,
        canDeleteUsers: true,
        canAssignInstructorStudents: true
      },
      enrolledCourses: [],
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, 'users'), adminUser);
    console.log('✅ Admin user created successfully with ID:', docRef.id);
    console.log('📧 Email:', adminUser.email);
    console.log('👤 Name:', adminUser.displayName);
    console.log('\n⚠️  IMPORTANT: You\'ll need to authenticate with this email in Firebase Auth');
    console.log('   to link this user document with an authenticated user.');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  }
}

// Run the setup
createAdminUser();