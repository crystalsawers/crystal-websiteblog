import Link from 'next/link';
import Image from 'next/image';
import Logo from './cs-high-resolution-logo-transparent.png'; // personal logo from logo.com
import LogoutButton from './LogoutButton';
import SubscribeButton from './SubscribeButton';
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
      <div className="flex space-x-4">
        <Link
          href="/about"
          className="text-[var(--navbar-text)] hover:text-white"
        >
          About
        </Link>
        <Link
          href="/journey"
          className="text-[var(--navbar-text)] hover:text-white"
        >
          Journey
        </Link>
        <Link
          href="/interests"
          className="text-[var(--navbar-text)] hover:text-white"
        >
          Interests
        </Link>
        <Link
          href="/reviews"
          className="text-[var(--navbar-text)] hover:text-white"
        >
          Reviews
        </Link>
        <SubscribeButton />
        <LogoutButton />
      </div>
    </nav>
  );
};

export default Navbar;
