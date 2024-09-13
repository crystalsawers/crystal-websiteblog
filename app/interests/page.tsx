"use client";
import Link from 'next/link';

const Interests = () => {
  return (
    <main>
      <h1>Interests</h1>
      <ul>
        <li>
          <Link href="/interests/formula1" className="text-blue-500 hover:underline">
            Formula 1
          </Link>
        </li>
        <li>
          <Link href="/interests/cricket" className="text-blue-500 hover:underline">
            Cricket
          </Link>
        </li>
        <li>
          <Link href="/interests/music" className="text-blue-500 hover:underline">
            Music
          </Link>
        </li>
      </ul>
    </main>
  );
};

export default Interests;
