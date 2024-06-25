import firebase from 'firebase/compat/app'; // Import the compat version
import 'firebase/compat/auth'; // Import auth from compat
import 'firebase/compat/firestore'; // Import firestore from compat

const firebaseConfig = {
  apiKey: "AIzaSyDqXgDnRa1YIvi05UeKNEol8Lk97ZvjxiU",
  authDomain: "hackathon-b1e7a.firebaseapp.com",
  databaseURL: "https://hackathon-b1e7a-default-rtdb.firebaseio.com",
  projectId: "hackathon-b1e7a",
  storageBucket: "hackathon-b1e7a.appspot.com",
  messagingSenderId: "512659135482",
  appId: "1:512659135482:web:9042b67dc3367bb51ae243"

};

 const firebaseApp = firebase.initializeApp(firebaseConfig);

export const Auth = firebaseApp.auth();
export const db = firebaseApp.firestore();

