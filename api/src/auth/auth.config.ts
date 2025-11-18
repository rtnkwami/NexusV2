import * as admin from 'firebase-admin';

admin.initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID });

export const auth = admin.auth();
