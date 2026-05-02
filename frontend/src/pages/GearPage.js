import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { articlesAPI } from '../utils/api';
import { ShoppingBag } from '@phosphor-icons/react';

const GearPage = () => {
  const { subcategory } = useParams();
  const [articles, setArticles] = useState([]);
  const subcategories = ['Reviews', 'Comparisons'];

  useEffect(() => {
    loadArticles();
  }, [subcategory]);

  const loadArticles = async () => {
    try {
      const params = { category: 'Gear', status: 'published', limit: 50 };
      if (subcategory) params.subcategory = subcategory;
      const response = await articlesAPI.list(params);
      setArticles(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div data-testid="gear-page" className="bg-white">
      <Navbar />
      <div className="pt-32 pb-16 px-6 md:px-12 lg:px-24">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <ShoppingBag size={32} className="text-[#0284C7]" weight="bold" />
            <h1 className="text-5xl font-black text-[#0A0F1C] tracking-tighter">Gear</h1>
          </div>
          <p className="text-lg text-[#475569]">Expert reviews and comparisons of the latest scuba diving equipment.</p>
        </div>
        <div className="flex gap-3 mb-12">
          <Link to="/gear" data-testid="gear-all-tab" className={`px-4 py-2 text-sm font-medium rounded-none border-b-2 transition-colors ${!subcategory ? 'border-[#0284C7] text-[#0284C7]' : 'border-transparent text-[#475569] hover:text-[#0284C7]'}`}>All Gear</Link>
          {subcategories.map((sub) => (
            <Link key={sub} to={`/gear/${sub.toLowerCase()}`} data-testid={`gear-${sub.toLowerCase()}-tab`} className={`px-4 py-2 text-sm font-medium rounded-none border-b-2 transition-colors ${subcategory === sub.toLowerCase() ? 'border-[#0284C7] text-[#0284C7]' : 'border-transparent text-[#475569] hover:text-[#0284C7]'}`}>{sub}</Link>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {articles.map((article) => (
            <Link key={article.id} to={`/article/${article.slug}`} data-testid={`article-card-${article.id}`} className="group border border-[#E2E8F0] rounded-sm overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all">
              <div className="overflow-hidden">
                <img src={article.featured_image || 'https://static.prod-images.emergentagent.com/jobs/e052bca8-dbf8-4933-8039-fac54198bda4/images/24eff4407ef00897f0c1d1e4036c6158f07f8167c9fe957e6b521f2f0eecd323.png'} alt={article.title} className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105" />
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

export default GearPage;