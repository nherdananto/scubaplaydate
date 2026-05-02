import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { articlesAPI } from '../../utils/api';
import { Button } from '../../components/ui/button';
import { ArrowLeft, Plus, Pencil, Trash } from '@phosphor-icons/react';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';

const CMSArticles = () => {
  const [articles, setArticles] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/forinternalonly');
      return;
    }
    loadArticles();
  }, [navigate]);

  const loadArticles = async () => {
    try {
      const response = await articlesAPI.list({ limit: 100 });
      setArticles(response.data);
    } catch (error) {
      toast.error('Failed to load articles');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this article?')) return;
    try {
      await articlesAPI.delete(id);
      toast.success('Article deleted');
      loadArticles();
    } catch (error) {
      toast.error('Failed to delete article');
    }
  };

  return (
    <div data-testid="cms-articles-page" className="min-h-screen bg-white">
      <nav className="border-b border-[#E2E8F0] bg-[#FAFAFA] px-6 md:px-12 py-4">
        <div className="flex items-center justify-between">
          <Link to="/forinternalonly/dashboard" className="flex items-center gap-2 text-[#0284C7] hover:text-[#0369A1]" data-testid="back-to-dashboard">
            <ArrowLeft size={20} weight="bold" />
            <span className="font-medium">Back to Dashboard</span>
          </Link>
        </div>
      </nav>

      <div className="px-6 md:px-12 lg:px-24 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-black text-[#0A0F1C] mb-2 tracking-tight">Articles</h1>
            <p className="text-[#475569]">Manage all your articles</p>
          </div>
          <Link to="/forinternalonly/articles/new">
            <Button className="bg-[#0284C7] hover:bg-[#0369A1] rounded-none" data-testid="create-article-button">
              <Plus size={20} className="mr-2" weight="bold" />
              Create Article
            </Button>
          </Link>
        </div>

        <div className="border border-[#E2E8F0] rounded-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {articles.map((article) => (
                <TableRow key={article.id} data-testid={`article-row-${article.id}`}>
                  <TableCell className="font-medium">{article.title}</TableCell>
                  <TableCell>{article.category}</TableCell>
                  <TableCell>
                    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-sm ${
                      article.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {article.status}
                    </span>
                  </TableCell>
                  <TableCell>{article.featured ? 'Yes' : 'No'}</TableCell>
                  <TableCell>{article.author_name}</TableCell>
                  <TableCell>{new Date(article.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link to={`/forinternalonly/articles/edit/${article.id}`}>
                        <Button variant="outline" size="sm" className="rounded-none" data-testid={`edit-article-${article.id}`}>
                          <Pencil size={16} />
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(article.id)}
                        className="rounded-none text-red-600 hover:text-red-700"
                        data-testid={`delete-article-${article.id}`}
                      >
                        <Trash size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {articles.length === 0 && (
          <div className="text-center py-16 text-[#94A3B8]">
            No articles yet. Create your first article!
          </div>
        )}
      </div>
    </div>
  );
};

export default CMSArticles;