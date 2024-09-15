// app/about/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, DocumentData, QuerySnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebaseConfig';
import { useAuth } from '../components/AuthContext';
import EditForm from '../components/EditForm';

interface AboutMeDocument {
  id: string;
  introduction: string;
  personal_story: string;
  contact_info: {
    email: string;
    linkedin: string;
    github: string;
  };
}

const About = () => {
  const [data, setData] = useState<AboutMeDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingDoc, setEditingDoc] = useState<AboutMeDocument | null>(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(collection(db, 'about-me'));
        const items: AboutMeDocument[] = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data() as Omit<AboutMeDocument, 'id'>
        }));
        setData(items);
      } catch (error) {
        setError('Error fetching About Me data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleEditClick = async (id: string) => {
    if (!isAuthenticated) return;

    try {
      const docRef = doc(db, 'about-me', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setEditingDoc({
          id: docSnap.id,
          ...docSnap.data() as Omit<AboutMeDocument, 'id'>
        });
      }
    } catch (error) {
      console.error('Error fetching document for editing:', error);
    }
  };

  const handleCloseEdit = () => {
    setEditingDoc(null);
  };

  if (loading) return <p>Loading About Me data...</p>;
  if (error) return <p>{error}</p>;

  return (
    <main>
      <h1 className="page-title">About Me</h1>
      {editingDoc && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
          <EditForm 
            postId={editingDoc.id}
            initialData={{
              type: 'about-me', // Dummy value
              title: '', // Dummy value
              content: editingDoc.introduction, // Mapped to content
              date: '' // Dummy value
            }}
            onClose={handleCloseEdit} // Pass only the onClose function
          />
        </div>
      )}
      {data.length === 0 ? (
        <p>No About Me data available</p>
      ) : (
        data.map((item) => (
          <div key={item.id} className="card">
            <h2 className="card-header">Introduction</h2>
            <p className="card-text">{item.introduction}</p>
            <h2 className="card-header">Personal Story</h2>
            <p className="card-text">{item.personal_story}</p>
            <h2 className="card-header">Contact Info</h2>
            <p className="card-text"><span className="font-semibold normal-text">Email:</span> {item.contact_info.email}</p>
            <p className="card-text"><span className="font-semibold normal-text">LinkedIn:</span> <a href={item.contact_info.linkedin} target="_blank" rel="noopener noreferrer" className="card-link">{item.contact_info.linkedin}</a></p>
            <p className="card-text"><span className="font-semibold normal-text">Github:</span> <a href={item.contact_info.github} target="_blank" rel="noopener noreferrer" className="card-link">{item.contact_info.github}</a></p>
            {isAuthenticated && (
              <div className="mt-2 flex space-x-2">
                <button 
                  onClick={() => handleEditClick(item.id)} 
                  className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600"
                >
                  Edit
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </main>
  );
};

export default About;
