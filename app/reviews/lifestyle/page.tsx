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
    <div>
      <h1>Lifestyle Reviews</h1>
      {reviews.map((review, index) => (
        <div key={index}>
          <h2>{review.title}</h2>
          <p><strong>Type:</strong> {review.type}</p>
          <p>{review.content}</p>
          <p><strong>Date:</strong> {new Date(review.date).toLocaleDateString()}</p>
        </div>
      ))}
    </div>
  );
};

export default LifestyleReviews;
