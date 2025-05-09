'use client';

import { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  QuerySnapshot,
  DocumentData,
} from 'firebase/firestore';
import { db } from '../../lib/firebaseConfig';
import { useAuth } from '../components/AuthContext';
import { formatDate } from '@/lib/utils/formatDate';

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

  if (loading)
    return (
      <p className="text-center text-custom-green">Loading Journey page...</p>
    );
  if (error) return <p>{error}</p>;

  return (
    <div className="responsive-container">
      <h1 className="page-title">My Journey</h1>
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
                    <strong>
                      {formatDate(new Date(milestone.date)).split(' at ')[0]}
                    </strong>
                    : {milestone.description}
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
                  onClick={() =>
                    (window.location.href = `/journey/edit-journey?id=${item.id}`)
                  }
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
