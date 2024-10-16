"use client";
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Logo from './cs-high-resolution-logo-transparent.png'; // personal logo from logo.com
import LogoutButton from './LogoutButton';
import SubscribeButton from './SubscribeButton';
import FeedbackButton from './FeedbackButton';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="relative flex flex-col items-center p-4">
      {/* Logo and Title with Navbar Links on Same Line */}
      <div className="flex items-center justify-between w-full">
        <Link href="/" className="flex items-center space-x-2">
          <Image
            src={Logo}
            alt="Crystal Sawers logo"
            width={70}
            placeholder="blur"
            quality={100}
          />
          <h1 className="text-[var(--navbar-text)]">Crystal&#39;s Blog</h1>
        </Link>

        {/* Navbar Items for Large Screens */}
        <div className="hidden sm:flex sm:flex-row sm:space-x-4">
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

          <span className="block text-xs sm:text-sm md:text-base">
            <SubscribeButton />
          </span>
          <span className="block text-xs sm:text-sm md:text-base">
            <FeedbackButton />
          </span>
          <span className="block text-xs sm:text-sm md:text-base">
            <LogoutButton />
          </span>
        </div>

        {/* Hamburger Icon for small screens */}
        <button
          onClick={toggleMenu}
          className="sm:hidden flex items-center text-white focus:outline-none"
          aria-label="Toggle Menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
          </svg>
        </button>
      </div>

      {/* Menu Links for Small Screens (below title when opened) */}
      {isOpen && (
        <div className="flex flex-col items-center space-y-2 mt-2 sm:hidden">
          <Link
            href="/about"
            className="block text-md text-[var(--navbar-text)] hover:text-white sm:text-sm md:text-base"
          >
            About
          </Link>
          <Link
            href="/journey"
            className="block text-md text-[var(--navbar-text)] hover:text-white sm:text-sm md:text-base"
          >
            Journey
          </Link>
          <Link
            href="/interests"
            className="block text-md text-[var(--navbar-text)] hover:text-white sm:text-sm md:text-base"
          >
            Interests
          </Link>
          <Link
            href="/reviews"
            className="block text-md text-[var(--navbar-text)] hover:text-white sm:text-sm md:text-base"
          >
            Reviews
          </Link>

          <span className="block text-md sm:text-sm md:text-base">
            <SubscribeButton />
          </span>
          <span className="block text-md sm:text-sm md:text-base">
            <FeedbackButton />
          </span>
          <span className="block text-md sm:text-sm md:text-base">
            <LogoutButton />
          </span>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
