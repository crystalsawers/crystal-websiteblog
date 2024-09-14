// app/about/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, DocumentData, QuerySnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebaseConfig';
import { useAuth } from '../components/AuthContext'; 

// Define the data type based on your Firestore structure
interface AboutMeDocument {
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
  const { isAuthenticated } = useAuth();

  // Fetch data from Firestore
  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(collection(db, 'about-me'));
        const items: AboutMeDocument[] = querySnapshot.docs.map(doc => doc.data() as AboutMeDocument);
        setData(items);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <main>
      {data.map((item, index) => (
        <div key={index} className="card">
          <h1 className="card-title">About Me</h1>
          <h2 className="card-header">Introduction</h2>
          <p className="card-text">{item.introduction}</p>
          <h2 className="card-header">Personal Story</h2>
          <p className="card-text">{item.personal_story}</p>
          <h2 className="card-header">Contact Info</h2>
          <p className="card-text"><span className="font-semibold normal-text">Email:</span> {item.contact_info.email}</p>
          <p className="card-text"><span className="font-semibold normal-text">LinkedIn:</span> <a href={item.contact_info.linkedin} target="_blank" rel="noopener noreferrer" className="card-link">{item.contact_info.linkedin}</a></p>
          <p className="card-text"><span className="font-semibold normal-text">Github:</span> <a href={item.contact_info.github} target="_blank" rel="noopener noreferrer" className="card-link">{item.contact_info.github}</a></p>
          {/* Show edit button only if authenticated */}
          {isAuthenticated && <button className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600">Edit</button>}
        </div>
      ))}
    </main>
  );
};

export default About;
