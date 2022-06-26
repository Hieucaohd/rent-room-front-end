import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: 'AIzaSyDiUF4VCtfJpXnPAjaIxqJ4Wxt2E2M0HrM',
    authDomain: 'rentroom-8f938.firebaseapp.com',
    projectId: 'rentroom-8f938',
    storageBucket: 'rentroom-8f938.appspot.com',
    messagingSenderId: '46805294171',
    appId: '1:46805294171:web:e687919b1a42224749b37e',
    measurementId: 'G-GZCYL1M0X1',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const fStorage = getStorage(app);

export { fStorage };
