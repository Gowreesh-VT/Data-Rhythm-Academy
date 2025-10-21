const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function fixAdminRole() {
  try {
    const userId = '3H6auLEi7hVdw6fdaRiYxsN3n632';
    
    await db.collection('users').doc(userId).update({
      role: 'admin' // Remove the trailing space
    });
    
    console.log('✅ Successfully fixed admin role - removed trailing space');
    console.log('Your role is now: "admin" (without space)');
    console.log('\nPlease logout and login again for changes to take effect.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing admin role:', error);
    process.exit(1);
  }
}

fixAdminRole();
