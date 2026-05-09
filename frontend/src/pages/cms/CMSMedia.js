import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { mediaAPI, uploadAPI } from '../../utils/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { ArrowLeft, UploadSimple, Copy, Trash, MagnifyingGlass } from '@phosphor-icons/react';
import { toast } from 'sonner';

const BACKEND = process.env.REACT_APP_BACKEND_URL || '';

const formatBytes = (b) => {
  if (!b) return '—';
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(2)} MB`;
};

const CMSMedia = () => {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all | gallery
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/forinternalonly');
      return;
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, filter]);

  const load = async () => {
    try {
      const params = { limit: 500 };
      if (filter === 'gallery') params.in_gallery = true;
      if (search) params.search = search;
      const res = await mediaAPI.list(params);
      setItems(res.data);
    } catch (e) {
      toast.error('Failed to load media');
    }
  };

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    let ok = 0, fail = 0;
    for (const file of files) {
      try {
        await uploadAPI.upload(file);
        ok += 1;
      } catch (err) {
        fail += 1;
      }
    }
    setUploading(false);
    if (ok) toast.success(`Uploaded ${ok} file${ok > 1 ? 's' : ''}`);
    if (fail) toast.error(`${fail} upload(s) failed`);
    if (fileRef.current) fileRef.current.value = '';
    load();
  };

  const copyUrl = (path) => {
    const fullUrl = (BACKEND || window.location.origin) + path;
    navigator.clipboard.writeText(fullUrl).then(
      () => toast.success('URL copied to clipboard'),
      () => toast.error('Could not copy')
    );
  };

  const toggleGallery = async (filename, current) => {
    try {
      await mediaAPI.update(filename, { in_gallery: !current });
      toast.success(!current ? 'Added to public gallery' : 'Removed from gallery');
      load();
    } catch (e) {
      toast.error('Failed to update');
    }
  };

  const updateAlt = async (filename, alt) => {
    try {
      await mediaAPI.update(filename, { alt });
      toast.success('Alt text saved');
    } catch (e) {
      toast.error('Failed to save alt');
    }
  };

  const remove = async (filename) => {
    if (!window.confirm(`Delete ${filename}? This cannot be undone.`)) return;
    try {
      await mediaAPI.delete(filename);
      toast.success('Deleted');
      load();
    } catch (e) {
      toast.error('Failed to delete');
    }
  };

  const filtered = search
    ? items.filter((i) => i.filename.toLowerCase().includes(search.toLowerCase()))
    : items;

  return (
    <div data-testid="cms-media-page" className="min-h-screen bg-white">
      <nav className="border-b border-[#E2E8F0] bg-[#FAFAFA] px-6 md:px-12 py-4">
        <Link to="/forinternalonly/dashboard" className="flex items-center gap-2 text-[#0284C7] hover:text-[#0369A1]" data-testid="back-to-dashboard">
          <ArrowLeft size={20} weight="bold" />
          <span className="font-medium">Back to Dashboard</span>
        </Link>
      </nav>

      <div className="px-6 md:px-12 lg:px-24 py-12">
        <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
          <div>
            <h1 className="text-4xl font-black text-[#0A0F1C] mb-2 tracking-tight">Media Library</h1>
            <p className="text-[#475569]">All uploaded images. Toggle "In Gallery" to publish to the public gallery page.</p>
          </div>
          <div>
            <input
              type="file"
              ref={fileRef}
              accept="image/*"
              multiple
              onChange={handleUpload}
              className="hidden"
              data-testid="cms-media-upload-input"
            />
            <Button
              onClick={() => fileRef.current && fileRef.current.click()}
              disabled={uploading}
              className="bg-[#0284C7] hover:bg-[#0369A1] rounded-none"
              data-testid="cms-media-upload-button"
            >
              <UploadSimple size={20} className="mr-2" weight="bold" />
              {uploading ? 'Uploading…' : 'Upload Images'}
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <div className="relative">
            <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <Input
              placeholder="Search filename…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 rounded-none w-64"
              data-testid="cms-media-search"
            />
          </div>
          <div className="flex border border-[#E2E8F0] rounded-sm overflow-hidden">
            <button
              onClick={() => setFilter('all')}
              data-testid="cms-media-filter-all"
              className={`px-4 py-2 text-sm font-medium ${filter === 'all' ? 'bg-[#0284C7] text-white' : 'text-[#475569] hover:bg-[#F1F5F9]'}`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('gallery')}
              data-testid="cms-media-filter-gallery"
              className={`px-4 py-2 text-sm font-medium border-l border-[#E2E8F0] ${filter === 'gallery' ? 'bg-[#0284C7] text-white' : 'text-[#475569] hover:bg-[#F1F5F9]'}`}
            >
              In Public Gallery
            </button>
          </div>
          <span className="text-sm text-[#94A3B8] ml-auto">{filtered.length} item(s)</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((item) => (
            <div
              key={item.filename}
              data-testid={`media-card-${item.filename}`}
              className="border border-[#E2E8F0] rounded-sm overflow-hidden bg-white hover:shadow-md transition-shadow"
            >
              <div className="aspect-square bg-[#F8FAFC] overflow-hidden">
                <img
                  src={(BACKEND || '') + item.url}
                  alt={item.alt || item.filename}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-3 space-y-2">
                <p className="text-xs font-mono text-[#475569] truncate" title={item.filename}>
                  {item.filename}
                </p>
                <p className="text-xs text-[#94A3B8]">
                  {item.width && item.height ? `${item.width}×${item.height} · ` : ''}
                  {formatBytes(item.size_bytes)}
                </p>
                <Input
                  defaultValue={item.alt || ''}
                  placeholder="alt text (SEO)"
                  onBlur={(e) => {
                    if (e.target.value !== (item.alt || '')) {
                      updateAlt(item.filename, e.target.value);
                    }
                  }}
                  className="rounded-none text-xs h-8"
                  data-testid={`media-alt-${item.filename}`}
                />
                <label className="flex items-center gap-2 text-xs text-[#475569] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!item.in_gallery}
                    onChange={() => toggleGallery(item.filename, item.in_gallery)}
                    data-testid={`media-gallery-toggle-${item.filename}`}
                  />
                  In public gallery
                </label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyUrl(item.url)}
                    className="rounded-none flex-1"
                    data-testid={`media-copy-${item.filename}`}
                  >
                    <Copy size={14} className="mr-1" /> URL
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => remove(item.filename)}
                    className="rounded-none text-red-600 hover:text-red-700"
                    data-testid={`media-delete-${item.filename}`}
                  >
                    <Trash size={14} />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-[#94A3B8]">
            No images match your search. Upload some to get started.
          </div>
        )}
      </div>
    </div>
  );
};

export default CMSMedia;
