"use client";
import { useEffect, useState } from 'react';
import { collection, getDocs, DocumentData, QuerySnapshot } from 'firebase/firestore';
import { db } from '../../../lib/firebaseConfig';

// Define the data type based on your API structure
interface Formula1Document {
  type: string;
  title?: string;
  content: string;
  date?: string;
}

const Formula1 = () => {
  const [data, setData] = useState<Formula1Document[]>([]);

  // Fetch data from Firestore
  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(collection(db, 'formula1'));
        const items: Formula1Document[] = querySnapshot.docs.map((doc) => doc.data() as Formula1Document);
        setData(items);
      } catch (error) {
        console.error('Error fetching Formula 1 data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <main>
      <h1>Formula 1</h1>
      {data.length === 0 ? (
        <p>Loading Formula 1 data...</p>
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

export default Formula1;
