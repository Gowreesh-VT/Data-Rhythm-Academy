import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { dbHelpers } from '../lib/firebase';

export function DebugPanel() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const checkSuperAdmin = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      console.log('Checking for super admin account...');
      const { data: users, error } = await dbHelpers.getAllUsers();
      
      if (error) {
        setResult({ error: `Failed to fetch users: ${error}` });
        console.error('Error fetching users:', error);
        return;
      }

      console.log('All users found:', users);
      
      const superAdmin = users?.find((user: any) => user.email === 'superadmin@dataacademy.com');
      
      if (superAdmin) {
        setResult({ 
          success: true, 
          message: 'Super admin account found!',
          data: superAdmin 
        });
        console.log('Super admin found:', superAdmin);
      } else {
        setResult({ 
          success: false, 
          message: 'Super admin account NOT found',
          allUsers: users?.map((u: any) => ({ email: u.email, role: u.role }))
        });
        console.log('Super admin not found. Available users:', users?.map((u: any) => ({ email: u.email, role: u.role })));
      }
    } catch (error: any) {
      setResult({ error: `Unexpected error: ${error.message}` });
      console.error('Unexpected error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>🔍 Debug Panel</CardTitle>
        <CardDescription>
          Check if super admin account exists
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={checkSuperAdmin} 
          disabled={loading}
          className="mb-4"
        >
          {loading ? 'Checking...' : 'Check Super Admin Account'}
        </Button>
        
        {result && (
          <div className={`p-4 rounded-lg ${
            result.error ? 'bg-red-50 border border-red-200' : 
            result.success ? 'bg-green-50 border border-green-200' : 
            'bg-yellow-50 border border-yellow-200'
          }`}>
            <pre className="text-sm whitespace-pre-wrap">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}