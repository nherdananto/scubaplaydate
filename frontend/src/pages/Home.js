import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { articlesAPI, bannersAPI } from '../utils/api';
import { TrendUp } from '@phosphor-icons/react';
import { useLanguage } from '../contexts/LanguageContext';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

// Pick the correct localized field with fallback to English.
const localized = (article, field, language) => {
  if (!article) return '';
  if (language === 'id') {
    return article[`${field}_id`] || article[field] || '';
  }
  return article[field] || '';
};

const Home = () => {
  const [heroArticle, setHeroArticle] = useState(null);
  const [trendingArticles, setTrendingArticles] = useState([]);
  const [latestNews, setLatestNews] = useState([]);
  const [popularArticles, setPopularArticles] = useState([]);
  const [banners, setBanners] = useState([]);
  const { language, t } = useLanguage();
  useDocumentMeta({});  // uses defaults — site-wide SEO

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const featured = await articlesAPI.list({ featured: true, status: 'published', limit: 4 });
      if (featured.data.length > 0) {
        setHeroArticle(featured.data[0]);
        setTrendingArticles(featured.data.slice(1, 4));
      }

      const latest = await articlesAPI.list({ status: 'published', limit: 6 });
      setLatestNews(latest.data);

      const popular = await articlesAPI.list({ status: 'published', limit: 5 });
      setPopularArticles(popular.data);

      const bannerData = await bannersAPI.list({ active: true });
      setBanners(bannerData.data);

      bannerData.data.forEach(banner => {
        bannersAPI.trackImpression(banner.id).catch(() => {});
      });
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleBannerClick = (bannerId) => {
    bannersAPI.trackClick(bannerId).catch(() => {});
  };

  return (
    <div data-testid="home-page" className="bg-white">
      <Navbar />

      <div className="pt-20">
        {heroArticle && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-12">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              <Link
                to={`/article/${heroArticle.slug}`}
                data-testid="hero-article"
                className="md:col-span-8 relative h-[500px] overflow-hidden rounded-sm group"
              >
                <img
                  src={heroArticle.featured_image || 'https://static.prod-images.emergentagent.com/jobs/e052bca8-dbf8-4933-8039-fac54198bda4/images/33a3746a2a17f384af0b69ccb9800deb2d00f489a5f409ef34e431aca541eed9.png'}
                  alt={localized(heroArticle, 'title', language)}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 hero-gradient-overlay" />
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <span className="text-xs tracking-[0.2em] uppercase font-bold text-white/80 mb-2 inline-block">
                    {heroArticle.category}
                  </span>
                  <h1 className="text-4xl md:text-5xl font-black text-white mb-3 tracking-tight">
                    {localized(heroArticle, 'title', language)}
                  </h1>
                  <p className="text-lg text-white/90 font-medium">
                    {localized(heroArticle, 'h2_subtitle', language)}
                  </p>
                </div>
              </Link>

              <div className="md:col-span-4 space-y-4">
                {trendingArticles.map((article) => (
                  <Link
                    key={article.id}
                    to={`/article/${article.slug}`}
                    data-testid={`trending-article-${article.id}`}
                    className="block relative h-[158px] overflow-hidden rounded-sm group border border-[#E2E8F0] hover:shadow-lg transition-all"
                  >
                    <img
                      src={article.featured_image || 'https://images.unsplash.com/photo-1548065822-2cd6b99550f8?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2MjJ8MHwxfHNlYXJjaHw0fHxzY3ViYSUyMGRpdmVyJTIwdW5kZXJ3YXRlcnxlbnwwfHx8fDE3Nzc3MTEzOTJ8MA&ixlib=rb-4.1.0&q=85'}
                      alt={localized(article, 'title', language)}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 hero-gradient-overlay" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-white/80 mb-1 inline-block">
                        {article.category}
                      </span>
                      <h3 className="text-base font-bold text-white tracking-tight line-clamp-2">
                        {localized(article, 'title', language)}
                      </h3>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-16">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
            <div className="md:col-span-8">
              <div className="flex items-center gap-3 mb-8">
                <TrendUp size={24} className="text-[#0284C7]" weight="bold" />
                <h2 className="text-3xl font-bold text-[#0A0F1C] tracking-tight">{t('latestNews')}</h2>
              </div>

              <div className="space-y-6">
                {latestNews.map((article) => (
                  <Link
                    key={article.id}
                    to={`/article/${article.slug}`}
                    data-testid={`latest-article-${article.id}`}
                    className="flex gap-6 pb-6 border-b border-[#E2E8F0] group"
                  >
                    <div className="w-48 h-32 flex-shrink-0 overflow-hidden rounded-sm">
                      <img
                        src={article.featured_image || 'https://images.unsplash.com/photo-1628371190872-df8c9dee1093?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2MjJ8MHwxfHNlYXJjaHwxfHxzY3ViYSUyMGRpdmVyJTIwdW5kZXJ3YXRlcnxlbnwwfHx8fDE3Nzc3MTEzOTJ8MA&ixlib=rb-4.1.0&q=85'}
                        alt={localized(article, 'title', language)}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="flex-1">
                      <span className="text-xs tracking-[0.2em] uppercase font-bold text-[#64748B] mb-2 inline-block">
                        {article.category}
                      </span>
                      <h3 className="text-xl font-bold text-[#0A0F1C] mb-2 tracking-tight group-hover:text-[#0284C7] transition-colors">
                        {localized(article, 'title', language)}
                      </h3>
                      <p className="text-sm text-[#475569] line-clamp-2 leading-relaxed">
                        {localized(article, 'h2_subtitle', language)}
                      </p>
                      <p className="text-xs text-[#94A3B8] mt-2">{t('by')} {article.author_name}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="md:col-span-4">
              <h3 className="text-xl font-bold text-[#0A0F1C] mb-6 tracking-tight">{t('popularArticles')}</h3>
              <div className="bg-[#F8FAFC] p-6 rounded-sm space-y-4" data-testid="popular-articles-sidebar">
                {popularArticles.map((article, idx) => (
                  <Link
                    key={article.id}
                    to={`/article/${article.slug}`}
                    data-testid={`popular-article-${article.id}`}
                    className="block pb-4 border-b border-[#E2E8F0] last:border-0 group"
                  >
                    <span className="text-2xl font-black text-[#0284C7]/20 block mb-1">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <h4 className="text-sm font-semibold text-[#0A0F1C] group-hover:text-[#0284C7] transition-colors line-clamp-2">
                      {localized(article, 'title', language)}
                    </h4>
                  </Link>
                ))}
              </div>

              {banners.filter(b => b.position === 'sidebar').slice(0, 1).map((banner) => (
                <a
                  key={banner.id}
                  href={banner.link_url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleBannerClick(banner.id)}
                  data-testid={`banner-${banner.id}`}
                  className="block mt-8 relative overflow-hidden rounded-sm border-2 border-[#0284C7]"
                >
                  <div className="absolute top-2 right-2 text-xs font-semibold text-white bg-[#0284C7] px-2 py-1 rounded-sm z-10">
                    Sidebar Banner
                  </div>
                  <img
                    src={banner.image_url}
                    alt={banner.name}
                    className="w-full h-auto"
                  />
                </a>
              ))}

              {banners.filter(b => b.position === 'sidebar').length === 0 && (
                <div className="mt-8 bg-[#F8FAFC] border-2 border-dashed border-[#0284C7] p-8 rounded-sm text-center">
                  <div className="text-xs font-semibold text-[#0284C7] mb-2">Sidebar Banner Placement</div>
                  <p className="text-sm text-[#64748B]">No banner configured</p>
                  <p className="text-xs text-[#94A3B8] mt-1">Add in CMS → Banners</p>
                </div>
              )}

              <div className="mt-8 bg-[#F1F5F9] p-8 rounded-sm text-center relative" data-testid="adsense-placeholder">
                <div className="absolute top-2 right-2 text-xs font-semibold text-[#64748B] bg-white px-2 py-1 rounded-sm border border-[#E2E8F0]">
                  Google AdSense
                </div>
                <p className="text-sm text-[#94A3B8] font-medium mt-4">Advertisement Space</p>
                <p className="text-xs text-[#CBD5E1] mt-1">Configure in CMS → Settings</p>
              </div>
            </div>
          </div>
        </section>

        {banners.filter(b => b.position === 'bottom').slice(0, 1).map((banner) => (
          <section key={banner.id} className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-8">
            <a
              href={banner.link_url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleBannerClick(banner.id)}
              data-testid={`bottom-banner-${banner.id}`}
              className="block relative overflow-hidden rounded-sm border-2 border-[#F26419]"
            >
              <div className="absolute top-4 right-4 text-xs font-semibold text-white bg-[#F26419] px-3 py-1 rounded-sm z-10">
                Bottom Banner
              </div>
              <img
                src={banner.image_url}
                alt={banner.name}
                className="w-full h-auto"
              />
            </a>
          </section>
        ))}

        {banners.filter(b => b.position === 'bottom').length === 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-8">
            <div className="bg-[#FFF4ED] border-2 border-dashed border-[#F26419] p-12 rounded-sm text-center">
              <div className="text-sm font-semibold text-[#F26419] mb-2">Bottom Banner Placement (Full Width)</div>
              <p className="text-sm text-[#64748B]">No banner configured</p>
              <p className="text-xs text-[#94A3B8] mt-1">Add in CMS → Banners → Position: Bottom</p>
            </div>
          </section>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Home;
