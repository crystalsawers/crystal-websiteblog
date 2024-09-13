"use client";
// Import necessary Firebase functions and types
import { useEffect, useState } from 'react';
import { collection, getDocs, DocumentData, QuerySnapshot } from 'firebase/firestore';
import { db } from '../lib/firebaseConfig'; // Update this path to your Firebase config

// Define the data type based on your Firestore structure
interface AboutMeDocument {
  introduction: string;
  personal_story: string;
  contact_info: {
    email: string;
    linkedin: string;
    twitter: string;
  };
}

const Home = () => {
  const [data, setData] = useState<AboutMeDocument[]>([]);

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
    <div>
      <h1>About Me</h1>
      {data.map((item, index) => (
        <div key={index}>
          <h2>Introduction</h2>
          <p>{item.introduction}</p>
          <h2>Personal Story</h2>
          <p>{item.personal_story}</p>
          <h2>Contact Info</h2>
          <p>Email: {item.contact_info.email}</p>
          <p>LinkedIn: <a href={item.contact_info.linkedin} target="_blank" rel="noopener noreferrer">{item.contact_info.linkedin}</a></p>
          <p>Twitter: <a href={item.contact_info.twitter} target="_blank" rel="noopener noreferrer">{item.contact_info.twitter}</a></p>
        </div>
      ))}
    </div>
  );
};

export default Home;
