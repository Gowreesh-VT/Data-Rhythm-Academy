// Admin User Setup Script
// This file helps create an initial admin user for testing the admin dashboard

import { createAdminUser } from '../lib/database';
import { logger } from '../utils/logger';

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
    const { getAllUsers } = await import('../lib/database');
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