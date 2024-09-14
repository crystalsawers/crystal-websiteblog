'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, DocumentData, QuerySnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebaseConfig';
import { formatDate } from '@/lib/utils/formatDate';
import { useAuth } from '../components/AuthContext'; 

// Define the data type based on your Firestore structure
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
  start_of_journey: string;
  milestones: Milestone[];
  challenges: Challenge[];
  skills: Skill[];
  future_aspirations: string;
}

const Journey = () => {
  const [data, setData] = useState<JourneyDocument | null>(null);
  const { isAuthenticated } = useAuth(); // Use authentication context

  // Fetch data from Firestore
  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(collection(db, 'journey'));
        const items: JourneyDocument[] = querySnapshot.docs.map((doc) => doc.data() as JourneyDocument);
        setData(items[0] || null); 
      } catch (error) {
        console.error('Error fetching journey data:', error);
      }
    };

    fetchData();
  }, []);

  if (!data) {
    return <main><p>Loading journey data...</p></main>;
  }

  return (
    <main>
      <div className="card">
        <h1 className="card-title">My Journey</h1>
        
        <section>
          <h2 className="card-header">Start of My Journey</h2>
          <p className="card-text">{data.start_of_journey}</p>
        </section>
  
        <section>
          <h2 className="card-header">Milestones</h2>
          <ul className="card-text list-disc pl-5">
            {data.milestones.map((milestone, index) => (
              <li key={index} className="mb-2">
                <p><strong>{formatDate(new Date(milestone.date))}</strong>: {milestone.description}</p>
              </li>
            ))}
          </ul>
        </section>
  
        <section>
          <h2 className="card-header">Challenges and Solutions</h2>
          <ul className="card-text list-disc pl-5">
            {data.challenges.map((challenge, index) => (
              <li key={index} className="mb-2">
                <p><strong>Challenge:</strong> {challenge.description}</p>
                <p><strong>Solution:</strong> {challenge.solution}</p>
              </li>
            ))}
          </ul>
        </section>
  
        <section>
          <h2 className="card-header">Skills Developed</h2>
          <ul className="card-text list-disc pl-5">
            {data.skills.map((skill, index) => (
              <li key={index} className="mb-2">
                <p><strong>{skill.name}:</strong> {skill.details}</p>
              </li>
            ))}
          </ul>
        </section>
  
        <section>
          <h2 className="card-header">Future Aspirations</h2>
          <p className="card-text">{data.future_aspirations}</p>
        </section>

        {/* Show edit button only if authenticated */}
        {isAuthenticated && <button className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600">Edit</button>}
      </div>
    </main>
  );
};

export default Journey;
