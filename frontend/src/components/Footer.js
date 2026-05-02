import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { settingsAPI } from '../utils/api';

const DEFAULT_LOGO = 'https://customer-assets.emergentagent.com/job_e052bca8-dbf8-4933-8039-fac54198bda4/artifacts/kazh3wbj_243CB557-2CF0-4CAF-8C04-44D9C97272E7_1_105_c.jpeg';

const Footer = () => {
  const [logoUrl, setLogoUrl] = useState(DEFAULT_LOGO);

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const response = await settingsAPI.get();
        if (response.data.logo_url) {
          setLogoUrl(response.data.logo_url);
        }
      } catch (error) {
        console.log('Using default logo');
      }
    };
    fetchLogo();
  }, []);

  return (
    <footer data-testid="main-footer" className="bg-[#0A0F1C] text-white py-24">
      <div className="px-6 md:px-12 lg:px-24">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div>
            <img
              src={logoUrl}
              alt="ScubaPlaydate"
              className="h-16 w-16 mb-4 object-contain"
              style={{ background: 'transparent' }}
            />
            <h3 className="text-2xl font-bold mb-2">ScubaPlaydate</h3>
            <p className="text-[#94A3B8] text-sm leading-relaxed">
              Scuba stories, style, and underwater culture.
            </p>
          </div>

          <div>
            <h4 className="text-xs tracking-[0.2em] uppercase font-bold text-[#64748B] mb-4">
              Explore
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/news" className="text-sm text-[#94A3B8] hover:text-white transition-colors" data-testid="footer-news">
                  News
                </Link>
              </li>
              <li>
                <Link to="/destinations" className="text-sm text-[#94A3B8] hover:text-white transition-colors" data-testid="footer-destinations">
                  Destinations
                </Link>
              </li>
              <li>
                <Link to="/gear" className="text-sm text-[#94A3B8] hover:text-white transition-colors" data-testid="footer-gear">
                  Gear
                </Link>
              </li>
              <li>
                <Link to="/training" className="text-sm text-[#94A3B8] hover:text-white transition-colors" data-testid="footer-training">
                  Training
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs tracking-[0.2em] uppercase font-bold text-[#64748B] mb-4">
              Community
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/photography" className="text-sm text-[#94A3B8] hover:text-white transition-colors" data-testid="footer-photography">
                  Photography
                </Link>
              </li>
              <li>
                <Link to="/community" className="text-sm text-[#94A3B8] hover:text-white transition-colors" data-testid="footer-community">
                  Stories
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs tracking-[0.2em] uppercase font-bold text-[#64748B] mb-4">
              About
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="#contribute" className="text-sm text-[#94A3B8] hover:text-white transition-colors" data-testid="footer-contribute">
                  How to Contribute
                </a>
              </li>
              <li>
                <a href="#about" className="text-sm text-[#94A3B8] hover:text-white transition-colors" data-testid="footer-about">
                  About Us
                </a>
              </li>
              <li>
                <a href="#privacy" className="text-sm text-[#94A3B8] hover:text-white transition-colors" data-testid="footer-privacy">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#475569] pt-8">
          <p className="text-sm text-[#94A3B8] text-center">
            © {new Date().getFullYear()} ScubaPlaydate. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;