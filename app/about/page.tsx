'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, DocumentData, QuerySnapshot, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebaseConfig';
import { useAuth } from '../components/AuthContext';

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
  const [formData, setFormData] = useState<{ introduction: string; personal_story: string; contact_info: { email: string; linkedin: string; github: string } } | null>(null);
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
        const docData = docSnap.data() as Omit<AboutMeDocument, 'id'>;
        setEditingDoc({ id: docSnap.id, ...docData });
        setFormData({
          introduction: docData.introduction,
          personal_story: docData.personal_story,
          contact_info: docData.contact_info,
        });
      }
    } catch (error) {
      console.error('Error fetching document for editing:', error);
    }
  };

  const handleCloseEdit = () => {
    setEditingDoc(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData!,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoc || !formData) return;

    try {
      const docRef = doc(db, 'about-me', editingDoc.id);
      await updateDoc(docRef, {
        introduction: formData.introduction,
        personal_story: formData.personal_story,
        contact_info: formData.contact_info
      });
      setEditingDoc(null);
      setData(prevData => prevData.map(doc =>
        doc.id === editingDoc.id ? { ...doc, ...formData } : doc
      ));
    } catch (error) {
      console.error('Error updating document:', error);
    }
  };

  if (loading) return <p>Loading About Me data...</p>;
  if (error) return <p>{error}</p>;

  return (
    <main>
      <h1 className="page-title">About Me</h1>
      {editingDoc && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
          <form onSubmit={handleSubmit} className="create-form">
            <h2 className="create-form-title">Edit About Me</h2>
            <label className="create-form-label">
              Introduction:
              <textarea
                name="introduction"
                value={formData?.introduction || ''}
                onChange={handleInputChange}
                className="create-form-textarea"
              />
            </label>
            <label className="create-form-label">
              Personal Story:
              <textarea
                name="personal_story"
                value={formData?.personal_story || ''}
                onChange={handleInputChange}
                className="create-form-textarea"
              />
            </label>
            <label className="create-form-label">
              Email:
              <input
                type="email"
                name="contact_info.email"
                value={formData?.contact_info.email || ''}
                onChange={handleInputChange}
                className="create-form-input"
              />
            </label>
            <label className="create-form-label">
              LinkedIn:
              <input
                type="text"
                name="contact_info.linkedin"
                value={formData?.contact_info.linkedin || ''}
                onChange={handleInputChange}
                className="create-form-input"
              />
            </label>
            <label className="create-form-label">
              GitHub:
              <input
                type="text"
                name="contact_info.github"
                value={formData?.contact_info.github || ''}
                onChange={handleInputChange}
                className="create-form-input"
              />
            </label>
            <div className="mt-4 flex justify-end space-x-2">
              <button type="submit" className="create-form-button">Save</button>
              <button type="button" onClick={handleCloseEdit} className="bg-gray-500 text-white py-2 px-4 font-semibold rounded-md shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500">
                Cancel
              </button>
            </div>
          </form>
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
