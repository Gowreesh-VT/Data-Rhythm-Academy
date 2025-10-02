import React, { useState } from 'react';
import { authHelpers, dbHelpers } from '../lib/firebase';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

export function AdminSetup() {
  const [isCreating, setIsCreating] = useState(false);
  const [result, setResult] = useState<any>(null);

  const createSuperAdmin = async () => {
    setIsCreating(true);
    setResult(null);
    
    const adminEmail = 'superadmin@dataacademy.com';
    const adminPassword = 'SuperAdmin123!';
    
    try {
      // Create the admin account with super_admin role
      const { data: authResult, error: authError } = await authHelpers.signUp(
        adminEmail, 
        adminPassword,
        {
          full_name: 'Super Administrator',
          name: 'Super Administrator',
          role: 'super_admin'
        }
      );

      if (authError) {
        setResult({ success: false, error: authError.message });
        setIsCreating(false);
        return;
      }

      if (authResult?.user) {
        // Sign out the newly created admin user to avoid auto-login
        await authHelpers.signOut();
        
        setResult({ 
          success: true, 
          email: adminEmail, 
          password: adminPassword,
          message: 'Super Admin account created successfully!'
        });
      }
    } catch (error: any) {
      setResult({ success: false, error: error.message });
    }
    
    setIsCreating(false);
  };

  return (
    <div className="max-w-md mx-auto mt-8">
      <Card>
        <CardHeader>
          <CardTitle>🔧 Admin Setup</CardTitle>
          <CardDescription>
            Create the initial Super Admin account for the platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={createSuperAdmin} 
            disabled={isCreating}
            className="w-full"
          >
            {isCreating ? 'Creating Admin Account...' : 'Create Super Admin'}
          </Button>
          
          {result && (
            <div className={`p-4 rounded-lg ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              {result.success ? (
                <div className="text-green-800">
                  <p className="font-semibold">✅ {result.message}</p>
                  <p className="mt-2 text-sm">
                    <strong>Email:</strong> {result.email}<br/>
                    <strong>Password:</strong> {result.password}
                  </p>
                  <p className="mt-2 text-xs text-green-600">
                    Save these credentials and remove this setup component after use.
                  </p>
                </div>
              ) : (
                <div className="text-red-800">
                  <p className="font-semibold">❌ Error:</p>
                  <p className="text-sm">{result.error}</p>
                </div>
              )}
            </div>
          )}
          
          <div className="text-xs text-gray-500 p-3 bg-gray-50 rounded">
            <p><strong>⚠️ Security Note:</strong></p>
            <p>Remove this component after creating the super admin account.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}