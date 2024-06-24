// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';


const firebaseConfig = {
    apiKey: "AIzaSyDqXgDnRa1YIvi05UeKNEol8Lk97ZvjxiU",
    authDomain: "hackathon-b1e7a.firebaseapp.com",
    databaseURL: "https://hackathon-b1e7a-default-rtdb.firebaseio.com",
    projectId: "hackathon-b1e7a",
    storageBucket: "hackathon-b1e7a.appspot.com",
    messagingSenderId: "512659135482",
    appId: "1:512659135482:web:9042b67dc3367bb51ae243"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const firestore = getFirestore(app);
