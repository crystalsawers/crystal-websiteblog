import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDTGgQE4lvX3YdF9fb9CJ1gd7mExhOBiyA",
  authDomain: "crystal-personalblog.firebaseapp.com",
  projectId: "crystal-personalblog",
  storageBucket: "crystal-personalblog.appspot.com",
  messagingSenderId: "1098650212487",
  appId: "1:1098650212487:web:c9ef6022359895099b4022",
  measurementId: "G-JL48ZM0W6Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

export { db, collection, doc, setDoc };

