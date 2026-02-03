"use client";
import React, { forwardRef } from "react";
import Link from "next/link";

const Footer = forwardRef<HTMLElement>((props, ref) => {

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer
      ref={ref} // <-- attach the ref here
      className="bg-black text-white py-6 w-full left-0 absolute bottom-0 shadow-t border-t border-gray-800"
    >
      <div className="container mx-auto flex flex-col max-[799px]:flex-col lg:flex-row items-center justify-between px-4">

        {/* Copyright - DO NOT MOVE*/}
        <p className="text-sm text-custom-green mb-2 md:mb-0">
          &copy; {new Date().getFullYear()} Log, Lap, and Over. All rights reserved.
        </p>

        {/* Slogan below the icons */}
        <p className="text-sm text-custom-green italic mt-2 mb-3 text-center">
          Sharing logs, laps, and insights.
        </p>

        <div className="flex items-center gap-6">

          {/* Social icons */}
          <div className="flex gap-4">
            {/* LinkedIn */}
            <Link
              href="https://www.linkedin.com/in/crystal-sawers-33b643259/"
              target="_blank"
              className="text-custom-green hover:text-white transition-colors duration-200"
              aria-label="LinkedIn"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM0 8h5v16H0V8zm7.5 0h4.8v2.1h.07c.67-1.3 2.3-2.67 4.73-2.67 5.06 0 6 3.34 6 7.68V24h-5v-7c0-1.67-.03-3.8-2.32-3.8-2.33 0-2.68 1.81-2.68 3.67V24h-5V8z" />
              </svg>
            </Link>

            {/* GitHub */}
            <Link
              href="https://github.com/crystalsawers"
              target="_blank"
              className="text-custom-green hover:text-white transition-colors duration-200"
              aria-label="GitHub"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55v-2.06c-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.27-1.68-1.27-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.74 2.67 1.24 3.33.95.1-.74.4-1.25.72-1.54-2.56-.29-5.26-1.28-5.26-5.72 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.15 1.18a10.95 10.95 0 0 1 5.73 0c2.18-1.49 3.15-1.18 3.15-1.18.62 1.58.23 2.75.11 3.04.73.81 1.18 1.83 1.18 3.09 0 4.45-2.7 5.42-5.27 5.7.41.36.78 1.09.78 2.2v3.27c0 .31.21.66.8.55A10.502 10.502 0 0 0 23.5 12c0-6.27-5.23-11.5-11.5-11.5z" />
              </svg>
            </Link>

            {/* Email */}
            <Link
              href="mailto:loglapandover@gmail.com"
              className="text-custom-green hover:text-white transition-colors duration-200"
              aria-label="Email"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 12.713l11.985-8.713H.015L12 12.713zm0 2.574L.015 6.578v12.854h23.97V6.578L12 15.287z" />
              </svg>
            </Link>

            {/* Back to top button */}
            <button
              onClick={scrollToTop}
              className="text-custom-green hover:text-white transition-colors duration-200 ml-2"
              aria-label="Back to top"
            >
              ↑ Back to Top
            </button>

          </div>
        </div>
      </div>
    </footer>
  );
});

// Fix display name for DevTools
Footer.displayName = "Footer";

export default Footer;
