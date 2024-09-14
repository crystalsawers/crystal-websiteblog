"use client";
import { useEffect, useState } from 'react';
import { collection, getDocs, DocumentData, QuerySnapshot } from 'firebase/firestore';
import { db } from '../../../lib/firebaseConfig';
import { formatDate } from '@/lib/utils/formatDate';

interface MusicDocument {
  id: string; 
  type: string;
  title?: string;
  content: string;
  date?: string;
}

const Music = () => {
  const [data, setData] = useState<MusicDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch documents from 'music' collection
        const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(collection(db, 'music'));

        // Map documents to MusicDocument type
        const items: MusicDocument[] = querySnapshot.docs.map((doc) => {
          // Extract document data and include id separately
          const data = doc.data() as MusicDocument;
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
        setError('Error fetching Music data');
      } finally {
        // Set loading to false
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p>Loading Music data...</p>;
  if (error) return <p>{error}</p>;

  return (
    <main>
      <h1 className="page-title">Music</h1>
      {data.length === 0 ? (
        <p>No Music data available</p>
      ) : (
        data.map((item) => (
          <div key={item.id} className="card">
            {item.title && <h2 className="card-title">{item.title}</h2>}
            {/* <p className="card-text"><strong>Type:</strong> {item.type}</p> */}
            {item.date && <p className="card-text"><strong>Date:</strong> {formatDate(new Date(item.date))}</p>}
            <p className="card-text">{item.content}</p>
            <a href={`/interests/music/${item.id}`} className="card-link">Read more</a>
          </div>
        ))
      )}
    </main>
  );
};

export default Music;
