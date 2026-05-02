import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const translations = {
  en: {
    home: 'Home',
    news: 'News',
    destinations: 'Destinations',
    gear: 'Gear',
    training: 'Training',
    photography: 'Photography',
    community: 'Community',
    readMore: 'Read More',
    latestNews: 'Latest News',
    popularArticles: 'Popular Articles',
    relatedArticles: 'Related Articles',
    by: 'By',
    share: 'Share',
    advertisement: 'Advertisement',
  },
  id: {
    home: 'Beranda',
    news: 'Berita',
    destinations: 'Destinasi',
    gear: 'Peralatan',
    training: 'Pelatihan',
    photography: 'Fotografi',
    community: 'Komunitas',
    readMore: 'Baca Selengkapnya',
    latestNews: 'Berita Terbaru',
    popularArticles: 'Artikel Populer',
    relatedArticles: 'Artikel Terkait',
    by: 'Oleh',
    share: 'Bagikan',
    advertisement: 'Iklan',
  },
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'id' : 'en');
  };

  const t = (key) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};