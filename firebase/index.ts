import firebase from 'firebase/app';
import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: 'AIzaSyAAzgV2U0kIyHHYA5GlS9tez-QnE36H_Vc',
    authDomain: 'webproject-88b95.firebaseapp.com',
    projectId: 'webproject-88b95',
    storageBucket: 'webproject-88b95.appspot.com',
    messagingSenderId: '766417987541',
    appId: '1:766417987541:web:bb33350186585a81dc3f5c',
    measurementId: 'G-L1FB07LPR3',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const fStorage = getStorage(app);

export { fStorage };
