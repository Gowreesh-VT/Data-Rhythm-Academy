// Temporary utility to create super admin account
// This should be removed after initial setup for security

import { authHelpers, dbHelpers } from '../lib/firebase';

export const createSuperAdmin = async () => {
  const adminEmail = 'superadmin@dataacademy.com';
  const adminPassword = 'SuperAdmin123!';
  
  try {
    // Create the admin account
    const { data: authResult, error: authError } = await authHelpers.signUp(
      adminEmail, 
      adminPassword,
      {
        name: 'Super Administrator',
        role: 'super_admin'
      }
    );

    if (authError) {
      console.error('Error creating admin account:', authError);
      return { success: false, error: authError };
    }

    // Update the user role to super_admin
    if (authResult?.user) {
      const { success, error } = await dbHelpers.updateUserRole(authResult.user.uid, 'super_admin');
      
      if (success) {
        console.log('✅ Super Admin account created successfully!');
        console.log('📧 Email:', adminEmail);
        console.log('🔑 Password:', adminPassword);
        return { success: true, email: adminEmail, password: adminPassword };
      } else {
        console.error('Error setting admin role:', error);
        return { success: false, error };
      }
    }
  } catch (error) {
    console.error('Error in createSuperAdmin:', error);
    return { success: false, error };
  }
};

// You can call this from browser console:
// import { createSuperAdmin } from './src/utils/setupAdmin.ts';
// createSuperAdmin();