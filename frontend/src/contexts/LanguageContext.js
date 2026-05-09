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
    gallery: 'Gallery',
    readMore: 'Read More',
    latestNews: 'Latest News',
    popularArticles: 'Popular Articles',
    relatedArticles: 'Related Articles',
    by: 'By',
    share: 'Share',
    advertisement: 'Advertisement',
    // Destinations
    destinationsDesc: "Discover the world's best diving destinations and hidden underwater gems.",
    allDestinations: 'All Destinations',
    indonesia: 'Indonesia',
    asia: 'Asia',
    global: 'Global',
    // Gear
    gearDesc: 'Expert reviews and comparisons of the latest scuba diving equipment.',
    allGear: 'All Gear',
    reviews: 'Reviews',
    comparisons: 'Comparisons',
    // Training
    trainingDesc: 'Essential diving tips, techniques, and safety guidelines for all skill levels.',
    allTraining: 'All Training',
    tips: 'Tips',
    safety: 'Safety',
    // Photography
    photographyDesc: 'Master underwater photography with expert tutorials and gear recommendations.',
    allPhotography: 'All Photography',
    tutorials: 'Tutorials',
    // Community
    communityDesc: 'Inspiring stories and interviews from the global diving community.',
    allCommunity: 'All Community',
    stories: 'Stories',
    interviews: 'Interviews',
    // News
    newsDesc: 'Stay updated with the latest scuba diving industry news, marine life discoveries, and conservation efforts.',
    allNews: 'All News',
    industry: 'Industry',
    marineLife: 'Marine Life',
    conservation: 'Conservation',
    noArticles: 'No articles found in this category.',
  },
  id: {
    home: 'Beranda',
    news: 'Berita',
    destinations: 'Destinasi',
    gear: 'Peralatan',
    training: 'Pelatihan',
    photography: 'Fotografi',
    community: 'Komunitas',
    gallery: 'Galeri',
    readMore: 'Baca Selengkapnya',
    latestNews: 'Berita Terbaru',
    popularArticles: 'Artikel Populer',
    relatedArticles: 'Artikel Terkait',
    by: 'Oleh',
    share: 'Bagikan',
    advertisement: 'Iklan',
    // Destinations
    destinationsDesc: 'Temukan destinasi selam terbaik dunia dan permata bawah laut tersembunyi.',
    allDestinations: 'Semua Destinasi',
    indonesia: 'Indonesia',
    asia: 'Asia',
    global: 'Global',
    // Gear
    gearDesc: 'Ulasan ahli dan perbandingan peralatan selam terkini.',
    allGear: 'Semua Peralatan',
    reviews: 'Ulasan',
    comparisons: 'Perbandingan',
    // Training
    trainingDesc: 'Tips menyelam penting, teknik, dan panduan keselamatan untuk semua tingkat keahlian.',
    allTraining: 'Semua Pelatihan',
    tips: 'Tips',
    safety: 'Keselamatan',
    // Photography
    photographyDesc: 'Kuasai fotografi bawah air dengan tutorial ahli dan rekomendasi peralatan.',
    allPhotography: 'Semua Fotografi',
    tutorials: 'Tutorial',
    // Community
    communityDesc: 'Cerita inspiratif dan wawancara dari komunitas selam global.',
    allCommunity: 'Semua Komunitas',
    stories: 'Cerita',
    interviews: 'Wawancara',
    // News
    newsDesc: 'Tetap update dengan berita industri selam terkini, penemuan kehidupan laut, dan upaya konservasi.',
    allNews: 'Semua Berita',
    industry: 'Industri',
    marineLife: 'Kehidupan Laut',
    conservation: 'Konservasi',
    noArticles: 'Tidak ada artikel di kategori ini.',
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