import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCi8OjiVq3D0n_cFCtie3g3Q54VLAebv5g",
  authDomain: "dress-2f77d.firebaseapp.com",
  projectId: "dress-2f77d",
  storageBucket: "dress-2f77d.firebasestorage.app",
  messagingSenderId: "91820862753",
  appId: "1:91820862753:web:9e7bdbb34a3e5a2415a260",
  measurementId: "G-YK8YH37QVH",
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(app);
