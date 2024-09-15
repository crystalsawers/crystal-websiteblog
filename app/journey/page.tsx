'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, DocumentData, QuerySnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebaseConfig';
import { formatDate } from '@/lib/utils/formatDate';
import { useAuth } from '../components/AuthContext';
import EditForm from '../components/EditForm';

interface Milestone {
  description: string;
  date: string;
}

interface Challenge {
  description: string;
  solution: string;
}

interface Skill {
  name: string;
  details: string;
}

interface JourneyDocument {
  id: string;
  start_of_journey: string;
  milestones: Milestone[];
  challenges: Challenge[];
  skills: Skill[];
  future_aspirations: string;
}

const Journey = () => {
  const [data, setData] = useState<JourneyDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingDoc, setEditingDoc] = useState<JourneyDocument | null>(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(collection(db, 'journey'));
        const items: JourneyDocument[] = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data() as Omit<JourneyDocument, 'id'>
        }));
        setData(items);
      } catch (error) {
        setError('Error fetching Journey data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleEditClick = async (id: string) => {
    if (!isAuthenticated) return;

    try {
      const docRef = doc(db, 'journey', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setEditingDoc({
          id: docSnap.id,
          ...docSnap.data() as Omit<JourneyDocument, 'id'>
        });
      }
    } catch (error) {
      console.error('Error fetching document for editing:', error);
    }
  };

  const handleCloseEdit = () => {
    setEditingDoc(null);
  };

  if (loading) return <p>Loading Journey data...</p>;
  if (error) return <p>{error}</p>;

  return (
    <main>
      <div className="card">
        <h1 className="card-title">My Journey</h1>
        
        <section>
          <h2 className="card-header">Start of My Journey</h2>
          <p className="card-text">{data.length > 0 ? data[0].start_of_journey : ''}</p>
        </section>
  
        <section>
          <h2 className="card-header">Milestones</h2>
          <ul className="card-text list-disc pl-5">
            {data.length > 0 ? data[0].milestones.map((milestone, index) => (
              <li key={index} className="mb-2">
                <p><strong>{formatDate(new Date(milestone.date))}</strong>: {milestone.description}</p>
              </li>
            )) : null}
          </ul>
        </section>
  
        <section>
          <h2 className="card-header">Challenges and Solutions</h2>
          <ul className="card-text list-disc pl-5">
            {data.length > 0 ? data[0].challenges.map((challenge, index) => (
              <li key={index} className="mb-2">
                <p><strong>Challenge:</strong> {challenge.description}</p>
                <p><strong>Solution:</strong> {challenge.solution}</p>
              </li>
            )) : null}
          </ul>
        </section>
  
        <section>
          <h2 className="card-header">Skills Developed</h2>
          <ul className="card-text list-disc pl-5">
            {data.length > 0 ? data[0].skills.map((skill, index) => (
              <li key={index} className="mb-2">
                <p><strong>{skill.name}:</strong> {skill.details}</p>
              </li>
            )) : null}
          </ul>
        </section>
  
        <section>
          <h2 className="card-header">Future Aspirations</h2>
          <p className="card-text">{data.length > 0 ? data[0].future_aspirations : ''}</p>
        </section>

        {/* Show edit button only if authenticated */}
        {isAuthenticated && data.length > 0 && (
          <button 
            onClick={() => handleEditClick(data[0].id)} 
            className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600"
          >
            Edit
          </button>
        )}
      </div>

      {/* Show the edit form if editingDoc is set */}
      {editingDoc && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
          <EditForm 
            postId={editingDoc.id}
            initialData={{
              type: 'journey',
              title: '', 
              content: editingDoc.start_of_journey, // Mapped to content
              date: '' 
            }}
            onClose={handleCloseEdit} 
          />
        </div>
      )}
    </main>
  );
};

export default Journey;
