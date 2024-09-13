"use client";
import { useEffect, useState } from 'react';
import { collection, getDocs, DocumentData, QuerySnapshot } from 'firebase/firestore';
import { db } from '../../../lib/firebaseConfig';

interface CricketDocument {
  id: string; 
  type: string;
  title?: string;
  content: string;
  date?: string;
}

const Cricket = () => {
  const [data, setData] = useState<CricketDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch documents from 'cricket' collection
        const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(collection(db, 'cricket'));

        // Map documents to CricketDocument type
        const items: CricketDocument[] = querySnapshot.docs.map((doc) => {
          // Extract document data and include id separately
          const data = doc.data() as CricketDocument;
          return {
            id: doc.id, // Set ID separately
            type: data.type,
            title: data.title,
            content: data.content,
            date: data.date
          };
        });

        // Set data to state
        setData(items);
      } catch (error) {
        // Set error message
        setError('Error fetching Cricket data');
      } finally {
        // Set loading to false
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p>Loading Cricket data...</p>;
  if (error) return <p>{error}</p>;

  return (
    <main>
      <h1 className="page-title">Cricket</h1>
      {data.length === 0 ? (
        <p>No Cricket data available</p>
      ) : (
        data.map((item) => (
          <div key={item.id} className="card">
            {item.title && <h2 className="card-title">{item.title}</h2>}
            <p className="card-text"><strong>Type:</strong> {item.type}</p>
            <p className="card-text">{item.content}</p>
            {item.date && <p className="card-text"><strong>Date:</strong> {item.date}</p>}
            <a href={`/interests/cricket/${item.id}`} className="card-link">Read more</a>
          </div>
        ))
      )}
    </main>
  );
};

export default Cricket;
