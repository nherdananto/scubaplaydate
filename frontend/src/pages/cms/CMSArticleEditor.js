import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Editor } from '@tinymce/tinymce-react';
import { articlesAPI, uploadAPI } from '../../utils/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Checkbox } from '../../components/ui/checkbox';
import { ArrowLeft, FloppyDisk, Globe } from '@phosphor-icons/react';
import { toast } from 'sonner';

const CMSArticleEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const editorEnRef = useRef(null);
  const editorIdRef = useRef(null);
  const [allArticles, setAllArticles] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    title_id: '',
    h2_subtitle: '',
    h2_subtitle_id: '',
    content_html: '',
    content_html_id: '',
    category: 'News',
    subcategory: '',
    author_name: '',
    slug: '',
    featured: false,
    status: 'draft',
    language: 'en',
    seo_title: '',
    seo_description: '',
    seo_keywords: '',
    featured_image: '',
    related_articles: [],
  });

  const categories = ['News', 'Destinations', 'Gear', 'Training', 'Photography', 'Community'];
  const subcategoryMap = {
    News: ['Industry', 'Marine Life', 'Conservation'],
    Destinations: ['Indonesia', 'Asia', 'Global'],
    Gear: ['Reviews', 'Comparisons'],
    Training: ['Tips', 'Safety'],
    Photography: ['Tutorials', 'Gear'],
    Community: ['Stories', 'Interviews'],
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/forinternalonly');
      return;
    }
    if (id) {
      loadArticle();
    }
    loadAllArticles();
  }, [id, navigate]);

  const loadArticle = async () => {
    try {
      const response = await articlesAPI.get(id);
      setFormData(response.data);
    } catch (error) {
      toast.error('Failed to load article');
    }
  };

  const loadAllArticles = async () => {
    try {
      const response = await articlesAPI.list({ limit: 200, status: 'published' });
      setAllArticles(response.data);
    } catch (error) {
      console.log('Failed to load articles for selection');
    }
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (field === 'title' && !id) {
      const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      setFormData({ ...formData, [field]: value, slug });
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const response = await uploadAPI.upload(file);
      setFormData({ ...formData, featured_image: response.data.url });
      toast.success('Image uploaded');
    } catch (error) {
      toast.error('Failed to upload image');
    }
  };

  const handleRelatedArticleToggle = (articleId) => {
    const current = formData.related_articles || [];
    if (current.includes(articleId)) {
      setFormData({ ...formData, related_articles: current.filter(id => id !== articleId) });
    } else if (current.length < 3) {
      setFormData({ ...formData, related_articles: [...current, articleId] });
    } else {
      toast.error('Maximum 3 related articles allowed');
    }
  };

  const handleSave = async () => {
    if (!formData.title || !formData.h2_subtitle || !formData.author_name || !formData.slug) {
      toast.error('Please fill in all required fields (English)');
      return;
    }

    const contentEn = editorEnRef.current ? editorEnRef.current.getContent() : formData.content_html;
    const contentId = editorIdRef.current ? editorIdRef.current.getContent() : formData.content_html_id;
    const dataToSave = { ...formData, content_html: contentEn, content_html_id: contentId };

    try {
      if (id) {
        await articlesAPI.update(id, dataToSave);
        toast.success('Article updated');
      } else {
        await articlesAPI.create(dataToSave);
        toast.success('Article created');
      }
      navigate('/forinternalonly/articles');
    } catch (error) {
      toast.error('Failed to save article');
    }
  };

  return (
    <div data-testid="cms-article-editor-page" className="min-h-screen bg-white">
      <nav className="border-b border-[#E2E8F0] bg-[#FAFAFA] px-6 md:px-12 py-4">
        <div className="flex items-center justify-between">
          <Link to="/forinternalonly/articles" className="flex items-center gap-2 text-[#0284C7] hover:text-[#0369A1]" data-testid="back-to-articles">
            <ArrowLeft size={20} weight="bold" />
            <span className="font-medium">Back to Articles</span>
          </Link>
        </div>
      </nav>

      <div className="px-6 md:px-12 lg:px-24 py-12 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-[#0A0F1C] mb-2 tracking-tight">
            {id ? 'Edit Article' : 'Create New Article'}
          </h1>
          <p className="text-[#475569]">Fill in the details for your article in both English and Bahasa Indonesia</p>
        </div>

        <div className="space-y-8">
          <div className="bg-[#F8FAFC] p-6 rounded-sm border border-[#E2E8F0]">
            <div className="flex items-center gap-2 mb-4">
              <Globe size={20} className="text-[#0284C7]" weight="bold" />
              <h2 className="text-xl font-bold text-[#0A0F1C]">English Version</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title (English) *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="mt-1 rounded-none bg-white"
                  data-testid="article-title-input"
                  placeholder="Enter article title in English"
                />
              </div>

              <div>
                <Label htmlFor="h2_subtitle">Subtitle (English) *</Label>
                <Input
                  id="h2_subtitle"
                  value={formData.h2_subtitle}
                  onChange={(e) => handleInputChange('h2_subtitle', e.target.value)}
                  className="mt-1 rounded-none bg-white"
                  data-testid="article-subtitle-input"
                  placeholder="Brief description in English"
                />
              </div>

              <div>
                <Label>Content (English) *</Label>
                <div className="mt-2">
                  <Editor
                    apiKey="8at83rd9smyi9qk4fuip7ofag7egov9mez24zp89l7qv31h6"
                    onInit={(evt, editor) => (editorEnRef.current = editor)}
                    initialValue={formData.content_html}
                    init={{
                      height: 400,
                      menubar: false,
                      plugins: ['lists', 'link', 'image', 'code'],
                      toolbar: 'undo redo | formatselect | bold italic | alignleft aligncenter alignright | bullist numlist | link image | code',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#FFF4ED] p-6 rounded-sm border border-[#F26419]">
            <div className="flex items-center gap-2 mb-4">
              <Globe size={20} className="text-[#F26419]" weight="bold" />
              <h2 className="text-xl font-bold text-[#0A0F1C]">Bahasa Indonesia Version</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="title_id">Judul (Bahasa Indonesia) *</Label>
                <Input
                  id="title_id"
                  value={formData.title_id || ''}
                  onChange={(e) => handleInputChange('title_id', e.target.value)}
                  className="mt-1 rounded-none bg-white"
                  placeholder="Masukkan judul artikel dalam Bahasa Indonesia"
                />
              </div>

              <div>
                <Label htmlFor="h2_subtitle_id">Subjudul (Bahasa Indonesia) *</Label>
                <Input
                  id="h2_subtitle_id"
                  value={formData.h2_subtitle_id || ''}
                  onChange={(e) => handleInputChange('h2_subtitle_id', e.target.value)}
                  className="mt-1 rounded-none bg-white"
                  placeholder="Deskripsi singkat dalam Bahasa Indonesia"
                />
              </div>

              <div>
                <Label>Konten (Bahasa Indonesia) *</Label>
                <div className="mt-2">
                  <Editor
                    apiKey="8at83rd9smyi9qk4fuip7ofag7egov9mez24zp89l7qv31h6"
                    onInit={(evt, editor) => (editorIdRef.current = editor)}
                    initialValue={formData.content_html_id}
                    init={{
                      height: 400,
                      menubar: false,
                      plugins: ['lists', 'link', 'image', 'code'],
                      toolbar: 'undo redo | formatselect | bold italic | alignleft aligncenter alignright | bullist numlist | link image | code',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => handleInputChange('slug', e.target.value)}
                className="mt-1 rounded-none"
                data-testid="article-slug-input"
                placeholder="article-slug"
              />
            </div>
            <div>
              <Label htmlFor="author_name">Author Name *</Label>
              <Input
                id="author_name"
                value={formData.author_name}
                onChange={(e) => handleInputChange('author_name', e.target.value)}
                className="mt-1 rounded-none"
                data-testid="article-author-input"
                placeholder="John Doe"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="category">Category *</Label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="mt-1 w-full rounded-none border border-[#E2E8F0] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
                data-testid="article-category-select"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="subcategory">Subcategory</Label>
              <select
                id="subcategory"
                value={formData.subcategory}
                onChange={(e) => handleInputChange('subcategory', e.target.value)}
                className="mt-1 w-full rounded-none border border-[#E2E8F0] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
                data-testid="article-subcategory-select"
              >
                <option value="">Select subcategory</option>
                {(subcategoryMap[formData.category] || []).map((sub) => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="mt-1 w-full rounded-none border border-[#E2E8F0] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
                data-testid="article-status-select"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="featured"
              checked={formData.featured}
              onCheckedChange={(checked) => handleInputChange('featured', checked)}
              data-testid="article-featured-checkbox"
            />
            <Label htmlFor="featured" className="cursor-pointer">Featured Article</Label>
          </div>

          <div>
            <Label htmlFor="featured_image">Featured Image</Label>
            <div className="mt-1 space-y-2">
              <Input
                id="featured_image"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="rounded-none"
                data-testid="article-image-upload"
              />
              {formData.featured_image && (
                <img src={formData.featured_image} alt="Featured" className="w-48 h-32 object-cover border border-[#E2E8F0] rounded-sm" />
              )}
            </div>
          </div>

          <div>
            <Label>Related Articles (Maximum 3)</Label>
            <div className="mt-2 border border-[#E2E8F0] rounded-sm p-4 bg-[#F8FAFC] max-h-64 overflow-y-auto">
              {allArticles.filter(a => a.id !== id).map((article) => (
                <div key={article.id} className="flex items-center space-x-2 py-2 border-b border-[#E2E8F0] last:border-0">
                  <Checkbox
                    id={`related-${article.id}`}
                    checked={(formData.related_articles || []).includes(article.id)}
                    onCheckedChange={() => handleRelatedArticleToggle(article.id)}
                    disabled={(formData.related_articles || []).length >= 3 && !(formData.related_articles || []).includes(article.id)}
                  />
                  <Label htmlFor={`related-${article.id}`} className="cursor-pointer text-sm">
                    {article.title}
                  </Label>
                </div>
              ))}
            </div>
            <p className="text-xs text-[#94A3B8] mt-1">
              Selected: {(formData.related_articles || []).length}/3
            </p>
          </div>

          <div className="border-t border-[#E2E8F0] pt-6">
            <h3 className="text-xl font-bold text-[#0A0F1C] mb-4 tracking-tight">SEO Settings</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="seo_title">SEO Title</Label>
                <Input
                  id="seo_title"
                  value={formData.seo_title}
                  onChange={(e) => handleInputChange('seo_title', e.target.value)}
                  className="mt-1 rounded-none"
                  placeholder="Leave blank to use article title"
                />
              </div>
              <div>
                <Label htmlFor="seo_description">SEO Description</Label>
                <Input
                  id="seo_description"
                  value={formData.seo_description}
                  onChange={(e) => handleInputChange('seo_description', e.target.value)}
                  className="mt-1 rounded-none"
                  placeholder="Meta description for search engines"
                />
              </div>
              <div>
                <Label htmlFor="seo_keywords">SEO Keywords</Label>
                <Input
                  id="seo_keywords"
                  value={formData.seo_keywords}
                  onChange={(e) => handleInputChange('seo_keywords', e.target.value)}
                  className="mt-1 rounded-none"
                  placeholder="scuba diving, underwater, marine life"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-6">
            <Button
              onClick={handleSave}
              className="bg-[#0284C7] hover:bg-[#0369A1] rounded-none"
              data-testid="save-article-button"
            >
              <FloppyDisk size={20} className="mr-2" weight="bold" />
              {id ? 'Update Article' : 'Create Article'}
            </Button>
            <Link to="/forinternalonly/articles">
              <Button variant="outline" className="rounded-none">Cancel</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CMSArticleEditor;