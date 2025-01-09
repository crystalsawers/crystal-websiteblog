'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  collection,
  getDocs,
  QuerySnapshot
} from 'firebase/firestore';
import { db } from '../../lib/firebaseConfig';
import { useAuth } from '../components/AuthContext';

interface AboutMeDocument {
  id: string;
  introduction: string;
  personal_story: string;
  contact_info: {
    email: string;
    blog_email: string;
    linkedin: string;
    github: string;
  };
}

const About = () => {
  const [data, setData] = useState<AboutMeDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot: QuerySnapshot = await getDocs(
          collection(db, 'about-me'),
        );
        const items: AboutMeDocument[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<AboutMeDocument, 'id'>),
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

  if (loading)
    return (
      <p className="text-center text-custom-green">Loading About Me page...</p>
    );
  if (error) return <p>{error}</p>;

  return (
    <div className="lg:mx-auto lg:max-w-screen-lg lg:p-8">
      <h1 className="page-title">About Me</h1>
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
            <p className="card-text">
              <span className="normal-text font-semibold">Personal Email:</span>{' '}
              <a
                href={`mailto:${item.contact_info.email}`}
                className="text-sm text-gray-800 hover:underline"
              >
                {item.contact_info.email}
              </a>
            </p>
            <p className="card-text">
              <span className="normal-text font-semibold">Blog Email:</span>{' '}
              <a
                href={`mailto:${item.contact_info.blog_email}`}
                className="text-sm text-gray-800 hover:underline"
              >
                {item.contact_info.blog_email}
              </a>
            </p>

            <p className="card-text">
              <span className="normal-text font-semibold">LinkedIn:</span>{' '}
              <a
                href={item.contact_info.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-800 hover:underline"
              >
                {item.contact_info.linkedin}
              </a>
            </p>
            <p className="card-text">
              <span className="normal-text font-semibold">Github:</span>{' '}
              <a
                href={item.contact_info.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-800 hover:underline"
              >
                {item.contact_info.github}
              </a>
            </p>
            {isAuthenticated && (
              <div className="mt-2 flex space-x-2">
                <button
                  onClick={() => router.push('/about/edit-about')}
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

export default About;
