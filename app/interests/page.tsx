"use client";
import Link from 'next/link';

const Interests = () => {
  return (
    <main>
      <div className="card">
        <h1 className="card-title">Interests</h1>
        <ul className="list-disc pl-5">
          <li className="mb-2">
            <Link href="/interests/formula1" className="card-link">
              Formula 1
            </Link>
          </li>
          <li className="mb-2">
            <Link href="/interests/cricket" className="card-link">
              Cricket
            </Link>
          </li>
          <li className="mb-2">
            <Link href="/interests/music" className="card-link">
              Music
            </Link>
          </li>
        </ul>
      </div>
    </main>
  );
};

export default Interests;
