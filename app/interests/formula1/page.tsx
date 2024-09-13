"use client";
import { useEffect, useState } from 'react';
import { collection, getDocs, DocumentData, QuerySnapshot } from 'firebase/firestore';
import { db } from '../../../lib/firebaseConfig';
import { formatDate } from '@/lib/utils/formatDate';

interface Formula1Document {
  id: string; 
  type: string;
  title?: string;
  content: string;
  date?: string;
}

const Formula1 = () => {
  const [data, setData] = useState<Formula1Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch documents from 'formula1' collection
        const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(collection(db, 'formula1'));

        // Map documents to Formula1Document type
        const items: Formula1Document[] = querySnapshot.docs.map((doc) => {
          // Extract document data and include id separately
          const data = doc.data() as Formula1Document;
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
        setError('Error fetching Formula1 data');
      } finally {
        // Set loading to false
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p>Loading Formula1 data...</p>;
  if (error) return <p>{error}</p>;

  return (
    <main>
      <h1 className="page-title">Formula1</h1>
      {data.length === 0 ? (
        <p>No Formula1 data available</p>
      ) : (
        data.map((item) => (
          <div key={item.id} className="card">
            {item.title && <h2 className="card-title">{item.title}</h2>}
            <p className="card-text"><strong>Type:</strong> {item.type}</p>
            <p className="card-text">{item.content}</p>
            {item.date && <p className="card-text"><strong>Date:</strong> {formatDate(new Date(item.date))}</p>}
            <a href={`/interests/formula1/${item.id}`} className="card-link">Read more</a>
          </div>
        ))
      )}
    </main>
  );
};

export default Formula1;
