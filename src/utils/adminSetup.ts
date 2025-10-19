// Admin User Setup Script
// This file helps create an initial admin user for testing the admin dashboard

import { createAdminUser, getAllUsers } from '../lib/database';
import { logger } from '../utils/logger';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export const setupInitialAdmin = async () => {
  try {
    logger.info('Creating initial admin user...');
    
    const adminData = {
      email: 'admin@dataridythmacademy.com',
      displayName: 'System Administrator',
      photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin&backgroundColor=b6e3f4'
    };

    const result = await createAdminUser(adminData);
    
    if (result.data) {
      logger.info('Initial admin user created successfully:', result.data.id);
      return result.data;
    } else if (result.error) {
      logger.error('Failed to create admin user:', result.error);
      return null;
    }
  } catch (error) {
    logger.error('Error in setupInitialAdmin:', error);
    return null;
  }
};

// Function to check if any admin users exist
export const checkAdminExists = async () => {
  try {
    const result = await getAllUsers('admin');
    
    if (result.data && result.data.length > 0) {
      logger.info(`Found ${result.data.length} admin users`);
      return true;
    } else {
      logger.info('No admin users found');
      return false;
    }
  } catch (error) {
    logger.error('Error checking for admin users:', error);
    return false;
  }
};

// Combined function to ensure admin access
export const ensureAdminAccess = async () => {
  const adminExists = await checkAdminExists();
  
  if (!adminExists) {
    logger.info('No admin users found, creating initial admin...');
    return await setupInitialAdmin();
  } else {
    logger.info('Admin users already exist');
    return true;
  }
};

// Function to list all admin users
export const listAdminUsers = async () => {
  try {
    const result = await getAllUsers('admin');
    
    if (result.data && result.data.length > 0) {
      logger.info('Admin users found:');
      result.data.forEach((user, index) => {
        logger.info(`${index + 1}. ${user.displayName || 'No name'} (${user.email}) - ID: ${user.id}`);
      });
      return result.data;
    } else {
      logger.info('No admin users found');
      return [];
    }
  } catch (error) {
    logger.error('Error listing admin users:', error);
    return [];
  }
};

// Function to remove a specific admin user by ID
export const removeAdminUser = async (userId: string) => {
  try {
    await deleteDoc(doc(db, 'users', userId));
    logger.info(`Admin user with ID ${userId} has been removed`);
    return { success: true };
  } catch (error) {
    logger.error('Error removing admin user:', error);
    return { error: error as Error };
  }
};

// Function to remove the temporary admin user created by setupInitialAdmin
export const removeTemporaryAdmin = async () => {
  try {
    const result = await getAllUsers('admin');
    
    if (result.data && result.data.length > 0) {
      // Find the admin user with the specific email created by setupInitialAdmin
      const tempAdmin = result.data.find(user => 
        user.email === 'admin@dataridythmacademy.com' && 
        user.displayName === 'System Administrator'
      );
      
      if (tempAdmin) {
        const removeResult = await removeAdminUser(tempAdmin.id);
        if (removeResult.success) {
          logger.info('Temporary admin user removed successfully');
          return { success: true, removedUser: tempAdmin };
        } else {
          return { error: removeResult.error };
        }
      } else {
        logger.info('No temporary admin user found to remove');
        return { success: true, message: 'No temporary admin user found' };
      }
    } else {
      logger.info('No admin users found');
      return { success: true, message: 'No admin users found' };
    }
  } catch (error) {
    logger.error('Error removing temporary admin:', error);
    return { error: error as Error };
  }
};

// Function to remove all admin users (use with caution!)
export const removeAllAdminUsers = async () => {
  try {
    const adminUsers = await listAdminUsers();
    
    if (adminUsers.length === 0) {
      logger.info('No admin users to remove');
      return { success: true, message: 'No admin users found' };
    }
    
    logger.info(`Removing ${adminUsers.length} admin users...`);
    const results = await Promise.all(
      adminUsers.map(user => removeAdminUser(user.id))
    );
    
    const successful = results.filter(result => result.success).length;
    const failed = results.length - successful;
    
    if (failed === 0) {
      logger.info(`Successfully removed all ${successful} admin users`);
      return { success: true, removed: successful };
    } else {
      logger.error(`Removed ${successful} admin users, ${failed} failed`);
      return { success: false, removed: successful, failed };
    }
  } catch (error) {
    logger.error('Error removing all admin users:', error);
    return { error: error as Error };
  }
};