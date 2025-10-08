'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import Logo from './log-lap-and-over-high-resolution-logo-transparent.png'; // new blog logo from logo.com
import LogoutButton from './LogoutButton';
import SubscribeButton from './SubscribeButton';
import FeedbackButton from './FeedbackButton';
import SearchBar from './SearchBar';
import { useRouter } from 'next/navigation';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchVisible, setSearchVisible] = useState(false);
  const [interestsOpen, setInterestsOpen] = useState(false);
  const [reviewsOpen, setReviewsOpen] = useState(false);
  const [projectsOpen, setProjectsOpen] = useState(false);

  const router = useRouter();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const toggleSearch = () => {
    setSearchVisible((prev) => !prev);
  };

  const handleSearch = async (query: string) => {
    if (query.trim()) {
      try {
        const response = await fetch('/api/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ keyword: query }),
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const results = await response.json();
        const queryString = new URLSearchParams({
          results: JSON.stringify(results),
        }).toString();
        router.push(`/results?${queryString}`);
      } catch (error) {
        console.error('Error fetching search results:', error);
      }
    }
    setSearchVisible(false);
  };

  return (
    <nav className="relative mx-auto flex w-full max-w-screen-2xl flex-col items-center p-4">
      <div className="flex w-full items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Image
            src={Logo}
            alt="Blog logo"
            width={60}
            placeholder="blur"
            priority={true}
          />
          <h1 className="p-6 text-[var(--navbar-text)]">Log, Lap, and Over</h1>
        </Link>

        <div className="hidden lg:flex lg:flex-row lg:items-center lg:space-x-4">
          <Link
            href="/about"
            className="block text-xs text-[var(--navbar-text)] hover:text-white sm:text-sm md:text-base"
          >
            About
          </Link>
          <Link
            href="/journey"
            className="block text-xs text-[var(--navbar-text)] hover:text-white sm:text-sm md:text-base"
          >
            Journey
          </Link>

          {/* Interests Dropdown */}
          <div className="group relative">
            <button className="block text-sm text-[var(--navbar-text)] hover:text-white md:text-base">
              Interests
            </button>
            <div className="invisible absolute left-0 top-full z-50 flex w-48 flex-col rounded-lg bg-[var(--navbar-bg)] opacity-0 shadow-lg transition-opacity duration-150 group-hover:visible group-hover:opacity-100">
              <Link
                href="/interests/cricket"
                className="rounded-md px-4 py-2 text-base text-[var(--navbar-text)] hover:bg-[var(--navbar-hover)] hover:text-white"
              >
                Cricket
              </Link>
              <Link
                href="/interests/formula1"
                className="rounded-md px-4 py-2 text-base text-[var(--navbar-text)] hover:bg-[var(--navbar-hover)] hover:text-white"
              >
                Formula 1
              </Link>
              <Link
                href="/interests/music"
                className="rounded-md px-4 py-2 text-base text-[var(--navbar-text)] hover:bg-[var(--navbar-hover)] hover:text-white"
              >
                Music
              </Link>
            </div>
          </div>

          {/* Reviews Dropdown */}
          <div className="group relative">
            <button className="block text-sm text-[var(--navbar-text)] hover:text-white md:text-base">
              Reviews
            </button>
            <div className="invisible absolute left-0 top-full z-50 flex w-48 flex-col rounded-lg bg-[var(--navbar-bg)] opacity-0 shadow-lg transition-opacity duration-150 group-hover:visible group-hover:opacity-100">
              <Link
                href="/reviews/lifestyle"
                className="rounded-md px-4 py-2 text-base text-[var(--navbar-text)] hover:bg-[var(--navbar-hover)] hover:text-white"
              >
                Lifestyle
              </Link>
              <Link
                href="/reviews/misc"
                className="rounded-md px-4 py-2 text-base text-[var(--navbar-text)] hover:bg-[var(--navbar-hover)] hover:text-white"
              >
                Misc
              </Link>
            </div>
          </div>

          {/* Projects Dropdown */}
          <div className="group relative">
            <button className="block text-sm text-[var(--navbar-text)] hover:text-white md:text-base">
              Projects
            </button>
            <div className="invisible absolute left-0 top-full z-50 flex w-48 flex-col rounded-lg bg-[var(--navbar-bg)] opacity-0 shadow-lg transition-opacity duration-150 group-hover:visible group-hover:opacity-100">
              <Link
                href="/projects/embedded"
                className="rounded-md px-4 py-2 text-base text-[var(--navbar-text)] hover:bg-[var(--navbar-hover)] hover:text-white"
              >
                Embedded Systems
              </Link>
              <Link
                href="/projects/devops"
                className="rounded-md px-4 py-2 text-base text-[var(--navbar-text)] hover:bg-[var(--navbar-hover)] hover:text-white"
              >
                DevOps & Security
              </Link>
              <Link
                href="/projects/apps"
                className="rounded-md px-4 py-2 text-base text-[var(--navbar-text)] hover:bg-[var(--navbar-hover)] hover:text-white"
              >
                Apps & Other IT
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <SubscribeButton />
            <FeedbackButton />
            <LogoutButton />
            {/* Search Icon */}
            <button
              onClick={toggleSearch}
              className="text-[var(--navbar-text)]"
            >
              <FontAwesomeIcon icon={faSearch} />
            </button>
          </div>
        </div>

        {/* Hamburger Icon for small screens */}
        <button
          onClick={toggleMenu}
          className="flex items-center text-[var(--navbar-text)] focus:outline-none lg:hidden"
          aria-label="Toggle Menu"
        >
          {isOpen ? (
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          ) : (
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16m-7 6h7"
              ></path>
            </svg>
          )}
        </button>
      </div>

      {isOpen && (
        <div className="mt-2 flex flex-col items-center space-y-2 lg:hidden">
          <Link
            href="/about"
            className="text-md block text-[var(--navbar-text)] hover:text-white md:text-base"
          >
            About
          </Link>
          <Link
            href="/journey"
            className="text-md block text-[var(--navbar-text)] hover:text-white md:text-base"
          >
            Journey
          </Link>

          {/* Interests Dropdown */}
          <div className="flex flex-col items-center">
            <button
              onClick={() => setInterestsOpen(!interestsOpen)}
              className="text-md block text-[var(--navbar-text)] hover:text-white md:text-base"
            >
              Interests
            </button>
            {interestsOpen && (
              <div className="mt-1 flex flex-col items-center space-y-2">
                <Link
                  href="/interests/cricket"
                  className="block text-sm text-[var(--navbar-text)] hover:text-white"
                >
                  Cricket
                </Link>
                <Link
                  href="/interests/formula1"
                  className="block text-sm text-[var(--navbar-text)] hover:text-white"
                >
                  Formula 1
                </Link>
                <Link
                  href="/interests/music"
                  className="block text-sm text-[var(--navbar-text)] hover:text-white"
                >
                  Music
                </Link>
              </div>
            )}
          </div>

          {/* Reviews Dropdown */}
          <div className="flex flex-col items-center">
            <button
              onClick={() => setReviewsOpen(!reviewsOpen)}
              className="text-md block text-[var(--navbar-text)] hover:text-white md:text-base"
            >
              Reviews
            </button>
            {reviewsOpen && (
              <div className="mt-1 flex flex-col items-center space-y-2">
                <Link
                  href="/reviews/lifestyle"
                  className="block text-sm text-[var(--navbar-text)] hover:text-white"
                >
                  Lifestyle
                </Link>
                <Link
                  href="/reviews/misc"
                  className="block text-sm text-[var(--navbar-text)] hover:text-white"
                >
                  Misc
                </Link>
              </div>
            )}
          </div>

          {/* Projects Dropdown */}
          <div className="flex flex-col items-center">
            <button
              onClick={() => setProjectsOpen(!projectsOpen)}
              className="text-md block text-[var(--navbar-text)] hover:text-white md:text-base"
            >
              Projects
            </button>
            {projectsOpen && (
              <div className="mt-1 flex flex-col items-center space-y-2">
                <Link
                  href="/projects/embedded"
                  className="block text-sm text-[var(--navbar-text)] hover:text-white"
                >
                  Embedded
                </Link>
                <Link
                  href="/projects/devops"
                  className="block text-sm text-[var(--navbar-text)] hover:text-white"
                >
                  DevOps
                </Link>
                <Link
                  href="/projects/apps"
                  className="block text-sm text-[var(--navbar-text)] hover:text-white"
                >
                  Apps, Software, and Other IT
                </Link>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center space-y-2">
            <SubscribeButton mobileMenu />
            <FeedbackButton mobileMenu />
            <LogoutButton mobileMenu />
            {/* Search Icon */}
            <button
              onClick={toggleSearch}
              className="text-[var(--navbar-text)]"
            >
              <FontAwesomeIcon icon={faSearch} />
            </button>
          </div>
        </div>
      )}

      {/* Search Bar */}
      {isSearchVisible && <SearchBar onSearch={handleSearch} />}
    </nav>
  );
};

export default Navbar;
