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
  'misc',
  'music',
  'apps',
  'devops',
  'embedded',
];

export const searchAllCollections = async (keyword: string) => {
  const results: SearchResult[] = [];

  const cleanKeyword = keyword.toLowerCase().trim().replace(/\s+/g, '');

  for (const collectionName of collectionsToSearch) {
    const collectionRef = collection(db, collectionName);
    const querySnapshot = await getDocs(collectionRef);

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const title = (data.title || '').toLowerCase().replace(/\s+/g, '');

      if (title.includes(cleanKeyword)) {
        results.push({
          id: doc.id,
          title: data.title,
        });
      }
    });
  }

  return results;
};
