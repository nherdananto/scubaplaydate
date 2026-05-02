import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, Camera, GraduationCap, Users, Newspaper, MapPin } from '@phosphor-icons/react';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'News', path: '/news', icon: Newspaper },
    { name: 'Destinations', path: '/destinations', icon: MapPin },
    { name: 'Gear', path: '/gear', icon: ShoppingBag },
    { name: 'Training', path: '/training', icon: GraduationCap },
    { name: 'Photography', path: '/photography', icon: Camera },
    { name: 'Community', path: '/community', icon: Users },
  ];

  return (
    <nav
      data-testid="main-navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'backdrop-blur-xl bg-white/80' : 'bg-white/60 backdrop-blur-md'
      } border-b border-[#E2E8F0]`}
    >
      <div className="px-6 md:px-12 lg:px-24 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 cursor-pointer" data-testid="logo-link">
            <img
              src="https://customer-assets.emergentagent.com/job_e052bca8-dbf8-4933-8039-fac54198bda4/artifacts/kazh3wbj_243CB557-2CF0-4CAF-8C04-44D9C97272E7_1_105_c.jpeg"
              alt="ScubaPlaydate Logo"
              className="h-16 w-16 object-contain"
              style={{ background: 'transparent' }}
            />
            <span className="text-2xl font-black text-[#0284C7] tracking-tight hover:text-[#0369A1] transition-colors">
              ScubaPlaydate
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                data-testid={`nav-${link.name.toLowerCase()}`}
                className={`text-sm font-medium tracking-wide transition-colors ${
                  location.pathname === link.path
                    ? 'text-[#0284C7]'
                    : 'text-[#475569] hover:text-[#0284C7]'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://www.instagram.com/scubaplaydate/"
              target="_blank"
              rel="noopener noreferrer"
              data-testid="instagram-link"
              className="text-[#475569] hover:text-[#0284C7] transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;