// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
// Storage/functions/messaging removed (not used after switching from Firebase storage)
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyABu8EWcnuLmn51nCgkR5IUIDxy_aDWCjw",
    authDomain: "fir-kit-c3419.firebaseapp.com",
    projectId: "fir-kit-c3419",
    storageBucket: "fir-kit-c3419.firebasestorage.app",
    messagingSenderId: "759259842981",
    appId: "1:759259842981:web:e57ca3242aa346a4a2404c",
    measurementId: "G-9Z7CJJGVRK"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Analytics and browser-only services should be created only in the browser
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;