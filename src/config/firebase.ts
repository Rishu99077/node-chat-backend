
import { initializeApp, getApps, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const firebaseApp = getApps().length
    ? getApps()[0]
    : initializeApp({
        credential: applicationDefault()
    });

export const firestore = getFirestore(firebaseApp);

console.log('Firebase Project:', firebaseApp.options.projectId);
