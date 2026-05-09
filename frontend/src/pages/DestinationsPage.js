import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { articlesAPI } from '../utils/api';
import { MapPin } from '@phosphor-icons/react';
import { useLanguage } from '../contexts/LanguageContext';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import BottomBanner from '../components/BottomBanner';

const DestinationsPage = () => {
  const { subcategory } = useParams();
  const [articles, setArticles] = useState([]);
  const { language, t } = useLanguage();
  const subcatLabel = subcategory ? subcategory.charAt(0).toUpperCase() + subcategory.slice(1) : null;
  useDocumentMeta({
    title: subcatLabel ? `${subcatLabel} Dive Destinations` : 'Dive Destinations',
    description: "Discover the world's best dive destinations — from Indonesia's Coral Triangle to remote Pacific atolls.",
  });
  const subcategories = [
    { value: 'Indonesia', key: 'indonesia' },
    { value: 'Asia', key: 'asia' },
    { value: 'Global', key: 'global' },
  ];

  useEffect(() => {
    loadArticles();
  }, [subcategory]);

  const loadArticles = async () => {
    try {
      const params = { category: 'Destinations', status: 'published', limit: 50 };
      if (subcategory) params.subcategory = subcategory;
      const response = await articlesAPI.list(params);
      setArticles(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div data-testid="destinations-page" className="bg-white">
      <Navbar />
      <div className="max-w-7xl mx-auto pt-32 pb-16 px-4 sm:px-6 md:px-8 lg:px-12">
        <div className="mb-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <MapPin size={32} className="text-[#0284C7]" weight="bold" />
            <h1 className="text-5xl font-black text-[#0A0F1C] tracking-tighter">{t('destinations')}</h1>
          </div>
          <p className="text-lg text-[#475569] max-w-2xl mx-auto">{t('destinationsDesc')}</p>
        </div>
        <div className="flex justify-center gap-3 mb-12 flex-wrap">
          <Link to="/destinations" data-testid="destinations-all-tab" className={`px-4 py-2 text-sm font-medium rounded-none border-b-2 transition-colors ${!subcategory ? 'border-[#0284C7] text-[#0284C7]' : 'border-transparent text-[#475569] hover:text-[#0284C7]'}`}>
            {t('allDestinations')}
          </Link>
          {subcategories.map((sub) => (
            <Link key={sub.value} to={`/destinations/${sub.value.toLowerCase()}`} data-testid={`destinations-${sub.value.toLowerCase()}-tab`} className={`px-4 py-2 text-sm font-medium rounded-none border-b-2 transition-colors ${subcategory === sub.value.toLowerCase() ? 'border-[#0284C7] text-[#0284C7]' : 'border-transparent text-[#475569] hover:text-[#0284C7]'}`}>
              {t(sub.key)}
            </Link>
          ))}
        </div>
        <div className="flex flex-wrap justify-center gap-8">
          {articles.map((article) => (
            <Link key={article.id} to={`/article/${article.slug}`} data-testid={`article-card-${article.id}`} className="group w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.334rem)] max-w-md border border-[#E2E8F0] rounded-sm overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all">
              <div className="overflow-hidden">
                <img src={article.featured_image || 'https://images.unsplash.com/photo-1631102403791-8e33d9be6603?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTN8MHwxfHNlYXJjaHwxfHx1bmRlcndhdGVyJTIwbWFyaW5lJTIwbGlmZSUyMHR1cnRsZXxlbnwwfHx8fDE3Nzc3MTEzOTJ8MA&ixlib=rb-4.1.0&q=85'} alt={article.title} className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
              <div className="p-6">
                <span className="text-xs tracking-[0.2em] uppercase font-bold text-[#64748B] mb-2 inline-block">{article.subcategory || article.category}</span>
                <h3 className="text-xl font-bold text-[#0A0F1C] mb-2 tracking-tight group-hover:text-[#0284C7] transition-colors">
                  {language === 'id' && article.title_id ? article.title_id : article.title}
                </h3>
                <p className="text-sm text-[#475569] line-clamp-2 leading-relaxed">
                  {language === 'id' && article.h2_subtitle_id ? article.h2_subtitle_id : article.h2_subtitle}
                </p>
              </div>
            </Link>
          ))}
        </div>
        {articles.length === 0 && <div className="text-center py-16"><p className="text-[#94A3B8]">{t('noArticles')}</p></div>}
      </div>
      <BottomBanner showPlaceholder={false} />
      <Footer />
    </div>
  );
};

export default DestinationsPage;
