// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// import { getFunctions } from "firebase/functions";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAExQYDARDNGWfIVpa4F4M2gVyAsWUier4",
  authDomain: "notesapp-e78ab.firebaseapp.com",
  projectId: "notesapp-e78ab",
  storageBucket: "notesapp-e78ab.firebasestorage.app",
  messagingSenderId: "967641260901",
  appId: "1:967641260901:web:0aa2cfbc4b0f665771378c",
  measurementId: "G-SQ18LS444B"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);

export const db = getFirestore(app);
export const auth = getAuth(app);
// export const functions = getFunctions(app);