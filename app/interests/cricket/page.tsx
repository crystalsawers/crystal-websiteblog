'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, DocumentData, QuerySnapshot, doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebaseConfig';
import { formatDate } from '@/lib/utils/formatDate';
import { useAuth } from '../../components/AuthContext';
import { useRouter } from 'next/navigation';
import CreateForm from '../../components/CreateForm'; 
import EditForm from '../../components/EditForm';

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
  const [isCreating, setIsCreating] = useState(false);
  const [editingPost, setEditingPost] = useState<CricketDocument | null>(null);
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(collection(db, 'cricket'));
        const items: CricketDocument[] = querySnapshot.docs.map((doc) => {
          const data = doc.data() as CricketDocument;
          return {
            id: doc.id,
            type: data.type,
            title: data.title,
            content: data.content,
            date: data.date
          };
        });
        setData(items);
      } catch (error) {
        setError('Error fetching Cricket data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCreate = () => {
    setIsCreating(true);
  };

  const handleBack = () => {
    router.back();
  };

  const handleCloseForm = () => {
    setIsCreating(false);
    setEditingPost(null);
  };

  // Handle editing functionality
  const handleEdit = async (id: string) => {
    if (!isAuthenticated) return;

    try {
      const docRef = doc(db, 'cricket', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setEditingPost({
          id: docSnap.id,
          ...docSnap.data() as Omit<CricketDocument, 'id'>
        });
      }
    } catch (error) {
      console.error('Error fetching document for editing:', error);
    }
  };

  // Handle delete functionality
  const handleDelete = async (id: string) => {
    if (!isAuthenticated) return;

    const confirmDelete = window.confirm("Are you sure you want to delete this post?");
    
    if (!confirmDelete) {
      return; 
    }

    try {
      const docRef = doc(db, 'cricket', id);
      await deleteDoc(docRef);
      setData(data.filter((item) => item.id !== id));
    } catch (error) {
      console.error('Error deleting document:', error);
      setError('Failed to delete post.');
    }
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
      {editingPost && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
          <EditForm 
            postId={editingPost.id}
            initialData={editingPost}
            onClose={handleCloseForm}
          />
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
                <button 
                  onClick={() => handleEdit(item.id)} 
                  className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600"
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDelete(item.id)} 
                  className="bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </main>
  );
};

export default Cricket;
