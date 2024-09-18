'use client';

import { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  DocumentData,
  QuerySnapshot,
  doc,
  getDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../../lib/firebaseConfig';
import { formatDate } from '@/lib/utils/formatDate';
import { useAuth } from '../components/AuthContext';

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
  const [formData, setFormData] = useState<Omit<JourneyDocument, 'id'> | null>(
    null,
  );
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(
          collection(db, 'journey'),
        );
        const items: JourneyDocument[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<JourneyDocument, 'id'>),
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
        const docData = docSnap.data() as Omit<JourneyDocument, 'id'>;
        setEditingDoc({ id: docSnap.id, ...docData });
        setFormData(docData);
      }
    } catch (error) {
      console.error('Error fetching document for editing:', error);
    }
  };

  const handleCloseEdit = () => {
    setEditingDoc(null);
    setFormData(null);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData!,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoc || !formData) return;

    try {
      const docRef = doc(db, 'journey', editingDoc.id);
      await updateDoc(docRef, formData);
      setEditingDoc(null);
      setData((prevData) =>
        prevData.map((doc) =>
          doc.id === editingDoc.id ? { ...doc, ...formData } : doc,
        ),
      );
    } catch (error) {
      console.error('Error updating document:', error);
    }
  };

  if (loading)
    return (
      <p className="text-center text-custom-green">Loading Journey page...</p>
    );
  if (error) return <p>{error}</p>;

  return (
    <div className="lg:mx-auto lg:max-w-screen-lg lg:p-8">
      <h1 className="page-title">My Journey</h1>
      {editingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <form
            onSubmit={handleSubmit}
            className="create-form mx-auto max-h-[80vh] max-w-lg overflow-y-auto rounded bg-white p-4 shadow-lg"
          >
            <h2 className="create-form-title mb-4 text-lg font-semibold">
              Edit My Journey
            </h2>
            <label className="create-form-label mb-4 block">
              Start of Journey:
              <textarea
                name="start_of_journey"
                value={formData?.start_of_journey || ''}
                onChange={handleInputChange}
                className="create-form-textarea mt-1 block w-full"
              />
            </label>
            <label className="create-form-label mb-4 block">
              Milestones:
              <textarea
                name="milestones"
                value={
                  formData?.milestones
                    ?.map((milestone) => milestone.description)
                    .join('\n') || ''
                }
                onChange={handleInputChange}
                className="create-form-textarea mt-1 block w-full"
              />
            </label>
            <label className="create-form-label mb-4 block">
              Challenges:
              <textarea
                name="challenges"
                value={
                  formData?.challenges
                    ?.map(
                      (challenge) =>
                        `${challenge.description}\n${challenge.solution}`,
                    )
                    .join('\n') || ''
                }
                onChange={handleInputChange}
                className="create-form-textarea mt-1 block w-full"
              />
            </label>
            <label className="create-form-label mb-4 block">
              Skills:
              <textarea
                name="skills"
                value={
                  formData?.skills
                    ?.map((skill) => `${skill.name}: ${skill.details}`)
                    .join('\n') || ''
                }
                onChange={handleInputChange}
                className="create-form-textarea mt-1 block w-full"
              />
            </label>
            <label className="create-form-label mb-4 block">
              Future Aspirations:
              <textarea
                name="future_aspirations"
                value={formData?.future_aspirations || ''}
                onChange={handleInputChange}
                className="create-form-textarea mt-1 block w-full"
              />
            </label>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                type="submit"
                className="create-form-button rounded px-4 py-2"
              >
                Save
              </button>
              <button
                type="button"
                onClick={handleCloseEdit}
                className="rounded-md bg-gray-500 px-4 py-2 font-semibold text-white shadow-sm hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
      {data.length === 0 ? (
        <p>No Journey data available</p>
      ) : (
        data.map((item) => (
          <div
            key={item.id}
            className="card mb-4 rounded bg-white p-4 shadow-md"
          >
            <h2 className="card-header text-xl font-semibold">
              Start of My Journey
            </h2>
            <p className="card-text mb-4">{item.start_of_journey}</p>
            <h2 className="card-header text-xl font-semibold">Milestones</h2>
            <ul className="card-text mb-4 list-disc pl-5">
              {item.milestones.map((milestone, index) => (
                <li key={index} className="mb-2">
                  <p>
                    <strong>{formatDate(new Date(milestone.date))}</strong>:{' '}
                    {milestone.description}
                  </p>
                </li>
              ))}
            </ul>
            <h2 className="card-header text-xl font-semibold">
              Challenges and Solutions
            </h2>
            <ul className="card-text mb-4 list-disc pl-5">
              {item.challenges.map((challenge, index) => (
                <li key={index} className="mb-2">
                  <p>
                    <strong>Challenge:</strong> {challenge.description}
                  </p>
                  <p>
                    <strong>Solution:</strong> {challenge.solution}
                  </p>
                </li>
              ))}
            </ul>
            <h2 className="card-header text-xl font-semibold">
              Skills Developed
            </h2>
            <ul className="card-text mb-4 list-disc pl-5">
              {item.skills.map((skill, index) => (
                <li key={index} className="mb-2">
                  <p>
                    <strong>{skill.name}:</strong> {skill.details}
                  </p>
                </li>
              ))}
            </ul>
            <h2 className="card-header text-xl font-semibold">
              Future Aspirations
            </h2>
            <p className="card-text mb-4">{item.future_aspirations}</p>
            {isAuthenticated && (
              <div className="mt-2 flex space-x-2">
                <button
                  onClick={() => handleEditClick(item.id)}
                  className="rounded bg-red-500 px-3 py-1 text-white hover:bg-red-600"
                >
                  Edit
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default Journey;
