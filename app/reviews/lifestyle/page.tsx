"use client";
import { useEffect, useState } from 'react';
import { collection, getDocs, DocumentData, QuerySnapshot } from 'firebase/firestore';
import { db } from '../../../lib/firebaseConfig';

// Define the data type based on your Firestore structure
interface LifestyleReview {
  type: string;
  title: string;
  content: string;
  date: string;
}

const LifestyleReviews = () => {
  const [reviews, setReviews] = useState<LifestyleReview[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch data from Firestore
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(collection(db, 'lifestyle'));
        const reviewsData: LifestyleReview[] = querySnapshot.docs.map(doc => doc.data() as LifestyleReview);
        setReviews(reviewsData);
      } catch (error) {
        console.error('Error fetching lifestyle reviews:', error);
        setError('Failed to fetch reviews');
      }
    };

    fetchReviews();
  }, []);

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <main>
      <h1 className="page-title">Lifestyle Reviews</h1>
      {reviews.length === 0 ? (
        <p>Loading Lifestyle reviews...</p>
      ) : (
        reviews.map((review, index) => (
          <div key={index} className="card">
            {review.title && <h2 className="card-title">{review.title}</h2>}
            <p className="card-text"><strong>Type:</strong> {review.type}</p>
            <p className="card-text">{review.content}</p>
            {review.date && <p className="card-text"><strong>Date:</strong> {new Date(review.date).toLocaleDateString()}</p>}
          </div>
        ))
      )}
    </main>
  );
  
};

export default LifestyleReviews;
