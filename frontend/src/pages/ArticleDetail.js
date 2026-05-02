import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SocialShare from '../components/SocialShare';
import { articlesAPI } from '../utils/api';
import { Calendar, User, Tag } from '@phosphor-icons/react';
import { useLanguage } from '../contexts/LanguageContext';

const ArticleDetail = () => {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const { language, t } = useLanguage();

  useEffect(() => {
    loadArticle();
  }, [slug]);

  const loadArticle = async () => {
    try {
      const response = await articlesAPI.getBySlug(slug);
      setArticle(response.data);

      if (response.data.related_articles && response.data.related_articles.length > 0) {
        const related = await Promise.all(
          response.data.related_articles.slice(0, 3).map(id => articlesAPI.get(id).catch(() => null))
        );
        setRelatedArticles(related.filter(r => r).map(r => r.data));
      }
    } catch (error) {
      console.error('Error loading article:', error);
    }
  };

  if (!article) {
    return (
      <div className="bg-white min-h-screen">
        <Navbar />
        <div className="pt-32 px-6 text-center">
          <p className="text-[#475569]">Loading...</p>
        </div>
      </div>
    );
  }

  const title = language === 'id' && article.title_id ? article.title_id : article.title;
  const subtitle = language === 'id' && article.h2_subtitle_id ? article.h2_subtitle_id : article.h2_subtitle;
  const content = language === 'id' && article.content_html_id ? article.content_html_id : article.content_html;

  return (
    <div data-testid="article-detail-page" className="bg-white">
      <Navbar />

      <article className="pt-32 pb-16">
        <div className="px-6 md:px-12 lg:px-24 max-w-4xl mx-auto">
          <div className="mb-8">
            <span className="inline-block bg-[#F1F5F9] text-[#475569] px-3 py-1 rounded-sm text-xs font-semibold uppercase tracking-wider mb-4">
              {article.category}
            </span>
            <h1 className="text-5xl md:text-6xl font-black text-[#0A0F1C] mb-4 tracking-tighter">
              {title}
            </h1>
            <h2 className="text-xl md:text-2xl text-[#475569] font-medium leading-relaxed">
              {subtitle}
            </h2>
          </div>

          <div className="flex items-center justify-between mb-8 pb-8 border-b border-[#E2E8F0]">
            <div className="flex items-center gap-6 text-sm text-[#64748B]">
              <div className="flex items-center gap-2">
                <User size={16} weight="bold" />
                <span>{article.author_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} weight="bold" />
                <span>{new Date(article.created_at).toLocaleDateString()}</span>
              </div>
            </div>
            <SocialShare 
              url={window.location.href}
              title={article.title}
              description={article.h2_subtitle}
            />
          </div>

          {article.featured_image && (
            <div className="mb-12 rounded-sm overflow-hidden">
              <img
                src={article.featured_image}
                alt={article.title}
                className="w-full h-auto"
              />
            </div>
          )}

          <div
            className="article-content text-base text-[#475569] leading-relaxed"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>

        {relatedArticles.length > 0 && (
          <div className="px-6 md:px-12 lg:px-24 max-w-4xl mx-auto mt-16 pt-16 border-t border-[#E2E8F0]">
            <h3 className="text-2xl font-bold text-[#0A0F1C] mb-8 tracking-tight">{t('relatedArticles')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedArticles.map((related) => (
                <Link
                  key={related.id}
                  to={`/article/${related.slug}`}
                  data-testid={`related-article-${related.id}`}
                  className="group"
                >
                  <div className="overflow-hidden rounded-sm mb-3">
                    <img
                      src={related.featured_image || 'https://images.unsplash.com/photo-1548065822-2cd6b99550f8?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2MjJ8MHwxfHNlYXJjaHw0fHxzY3ViYSUyMGRpdmVyJTIwdW5kZXJ3YXRlcnxlbnwwfHx8fDE3Nzc3MTEzOTJ8MA&ixlib=rb-4.1.0&q=85'}
                      alt={related.title}
                      className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <h4 className="text-lg font-semibold text-[#0A0F1C] group-hover:text-[#0284C7] transition-colors">
                    {language === 'id' && related.title_id ? related.title_id : related.title}
                  </h4>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>

      <Footer />
    </div>
  );
};

export default ArticleDetail;