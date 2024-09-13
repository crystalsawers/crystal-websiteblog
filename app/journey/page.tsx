"use client";
import { useEffect, useState } from 'react';
import { collection, getDocs, DocumentData, QuerySnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebaseConfig';

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
      <h1>My Journey</h1>
      <section>
        <h2>Start of My Journey</h2>
        <p>{data.start_of_journey}</p>
      </section>

      <section>
        <h2>Milestones</h2>
        <ul>
          {data.milestones.map((milestone, index) => (
            <li key={index}>
              <p><strong>{milestone.date}</strong>: {milestone.description}</p>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Challenges and Solutions</h2>
        <ul>
          {data.challenges.map((challenge, index) => (
            <li key={index}>
              <p><strong>Challenge:</strong> {challenge.description}</p>
              <p><strong>Solution:</strong> {challenge.solution}</p>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Skills Developed</h2>
        <ul>
          {data.skills.map((skill, index) => (
            <li key={index}>
              <p><strong>{skill.name}:</strong> {skill.details}</p>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Future Aspirations</h2>
        <p>{data.future_aspirations}</p>
      </section>
    </main>
  );
};

export default Journey;
