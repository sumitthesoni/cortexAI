// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth, GoogleAuthProvider} from "firebase/auth"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "cortexai-d9f4f.firebaseapp.com",
  projectId: "cortexai-d9f4f",
  storageBucket: "cortexai-d9f4f.firebasestorage.app",
  messagingSenderId: "1072313039964",
  appId: "1:1072313039964:web:6213cef4df77bc2cf27a99"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth=getAuth(app)
export const googleProvider = new GoogleAuthProvider()