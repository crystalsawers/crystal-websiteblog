import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebaseConfig';

interface SearchResult {
  id: string;
  title: string;
}

const collectionsToSearch = [
  'cricket',
  'formula1',
  'lifestyle',
  'makeup',
  'music',
];

export const searchAllCollections = async (
  keyword: string,
): Promise<SearchResult[]> => {
  const results: SearchResult[] = [];

  for (const collectionName of collectionsToSearch) {
    const collectionRef = collection(db, collectionName);
    const querySnapshot = await getDocs(collectionRef);

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const id = doc.id;

      // Check if the title matches the keyword
      if (data.title?.toLowerCase().includes(keyword.toLowerCase())) {
        results.push({ id, title: data.title });
      }
    });
  }

  return results;
};
