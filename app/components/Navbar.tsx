'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import Logo from './log-lap-and-over-high-resolution-logo-transparent.png'; // new blog logo from logo.com
import LogoutButton from './LogoutButton';
import UploadButton from './UploadButton';
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

  const handleSearch = (query: string) => {
    if (query.trim()) {
      router.push(`/results?q=${encodeURIComponent(query)}`);
    }
    setSearchVisible(false);
  };

  return (
    <div className="navbar">
      <div className="navbar-main">
        <Link href="/" className="navbar-brand">
          <Image
            src={Logo}
            alt="Blog logo"
            width={60}
            placeholder="blur"
            priority={true}
            className="navbar-logo"
          />

          <h1>Log, Lap, and Over</h1>
        </Link>

        {/* Desktop Navigation */}
        <div className="navbar-desktop">
          <Link href="/about">About</Link>
          <Link href="/journey">Journey</Link>

          <div className="navbar-dropdown group">
            <button>Interests</button>

            <div className="navbar-dropdown-menu">
              <Link href="/interests/cricket">Cricket</Link>
              <Link href="/interests/formula1">Formula 1</Link>
              <Link href="/interests/music">Music</Link>
            </div>
          </div>

          <div className="navbar-dropdown group">
            <button>Reviews</button>

            <div className="navbar-dropdown-menu">
              <Link href="/reviews/lifestyle">Lifestyle</Link>
              <Link href="/reviews/misc">Miscellaneous</Link>
            </div>
          </div>

          <div className="navbar-dropdown group">
            <button>Projects</button>

            <div className="navbar-dropdown-menu">
              <Link href="/projects/embedded">Embedded Systems</Link>
              <Link href="/projects/devops">DevOps & Security</Link>
              <Link href="/projects/apps">Apps & Other IT</Link>
            </div>
          </div>

          <div className="navbar-actions">
            <SubscribeButton />
            <UploadButton />
            <LogoutButton />

            <button
              onClick={toggleSearch}
              className="navbar-search"
              aria-label="Search"
            >
              <FontAwesomeIcon icon={faSearch} />
            </button>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={toggleMenu}
          className="navbar-menu-toggle"
          aria-label="Toggle Menu"
        >
          {isOpen ? (
            <svg
              className="navbar-menu-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              className="navbar-menu-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="navbar-mobile">
          <Link href="/about">About</Link>
          <Link href="/journey">Journey</Link>

          <div className="navbar-mobile-group">
            <button onClick={() => setInterestsOpen(!interestsOpen)}>
              Interests
            </button>

            {interestsOpen && (
              <div className="navbar-mobile-submenu">
                <Link href="/interests/cricket">Cricket</Link>
                <Link href="/interests/formula1">Formula 1</Link>
                <Link href="/interests/music">Music</Link>
              </div>
            )}
          </div>

          <div className="navbar-mobile-group">
            <button onClick={() => setReviewsOpen(!reviewsOpen)}>
              Reviews
            </button>

            {reviewsOpen && (
              <div className="navbar-mobile-submenu">
                <Link href="/reviews/lifestyle">Lifestyle</Link>
                <Link href="/reviews/misc">Miscellaneous</Link>
              </div>
            )}
          </div>

          <div className="navbar-mobile-group">
            <button onClick={() => setProjectsOpen(!projectsOpen)}>
              Projects
            </button>

            {projectsOpen && (
              <div className="navbar-mobile-submenu">
                <Link href="/projects/embedded">Embedded</Link>
                <Link href="/projects/devops">DevOps</Link>
                <Link href="/projects/apps">Apps, Software, and Other IT</Link>
              </div>
            )}
          </div>

          <div className="navbar-mobile-actions">
            <SubscribeButton />
            <UploadButton />
            <LogoutButton />

            <button
              onClick={toggleSearch}
              className="navbar-search"
              aria-label="Search"
            >
              <FontAwesomeIcon icon={faSearch} />
            </button>
          </div>
        </div>
      )}

      {isSearchVisible && <SearchBar onSearch={handleSearch} />}
    </div>
  );
};

export default Navbar;
