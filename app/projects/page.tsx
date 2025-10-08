'use client';
import Link from 'next/link';

const Projects = () => {
  return (
    <main>
      <div className="card">
        <h1 className="card-title">Projects</h1>
        <ul className="list-disc pl-5">
          <li className="mb-2">
            <Link href="/projects/embedded" className="card-link">
              Embedded Systems
            </Link>
          </li>
          <li className="mb-2">
            <Link href="/projects/devops" className="card-link">
              Operations, DevOps, and Security
            </Link>
          </li>
          <li className="mb-2">
            <Link href="/projects/apps" className="card-link">
              Apps, Software, and Other IT
            </Link>
          </li>
        </ul>
      </div>
    </main>
  );
};

export default Projects;
