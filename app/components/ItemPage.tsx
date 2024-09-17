"use client";
import { useParams, useRouter } from 'next/navigation'; 
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore'; 
import { db } from '../../lib/firebaseConfig'; 
import { formatDate } from '@/lib/utils/formatDate';
import renderContent from '../../lib/utils/renderContent';
import NotFound from '../../app/not-found';

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
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        if (!db) {
          setFetchError('Firestore instance is not initialized.');
          return;
        }

        const docRef = doc(db, collectionName, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setData(docSnap.data() as DocumentData);
        } else {
          setData(null); 
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error("Error fetching document:", error.message); 
          setFetchError('Error fetching data: ' + error.message);
        } else {
          console.error("An unknown error occurred", error); 
          setFetchError('An unknown error occurred.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, collectionName]);

  const handleBack = () => {
    router.back();
  };

  if (loading) return <p>Loading...</p>;

  if (fetchError) return <p>{fetchError}</p>;

  if (!data) return <NotFound />; 

  return (
    <div>
      <button
        onClick={handleBack}
        className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 mb-4"
      >
        Back
      </button>

      <div className="card">
        {data.title && <h1 className="card-title">{data.title}</h1>}
        {data.date && <p className="card-text"><strong>Posted:</strong> {formatDate(new Date(data.date))}</p>}
        <div className="card-text">
          {renderContent(data.content)}
        </div>
      </div>
    </div>
  );
};

export default ItemPage;
