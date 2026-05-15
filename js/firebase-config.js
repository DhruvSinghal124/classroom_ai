/**
 * Classroom.AI — Firebase Configuration (Single Source of Truth)
 * ==============================================================
 * All pages import from this file. No more duplicated configs.
 */
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyD_IAWIY058J-VYRZX2U4AE1H2XZQ-6gV4",
  authDomain: "classroomai-20.firebaseapp.com",
  projectId: "classroomai-20",
  storageBucket: "classroomai-20.appspot.com",
  messagingSenderId: "9778016549",
  appId: "1:9778016549:web:c8325a2404ef6966012acc",
  measurementId: "G-BD49V29EWR"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword };
