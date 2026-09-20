'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, getDocs, QuerySnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebaseConfig';
import { useAuth } from '../components/AuthContext';

interface AboutMeDocument {
  id: string;
  introduction: string;
  personal_story: string;
  contact_info: {
    email: string;
    blog_email: string;
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
      <p className="text-center text-[#99ffd3]">Loading About Me page...</p>
    );
  if (error) return <p>{error}</p>;

  return (
    <div className="blog-home">
      <header className="category-header about-header">
        <div className="category-header-content">
          <span className="section-eyebrow">ABOUT</span>
          <h1 className="category-title">About Me</h1>
        </div>
      </header>

      {data.length === 0 ? (
        <div className="empty-posts">
          <p>No About Me data available.</p>
        </div>
      ) : (
        data.map((item) => (
          <div key={item.id} className="about-content">
            <section className="about-section">
              <span className="section-eyebrow">INTRODUCTION</span>
              <div className="about-text">
                <p>{item.introduction}</p>
              </div>
            </section>

            <section className="about-section">
              <span className="section-eyebrow">PERSONAL STORY</span>
              <div className="about-text">
                <p>{item.personal_story}</p>
              </div>
            </section>

            <section className="about-section">
              <span className="section-eyebrow">CONTACT</span>

              <div className="about-contact">
                <p>
                  <strong>Email for Blog-related Enquiries:</strong>{' '}
                  <a href={`mailto:${item.contact_info.blog_email}`}>
                    {item.contact_info.blog_email}
                  </a>
                </p>

                <p>
                  <strong>Github:</strong>{' '}
                  <a
                    href={item.contact_info.github}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {item.contact_info.github}
                  </a>
                </p>
              </div>
            </section>

            {isAuthenticated && (
              <div className="post-admin-controls">
                <button
                  onClick={() => router.push('/about/edit-about')}
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

export default About;
