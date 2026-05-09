import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Camera, GraduationCap, Users, Newspaper, MapPin, List, X, Image as ImageIcon } from '@phosphor-icons/react';
import { settingsAPI } from '../utils/api';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';

const DEFAULT_LOGO = 'https://customer-assets.emergentagent.com/job_e052bca8-dbf8-4933-8039-fac54198bda4/artifacts/kazh3wbj_243CB557-2CF0-4CAF-8C04-44D9C97272E7_1_105_c.jpeg';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [logoUrl, setLogoUrl] = useState(DEFAULT_LOGO);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const response = await settingsAPI.get();
        if (response.data.logo_url) {
          setLogoUrl(response.data.logo_url);
        }
      } catch (error) {
        // silently fall back to default logo
      }
    };
    fetchLogo();
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: t('news'), path: '/news', icon: Newspaper },
    { name: t('destinations'), path: '/destinations', icon: MapPin },
    { name: t('gear'), path: '/gear', icon: ShoppingBag },
    { name: t('training'), path: '/training', icon: GraduationCap },
    { name: t('photography'), path: '/photography', icon: Camera },
    { name: t('community'), path: '/community', icon: Users },
    { name: t('gallery') || 'Gallery', path: '/gallery', icon: ImageIcon },
  ];

  return (
    <nav
      data-testid="main-navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'backdrop-blur-xl bg-white/80' : 'bg-white/60 backdrop-blur-md'
      } border-b border-[#E2E8F0]`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-2 sm:gap-3 cursor-pointer min-w-0 flex-shrink" data-testid="logo-link">
            <img
              src={logoUrl}
              alt="ScubaPlaydate Logo"
              className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 object-contain flex-shrink-0"
              style={{ background: 'transparent' }}
            />
            <span className="text-lg sm:text-xl md:text-2xl font-black text-[#0284C7] tracking-tight hover:text-[#0369A1] transition-colors truncate">
              ScubaPlaydate
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-6 xl:gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                data-testid={`nav-${link.name.toLowerCase()}`}
                className={`text-sm font-medium tracking-wide transition-colors whitespace-nowrap ${
                  location.pathname === link.path
                    ? 'text-[#0284C7]'
                    : 'text-[#475569] hover:text-[#0284C7]'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <LanguageSwitcher />
            <a
              href="https://www.instagram.com/scubaplaydate/"
              target="_blank"
              rel="noopener noreferrer"
              data-testid="instagram-link"
              className="text-[#475569] hover:text-[#0284C7] transition-colors hidden sm:inline-flex"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              data-testid="mobile-menu-toggle"
              className="lg:hidden p-2 text-[#0A0F1C] hover:text-[#0284C7] transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={24} weight="bold" /> : <List size={24} weight="bold" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div
            data-testid="mobile-nav-menu"
            className="lg:hidden mt-3 pt-3 border-t border-[#E2E8F0]"
          >
            <div className="flex flex-col gap-1 pb-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  data-testid={`mobile-nav-${link.name.toLowerCase()}`}
                  className={`px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${
                    location.pathname === link.path
                      ? 'bg-[#E0F2FE] text-[#0284C7]'
                      : 'text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0284C7]'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
