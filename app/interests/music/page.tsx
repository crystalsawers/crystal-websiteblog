"use client";
import { useEffect, useState } from 'react';
import { collection, getDocs, DocumentData, QuerySnapshot } from 'firebase/firestore';
import { db } from '../../../lib/firebaseConfig';

// Define the data type based on your API structure
interface MusicDocument {
  type: string;
  title?: string;
  content: string;
  date?: string;
}

const Music = () => {
  const [data, setData] = useState<MusicDocument[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(collection(db, 'music'));
        const items: MusicDocument[] = querySnapshot.docs.map((doc) => doc.data() as MusicDocument);
        setData(items);
      } catch (error) {
        console.error('Error fetching Music data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <main>
      <h1>Music</h1>
      {data.length === 0 ? (
        <p>Loading Music data...</p>
      ) : (
        data.map((item, index) => (
          <div key={index}>
            {item.title && <h2>{item.title}</h2>}
            <p><strong>Type:</strong> {item.type}</p>
            <p>{item.content}</p>
            {item.date && <p><strong>Date:</strong> {item.date}</p>}
          </div>
        ))
      )}
    </main>
  );
};

export default Music;
