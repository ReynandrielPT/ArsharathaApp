// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBHkBfHyBUdhlMDTutulaXitP4OVbIXgjg",
  authDomain: "arsharatha-gh6.firebaseapp.com",
  projectId: "arsharatha-gh6",
  storageBucket: "arsharatha-gh6.firebasestorage.app",
  messagingSenderId: "763806506039",
  appId: "1:763806506039:web:8f3e2d13a504f5dbc6f3b2",
  measurementId: "G-BL1PDWRM1Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);