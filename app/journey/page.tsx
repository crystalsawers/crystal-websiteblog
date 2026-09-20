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
      <p className="text-center text-[#99ffd3]">Loading Journey page...</p>
    );
  if (error) return <p>{error}</p>;

  return (
    <div className="blog-home">
      <header className="category-header about-header">
        <div className="category-header-content">
          <span className="section-eyebrow">JOURNEY</span>
          <h1 className="category-title">My Journey</h1>
        </div>
      </header>

      {data.length === 0 ? (
        <div className="empty-posts">
          <p>No Journey data available.</p>
        </div>
      ) : (
        data.map((item) => (
          <div key={item.id} className="journey-content">
            <section className="journey-section">
              <span className="section-eyebrow">START OF MY JOURNEY</span>
              <div className="journey-text">
                <p>{item.start_of_journey}</p>
              </div>
            </section>

            <section className="journey-section">
              <span className="section-eyebrow">MILESTONES</span>
              <div className="journey-text">
                <ul>
                  {item.milestones.map((milestone, index) => (
                    <li key={index}>
                      <strong>
                        {formatDate(new Date(milestone.date)).split(' at ')[0]}
                      </strong>
                      : {milestone.description}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section className="journey-section">
              <span className="section-eyebrow">CHALLENGES AND SOLUTIONS</span>
              <div className="journey-text">
                <ul>
                  {item.challenges.map((challenge, index) => (
                    <li key={index}>
                      <p>
                        <strong>Challenge:</strong> {challenge.description}
                      </p>
                      <p>
                        <strong>Solution:</strong> {challenge.solution}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section className="journey-section">
              <span className="section-eyebrow">SKILLS DEVELOPED</span>
              <div className="journey-text">
                <ul>
                  {item.skills.map((skill, index) => (
                    <li key={index}>
                      <strong>{skill.name}:</strong> {skill.details}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section className="journey-section">
              <span className="section-eyebrow">FUTURE ASPIRATIONS</span>
              <div className="journey-text">
                <p>{item.future_aspirations}</p>
              </div>
            </section>

            {isAuthenticated && (
              <div className="post-admin-controls">
                <button
                  onClick={() =>
                    (window.location.href = `/journey/edit-journey?id=${item.id}`)
                  }
                  className="edit-button"
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
