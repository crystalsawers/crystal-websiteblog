"use client";
import Link from 'next/link';

const Reviews = () => {
  return (
    <main>
      <div className="card">
        <h1 className="card-title">Reviews</h1>
        <ul className="list-disc pl-5">
          <li className="mb-2">
            <Link href="/reviews/makeup" className="card-link">
              Makeup
            </Link>
          </li>
          <li className="mb-2">
            <Link href="/reviews/lifestyle" className="card-link">
              Lifestyle
            </Link>
          </li>
        </ul>
      </div>
    </main>
  );
};

export default Reviews;
