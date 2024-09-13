"use client";
import { useEffect, useState } from 'react';
import { collection, getDocs, DocumentData, QuerySnapshot } from 'firebase/firestore';
import { db } from '../../../lib/firebaseConfig';

// Define the data type based on your API structure
interface CricketDocument {
  type: string;
  title?: string;
  content: string;
  date?: string;
}

const Cricket = () => {
  const [data, setData] = useState<CricketDocument[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(collection(db, 'cricket'));
        const items: CricketDocument[] = querySnapshot.docs.map((doc) => doc.data() as CricketDocument);
        setData(items);
      } catch (error) {
        console.error('Error fetching Cricket data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <main>
      <h1>Cricket</h1>
      {data.length === 0 ? (
        <p>Loading Cricket data...</p>
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

export default Cricket;
