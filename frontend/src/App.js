import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ArticleDetail from './pages/ArticleDetail';
import NewsPage from './pages/NewsPage';
import DestinationsPage from './pages/DestinationsPage';
import GearPage from './pages/GearPage';
import TrainingPage from './pages/TrainingPage';
import PhotographyPage from './pages/PhotographyPage';
import CommunityPage from './pages/CommunityPage';
import CMSLogin from './pages/cms/CMSLogin';
import CMSDashboard from './pages/cms/CMSDashboard';
import CMSArticles from './pages/cms/CMSArticles';
import CMSArticleEditor from './pages/cms/CMSArticleEditor';
import CMSUsers from './pages/cms/CMSUsers';
import CMSBanners from './pages/cms/CMSBanners';
import CMSSettings from './pages/cms/CMSSettings';
import { Toaster } from './components/ui/sonner';
import GoogleAnalytics from './components/GoogleAnalytics';

function App() {
  return (
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
          <Route path="/article/:slug" element={<ArticleDetail />} />
          
          <Route path="/forinternalonly" element={<CMSLogin />} />
          <Route path="/forinternalonly/dashboard" element={<CMSDashboard />} />
          <Route path="/forinternalonly/articles" element={<CMSArticles />} />
          <Route path="/forinternalonly/articles/new" element={<CMSArticleEditor />} />
          <Route path="/forinternalonly/articles/edit/:id" element={<CMSArticleEditor />} />
          <Route path="/forinternalonly/users" element={<CMSUsers />} />
          <Route path="/forinternalonly/banners" element={<CMSBanners />} />
          <Route path="/forinternalonly/settings" element={<CMSSettings />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;