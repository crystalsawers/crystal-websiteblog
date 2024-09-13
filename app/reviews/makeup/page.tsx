"use client";
import { useEffect, useState } from 'react';
import { collection, getDocs, DocumentData, QuerySnapshot } from 'firebase/firestore';
import { db } from '../../../lib/firebaseConfig';

// Define the data type based on your Firestore structure
interface MakeupReview {
  type: string;
  title: string;
  content: string;
  date: string;
}

const MakeupReviews = () => {
  const [reviews, setReviews] = useState<MakeupReview[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch data from Firestore
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(collection(db, 'makeup'));
        const reviewsData: MakeupReview[] = querySnapshot.docs.map(doc => doc.data() as MakeupReview);
        setReviews(reviewsData);
      } catch (error) {
        console.error('Error fetching makeup reviews:', error);
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
      <h1 className="page-title">Makeup Reviews</h1>
      {reviews.length === 0 ? (
        <p>Loading Makeup reviews...</p>
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

export default MakeupReviews;
