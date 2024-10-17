'use client';
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
      <div className="flex w-full items-center justify-between">
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
        <div className="hidden sm:flex sm:flex-row sm:items-center sm:space-x-4">
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
          </div>
        </div>

        {/* Hamburger Icon for small screens */}
        <button
          onClick={toggleMenu}
          className="flex items-center text-[var(--navbar-text)] focus:outline-none sm:hidden"
          aria-label="Toggle Menu"
        >
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
        </button>
      </div>

      {/* Menu Links for Small Screens (below title when opened) */}
      {isOpen && (
        <div className="mt-2 flex flex-col items-center space-y-2 sm:hidden">
          <Link
            href="/about"
            className="text-md block text-[var(--navbar-text)] hover:text-white sm:text-sm md:text-base"
          >
            About
          </Link>
          <Link
            href="/journey"
            className="text-md block text-[var(--navbar-text)] hover:text-white sm:text-sm md:text-base"
          >
            Journey
          </Link>
          <Link
            href="/interests"
            className="text-md block text-[var(--navbar-text)] hover:text-white sm:text-sm md:text-base"
          >
            Interests
          </Link>
          <Link
            href="/reviews"
            className="text-md block text-[var(--navbar-text)] hover:text-white sm:text-sm md:text-base"
          >
            Reviews
          </Link>

          <div className="flex flex-col items-center space-y-2">
            <SubscribeButton />
            <FeedbackButton />
            <LogoutButton />
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
