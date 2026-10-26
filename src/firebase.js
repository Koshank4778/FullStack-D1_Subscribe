import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyB5YBfxbAiMgiopjC9EFNEc7Y4OIY3tqgg",
    authDomain: "dev-deakin-d1.firebaseapp.com",
    projectId: "dev-deakin-d1",
    storageBucket: "dev-deakin-d1.firebasestorage.app",
    messagingSenderId: "181568383094",
    appId: "1:181568383094:web:96c29718b1a4ce608d1757",
    measurementId: "G-26Y1B4XKPK"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
