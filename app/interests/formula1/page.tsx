'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, DocumentData, QuerySnapshot } from 'firebase/firestore';
import { db } from '../../../lib/firebaseConfig';
import { formatDate } from '@/lib/utils/formatDate';
import { useAuth } from '../../components/AuthContext';
import { useRouter } from 'next/navigation';
import CreateForm from '../../components/CreateForm'; 
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
  const [isCreating, setIsCreating] = useState(false); // State to toggle form visibility
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch documents from 'formula1' collection
        const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(collection(db, 'formula1'));
        console.log('Query Snapshot:', querySnapshot);

        // Map documents to Formula1Document type
        const items: Formula1Document[] = querySnapshot.docs.map((doc) => {
          // Extract document data and include id separately
          const data = doc.data() as Formula1Document;
          console.log('Document Data:', data);
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
        console.error('Error fetching Formula 1 data:', error);
        setError('Error fetching Formula 1 data');
      } finally {
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

  if (loading) return <p>Loading Formula 1 data...</p>;
  if (error) return <p>{error}</p>;

  return (
    <main>
      <h1 className="page-title">Formula 1</h1>
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
          <CreateForm category="formula1" />
          <button 
            onClick={handleCloseForm}
            className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
          >
            Close Form
          </button>
        </div>
      )}
      {data.length === 0 ? (
        <p>No Formula 1 data available</p>
      ) : (
        data.map((item) => (
          <div key={item.id} className="card">
            {item.title && <h2 className="card-title">{item.title}</h2>}
            {item.date && <p className="card-text"><strong>Date:</strong> {formatDate(new Date(item.date))}</p>}
            <p className="card-text">{item.content}</p>
            <a href={`/interests/formula1/${item.id}`} className="card-link">Read more</a>
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

export default Formula1;
