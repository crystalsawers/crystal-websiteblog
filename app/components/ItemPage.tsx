"use client";
import { useParams, useRouter } from 'next/navigation'; 
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore'; 
import { db } from '../../lib/firebaseConfig'; 
import { formatDate } from '@/lib/utils/formatDate';

interface DocumentData {
  type: string;
  title?: string;
  content: string;
  date?: string;
}

const ItemPage = ({ collectionName }: { collectionName: string }) => {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === 'string' ? params.id : '';
  const [data, setData] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        if (!db) {
          throw new Error('Firestore instance is not initialized');
        }
        
        const docRef = doc(db, collectionName, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setData(docSnap.data() as DocumentData);
        } else {
          setError('Document not found');
        }
      } catch (error) {
        setError('Error fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, collectionName]);

  // Handle back button click
  const handleBack = () => {
    router.back();
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <main>
      {/* Back button */}
      <button
        onClick={handleBack}
        className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 mb-4"
      >
        Back
      </button>

      {data ? (
        <div className="card">
          {data.title && <h1 className="card-title">{data.title}</h1>}
          {data.date && <p className="card-text"><strong>Date:</strong> {formatDate(new Date(data.date))}</p>}
          <p className="card-text">{data.content}</p>
        </div>
      ) : (
        <p>Item not found</p>
      )}
    </main>
  );
};

export default ItemPage;
