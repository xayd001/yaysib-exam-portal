import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, onValue } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyB6Aas0GV9CpZVuRww9s0gkzQP9a2D8qfA",
  authDomain: "yaysib-exam-portal.firebaseapp.com",
  projectId: "yaysib-exam-portal",
  storageBucket: "yaysib-exam-portal.appspot.com",
  messagingSenderId: "1055728873733",
  appId: "1:1055728873733:web:7fd5d68d1b12b596245d6a",
  databaseURL: "https://yaysib-exam-portal-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export { ref, set, onValue };