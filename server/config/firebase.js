const admin = require('firebase-admin');

const initializeFirebase = () => {
  if (admin.apps && admin.apps.length > 0) return;

  try {
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PROJECT_ID !== 'your-project-id') {
      admin.initializeApp({
        credential: admin.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        }),
      });
      console.log('Firebase initialized successfully');
    } else {
      console.warn('Firebase not configured. Auth middleware will reject requests.');
    }
  } catch (error) {
    console.error('Firebase initialization failed:', error.message);
  }
};

module.exports = { initializeFirebase, admin };
