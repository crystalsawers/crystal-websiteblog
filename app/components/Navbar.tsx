'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import Logo from './cs-high-resolution-logo-transparent.png'; // personal logo from logo.com
import LogoutButton from './LogoutButton';
import SubscribeButton from './SubscribeButton';
import FeedbackButton from './FeedbackButton';
import SearchBar from './SearchBar';
import { useRouter } from 'next/navigation';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchVisible, setSearchVisible] = useState(false);
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
    <nav className="relative flex flex-col items-center p-4">
      <div className="flex w-full items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Image
            src={Logo}
            alt="Crystal Sawers logo"
            width={70}
            placeholder="blur"
            quality={100}
            priority={true}
          />
          <h1 className="text-[var(--navbar-text)]">Crystal&#39;s Blog</h1>
        </Link>

        <div className="hidden md:flex md:flex-row md:items-center md:space-x-4">
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
          <Link
            href="/interests"
            className="block text-xs text-[var(--navbar-text)] hover:text-white sm:text-sm md:text-base"
          >
            Interests
          </Link>
          <Link
            href="/reviews"
            className="block text-xs text-[var(--navbar-text)] hover:text-white sm:text-sm md:text-base"
          >
            Reviews
          </Link>

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
          className="flex items-center text-[var(--navbar-text)] focus:outline-none md:hidden"
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
        <div className="mt-2 flex flex-col items-center space-y-2 md:hidden">
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
          <Link
            href="/interests"
            className="text-md block text-[var(--navbar-text)] hover:text-white md:text-base"
          >
            Interests
          </Link>
          <Link
            href="/reviews"
            className="text-md block text-[var(--navbar-text)] hover:text-white md:text-base"
          >
            Reviews
          </Link>

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
