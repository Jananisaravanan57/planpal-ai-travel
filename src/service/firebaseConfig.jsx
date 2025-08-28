// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCrYwaqBhahBfccf8JA7VFkvxDXs30pohU",
  authDomain: "tripplanner-planpal.firebaseapp.com",
  projectId: "tripplanner-planpal",
  storageBucket: "tripplanner-planpal.firebasestorage.app",
  messagingSenderId: "347775852626",
  appId: "1:347775852626:web:da05716d5fca603a74ff8b",
  measurementId: "G-E3XGQSG7XW"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
// const analytics = getAnalytics(app);