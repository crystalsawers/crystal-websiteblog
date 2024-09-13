"use client";
import Link from 'next/link';

const Reviews = () => {
  return (
    <main>
      <h1>Reviews</h1>
      <ul>
        <li>
          <Link href="/reviews/makeup" className="text-blue-500 hover:underline">
            Makeup
          </Link>
        </li>
        <li>
          <Link href="/reviews/lifestyle" className="text-blue-500 hover:underline">
            Lifestyle
          </Link>
        </li>
      </ul>
    </main>
  );
};

export default Reviews;
