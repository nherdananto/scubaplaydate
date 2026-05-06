import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Home from './pages/Home';
import ArticleDetail from './pages/ArticleDetail';
import NewsPage from './pages/NewsPage';
import DestinationsPage from './pages/DestinationsPage';
import GearPage from './pages/GearPage';
import TrainingPage from './pages/TrainingPage';
import PhotographyPage from './pages/PhotographyPage';
import CommunityPage from './pages/CommunityPage';
import ContributePage from './pages/ContributePage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import AboutPage from './pages/AboutPage';
import CMSLogin from './pages/cms/CMSLogin';
import CMSDashboard from './pages/cms/CMSDashboard';
import CMSArticles from './pages/cms/CMSArticles';
import CMSArticleEditor from './pages/cms/CMSArticleEditor';
import CMSUsers from './pages/cms/CMSUsers';
import CMSBanners from './pages/cms/CMSBanners';
import CMSSettings from './pages/cms/CMSSettings';
import CmsRouteWrapper from './components/CmsRouteWrapper';
import { Toaster } from './components/ui/sonner';
import GoogleAnalytics from './components/GoogleAnalytics';
import { LanguageProvider } from './contexts/LanguageContext';

function App() {
  useEffect(() => {
    // Remove "Made with Emergent" badge
    const removeBadge = () => {
      const badges = document.querySelectorAll('a[href*="emergent"], div[style*="position: fixed"]');
      badges.forEach(badge => {
        const text = badge.textContent || '';
        if (text.includes('Made with') || text.includes('Emergent')) {
          badge.remove();
        }
      });
    };
    
    // Run immediately and on interval
    removeBadge();
    const interval = setInterval(removeBadge, 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <LanguageProvider>
      <div className="App">
        <Toaster position="top-right" />
        <BrowserRouter>
          <GoogleAnalytics />
          <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/news/:subcategory" element={<NewsPage />} />
          <Route path="/destinations" element={<DestinationsPage />} />
          <Route path="/destinations/:subcategory" element={<DestinationsPage />} />
          <Route path="/gear" element={<GearPage />} />
          <Route path="/gear/:subcategory" element={<GearPage />} />
          <Route path="/training" element={<TrainingPage />} />
          <Route path="/training/:subcategory" element={<TrainingPage />} />
          <Route path="/photography" element={<PhotographyPage />} />
          <Route path="/photography/:subcategory" element={<PhotographyPage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/community/:subcategory" element={<CommunityPage />} />
          <Route path="/contribute" element={<ContributePage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/article/:slug" element={<ArticleDetail />} />
          
          <Route path="/forinternalonly" element={<CmsRouteWrapper><CMSLogin /></CmsRouteWrapper>} />
          <Route path="/forinternalonly/dashboard" element={<CmsRouteWrapper><CMSDashboard /></CmsRouteWrapper>} />
          <Route path="/forinternalonly/articles" element={<CmsRouteWrapper><CMSArticles /></CmsRouteWrapper>} />
          <Route path="/forinternalonly/articles/new" element={<CmsRouteWrapper><CMSArticleEditor /></CmsRouteWrapper>} />
          <Route path="/forinternalonly/articles/edit/:id" element={<CmsRouteWrapper><CMSArticleEditor /></CmsRouteWrapper>} />
          <Route path="/forinternalonly/users" element={<CmsRouteWrapper><CMSUsers /></CmsRouteWrapper>} />
          <Route path="/forinternalonly/banners" element={<CmsRouteWrapper><CMSBanners /></CmsRouteWrapper>} />
          <Route path="/forinternalonly/settings" element={<CmsRouteWrapper><CMSSettings /></CmsRouteWrapper>} />
        </Routes>
      </BrowserRouter>
    </div>
    </LanguageProvider>
  );
}

export default App;