import { collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";

export const createSeries = async (name: string) => {
  const seriesRef = collection(db, "series");
  
  // Check if series already exists
  const q = query(seriesRef, where("name", "==", name));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    throw new Error("Series already exists");
  }

  // If no duplicate, create the series
  const docRef = await addDoc(seriesRef, {
    name,
    postsCount: 0,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};
