import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { articlesAPI } from '../utils/api';
import { MapPin } from '@phosphor-icons/react';

const DestinationsPage = () => {
  const { subcategory } = useParams();
  const [articles, setArticles] = useState([]);
  const subcategories = ['Indonesia', 'Asia', 'Global'];

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
      <div className="pt-32 pb-16 px-6 md:px-12 lg:px-24">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <MapPin size={32} className="text-[#0284C7]" weight="bold" />
            <h1 className="text-5xl font-black text-[#0A0F1C] tracking-tighter">Destinations</h1>
          </div>
          <p className="text-lg text-[#475569]">
            Discover the world's best diving destinations and hidden underwater gems.
          </p>
        </div>
        <div className="flex gap-3 mb-12">
          <Link to="/destinations" data-testid="destinations-all-tab" className={`px-4 py-2 text-sm font-medium rounded-none border-b-2 transition-colors ${!subcategory ? 'border-[#0284C7] text-[#0284C7]' : 'border-transparent text-[#475569] hover:text-[#0284C7]'}`}>
            All Destinations
          </Link>
          {subcategories.map((sub) => (
            <Link key={sub} to={`/destinations/${sub.toLowerCase()}`} data-testid={`destinations-${sub.toLowerCase()}-tab`} className={`px-4 py-2 text-sm font-medium rounded-none border-b-2 transition-colors ${subcategory === sub.toLowerCase() ? 'border-[#0284C7] text-[#0284C7]' : 'border-transparent text-[#475569] hover:text-[#0284C7]'}`}>
              {sub}
            </Link>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {articles.map((article) => (
            <Link key={article.id} to={`/article/${article.slug}`} data-testid={`article-card-${article.id}`} className="group border border-[#E2E8F0] rounded-sm overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all">
              <div className="overflow-hidden">
                <img src={article.featured_image || 'https://images.unsplash.com/photo-1631102403791-8e33d9be6603?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTN8MHwxfHNlYXJjaHwxfHx1bmRlcndhdGVyJTIwbWFyaW5lJTIwbGlmZSUyMHR1cnRsZXxlbnwwfHx8fDE3Nzc3MTEzOTJ8MA&ixlib=rb-4.1.0&q=85'} alt={article.title} className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
              <div className="p-6">
                <span className="text-xs tracking-[0.2em] uppercase font-bold text-[#64748B] mb-2 inline-block">{article.subcategory || article.category}</span>
                <h3 className="text-xl font-bold text-[#0A0F1C] mb-2 tracking-tight group-hover:text-[#0284C7] transition-colors">{article.title}</h3>
                <p className="text-sm text-[#475569] line-clamp-2 leading-relaxed">{article.h2_subtitle}</p>
              </div>
            </Link>
          ))}
        </div>
        {articles.length === 0 && <div className="text-center py-16"><p className="text-[#94A3B8]">No articles found.</p></div>}
      </div>
      <Footer />
    </div>
  );
};

export default DestinationsPage;