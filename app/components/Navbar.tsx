import Link from 'next/link';
import Image from 'next/image';
import Logo from './cs-high-resolution-logo-transparent.png'; // personal logo from logo.com
import LogoutButton from './LogoutButton';
import SubscribeButton from './SubscribeButton';
import FeedbackButton from './FeedbackButton';
const Navbar = () => {
  return (
    <nav className="navbar">
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
      <div className="flex flex-wrap space-x-2 sm:space-x-4">
        <Link
          href="/about"
          className="text-xs text-[var(--navbar-text)] hover:text-white sm:text-sm md:text-base"
        >
          About
        </Link>
        <Link
          href="/journey"
          className="text-xs text-[var(--navbar-text)] hover:text-white sm:text-sm md:text-base"
        >
          Journey
        </Link>
        <Link
          href="/interests"
          className="text-xs text-[var(--navbar-text)] hover:text-white sm:text-sm md:text-base"
        >
          Interests
        </Link>
        <Link
          href="/reviews"
          className="text-xs text-[var(--navbar-text)] hover:text-white sm:text-sm md:text-base"
        >
          Reviews
        </Link>

        <span className="text-xs sm:text-sm md:text-base">
          <SubscribeButton />
        </span>
        <span className="text-xs sm:text-sm md:text-base">
          <FeedbackButton />
        </span>
        <span className="text-xs sm:text-sm md:text-base">
          <LogoutButton />
        </span>
      </div>
    </nav>
  );
};

export default Navbar;
