'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, DocumentData, QuerySnapshot } from 'firebase/firestore';
import { db } from '../../../lib/firebaseConfig';
import { formatDate } from '@/lib/utils/formatDate';
import { useAuth } from '../../components/AuthContext';
import { useRouter } from 'next/navigation';
import CreateForm from '../../components/CreateForm'; 

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
  const [isCreating, setIsCreating] = useState(false); // State to toggle form visibility
  const { isAuthenticated } = useAuth();
  const router = useRouter();

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

  const handleCreate = () => {
    // Toggle form visibility
    setIsCreating(true);
  };

  const handleBack = () => {
    // Go back to the previous page
    router.back();
  };

  const handleCloseForm = () => {
    // Hide form
    setIsCreating(false);
  };

  if (loading) return <p>Loading Cricket data...</p>;
  if (error) return <p>{error}</p>;

  return (
    <main>
      <h1 className="page-title">Cricket</h1>
      <div className="flex justify-between mb-4">
        <button 
          onClick={handleBack}
          className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
        >
          Back
        </button>
        {isAuthenticated && !isCreating && (
          <button 
            onClick={handleCreate}
            className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
          >
            Create Post
          </button>
        )}
      </div>
      {isCreating && (
        <div className="create-form-overlay">
          <CreateForm category="cricket" />
          <button 
            onClick={handleCloseForm}
            className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
          >
            Close Form
          </button>
        </div>
      )}
      {data.length === 0 ? (
        <p>No Cricket data available</p>
      ) : (
        data.map((item) => (
          <div key={item.id} className="card">
            {item.title && <h2 className="card-title">{item.title}</h2>}
            {item.date && <p className="card-text"><strong>Date:</strong> {formatDate(new Date(item.date))}</p>}
            <p className="card-text">{item.content}</p>
            <a href={`/interests/cricket/${item.id}`} className="card-link">Read more</a>
            {isAuthenticated && (
              <div className="mt-2 flex space-x-2">
                <button className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600">Edit</button>
                <button className="bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600">Delete</button>
              </div>
            )}
          </div>
        ))
      )}
    </main>
  );
};

export default Cricket;
