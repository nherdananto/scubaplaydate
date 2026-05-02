import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Editor } from '@tinymce/tinymce-react';
import { articlesAPI, uploadAPI } from '../../utils/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Checkbox } from '../../components/ui/checkbox';
import { ArrowLeft, FloppyDisk } from '@phosphor-icons/react';
import { toast } from 'sonner';

const CMSArticleEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const editorRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    h2_subtitle: '',
    content_html: '',
    category: 'News',
    subcategory: '',
    author_name: '',
    slug: '',
    featured: false,
    status: 'draft',
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
  }, [id, navigate]);

  const loadArticle = async () => {
    try {
      const response = await articlesAPI.get(id);
      setFormData(response.data);
    } catch (error) {
      toast.error('Failed to load article');
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

  const handleSave = async () => {
    if (!formData.title || !formData.h2_subtitle || !formData.author_name || !formData.slug) {
      toast.error('Please fill in all required fields');
      return;
    }

    const content = editorRef.current ? editorRef.current.getContent() : formData.content_html;
    const dataToSave = { ...formData, content_html: content };

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
          <p className="text-[#475569]">Fill in the details for your article</p>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="mt-1 rounded-none"
                data-testid="article-title-input"
                placeholder="Enter article title"
              />
            </div>

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
          </div>

          <div>
            <Label htmlFor="h2_subtitle">Subtitle (H2) *</Label>
            <Input
              id="h2_subtitle"
              value={formData.h2_subtitle}
              onChange={(e) => handleInputChange('h2_subtitle', e.target.value)}
              className="mt-1 rounded-none"
              data-testid="article-subtitle-input"
              placeholder="Brief description of the article"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger className="rounded-none" data-testid="article-category-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="subcategory">Subcategory</Label>
              <Select value={formData.subcategory} onValueChange={(value) => handleInputChange('subcategory', value)}>
                <SelectTrigger className="rounded-none" data-testid="article-subcategory-select">
                  <SelectValue placeholder="Select subcategory" />
                </SelectTrigger>
                <SelectContent>
                  {(subcategoryMap[formData.category] || []).map((sub) => (
                    <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger className="rounded-none" data-testid="article-status-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => handleInputChange('featured', checked)}
                  data-testid="article-featured-checkbox"
                />
                <Label htmlFor="featured" className="cursor-pointer">Featured Article</Label>
              </div>
            </div>
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
            <Label>Article Content *</Label>
            <div className="mt-2 border border-[#E2E8F0] rounded-sm">
              <Editor
                apiKey="no-api-key"
                onInit={(evt, editor) => (editorRef.current = editor)}
                initialValue={formData.content_html}
                init={{
                  height: 500,
                  menubar: true,
                  plugins: [
                    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
                    'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                    'insertdatetime', 'media', 'table', 'preview', 'help', 'wordcount', 'codesample'
                  ],
                  toolbar: 'undo redo | blocks | bold italic forecolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image media | code | help',
                  content_style: 'body { font-family: Manrope, Arial, sans-serif; font-size: 16px; line-height: 1.6; padding: 10px; }',
                  image_title: true,
                  automatic_uploads: true,
                  file_picker_types: 'image',
                  images_upload_handler: async (blobInfo) => {
                    const file = blobInfo.blob();
                    try {
                      const response = await uploadAPI.upload(file);
                      return response.data.url;
                    } catch (error) {
                      throw new Error('Image upload failed');
                    }
                  },
                }}
              />
            </div>
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
