"use client";
import { useParams } from 'next/navigation'; 
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore'; 
import { db } from '../../../../lib/firebaseConfig'; 

interface CricketDocument {
  type: string;
  title?: string;
  content: string;
  date?: string;
}

const CricketItem = () => {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : '';
  const [data, setData] = useState<CricketDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If ID is not available, return early
    if (!id) return;

    const fetchData = async () => {
      try {
        // Check if db is properly initialized
        if (!db) {
          throw new Error('Firestore instance is not initialized');
        }
        
        // Fetch the document based on the ID
        const docRef = doc(db, 'cricket', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          // Set the fetched data
          setData(docSnap.data() as CricketDocument);
        } else {
          // Handle case where document does not exist
          setError('Document not found');
        }
      } catch (error) {
        // Handle any errors that occur during data fetch
        setError('Error fetching data');
      } finally {
        // Update loading state
        setLoading(false);
      }
    };

    // Fetch data when ID changes
    fetchData();
  }, [id]);

  // Render based on loading, error, or fetched data
  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <main>
      {data ? (
        <div className="card">
          {data.title && <h1 className="card-title">{data.title}</h1>}
          <p className="card-text"><strong>Type:</strong> {data.type}</p>
          <p className="card-text">{data.content}</p>
          {data.date && <p className="card-text"><strong>Date:</strong> {data.date}</p>}
        </div>
      ) : (
        <p>Item not found</p>
      )}
    </main>
  );
};

export default CricketItem;
