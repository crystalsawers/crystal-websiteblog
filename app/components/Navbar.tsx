import Link from 'next/link';
import Image from 'next/image';
import Logo from './cs-high-resolution-logo-transparent.png'; // personal logo from logo.com

const Navbar = () => {
  return (
    <nav className="pb-4 border-b-2 border-gray-700 flex items-center gap-5 my-10 mx-auto max-w-5xl">
      <Image
        src={Logo}
        alt="Crystal Sawers logo"
        width={70}
        placeholder="blur"
        quality={100}
      />
      <h1 className="text-[var(--navbar-text)]">Crystal&#39;s Blog</h1>
      <div className="flex space-x-4">
        <Link href="/" className="text-[var(--navbar-text)] hover:text-white">
          Dashboard
        </Link>
        <Link href="/about" className="text-[var(--navbar-text)] hover:text-white">
          About
        </Link>
        <Link href="/interests" className="text-[var(--navbar-text)] hover:text-white">
          Interests
        </Link>
        <Link href="/journey" className="text-[var(--navbar-text)] hover:text-white">
          Journey
        </Link>
        <Link href="/reviews" className="text-[var(--navbar-text)] hover:text-white">
          Reviews
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
