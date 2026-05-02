import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { articlesAPI } from '../utils/api';
import { GraduationCap } from '@phosphor-icons/react';

const TrainingPage = () => {
  const { subcategory } = useParams();
  const [articles, setArticles] = useState([]);
  const subcategories = ['Tips', 'Safety'];

  useEffect(() => {
    loadArticles();
  }, [subcategory]);

  const loadArticles = async () => {
    try {
      const params = { category: 'Training', status: 'published', limit: 50 };
      if (subcategory) params.subcategory = subcategory;
      const response = await articlesAPI.list(params);
      setArticles(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div data-testid="training-page" className="bg-white">
      <Navbar />
      <div className="max-w-7xl mx-auto pt-32 pb-16 px-4 sm:px-6 md:px-8 lg:px-12">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <GraduationCap size={32} className="text-[#0284C7]" weight="bold" />
            <h1 className="text-5xl font-black text-[#0A0F1C] tracking-tighter">Training</h1>
          </div>
          <p className="text-lg text-[#475569]">Essential diving tips, techniques, and safety guidelines for all skill levels.</p>
        </div>
        <div className="flex gap-3 mb-12">
          <Link to="/training" data-testid="training-all-tab" className={`px-4 py-2 text-sm font-medium rounded-none border-b-2 transition-colors ${!subcategory ? 'border-[#0284C7] text-[#0284C7]' : 'border-transparent text-[#475569] hover:text-[#0284C7]'}`}>All Training</Link>
          {subcategories.map((sub) => (
            <Link key={sub} to={`/training/${sub.toLowerCase()}`} data-testid={`training-${sub.toLowerCase()}-tab`} className={`px-4 py-2 text-sm font-medium rounded-none border-b-2 transition-colors ${subcategory === sub.toLowerCase() ? 'border-[#0284C7] text-[#0284C7]' : 'border-transparent text-[#475569] hover:text-[#0284C7]'}`}>{sub}</Link>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {articles.map((article) => (
            <Link key={article.id} to={`/article/${article.slug}`} data-testid={`article-card-${article.id}`} className="group border border-[#E2E8F0] rounded-sm overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all">
              <div className="overflow-hidden">
                <img src={article.featured_image || 'https://images.unsplash.com/photo-1548065822-2cd6b99550f8?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2MjJ8MHwxfHNlYXJjaHw0fHxzY3ViYSUyMGRpdmVyJTIwdW5kZXJ3YXRlcnxlbnwwfHx8fDE3Nzc3MTEzOTJ8MA&ixlib=rb-4.1.0&q=85'} alt={article.title} className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105" />
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

export default TrainingPage;