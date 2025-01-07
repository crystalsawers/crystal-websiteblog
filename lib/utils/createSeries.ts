import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";

export const createSeries = async (name: string) => {
  try {
    await addDoc(collection(db, "series"), {
      name,
      postsCount: 0,
      createdAt: serverTimestamp(),
    });
    console.log("Series created successfully");
  } catch (error) {
    console.error("Error creating series:", error);
    throw new Error("Failed to create series");
  }
};
