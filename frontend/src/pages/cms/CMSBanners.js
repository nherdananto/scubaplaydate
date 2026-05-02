import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { bannersAPI, uploadAPI } from '../../utils/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Checkbox } from '../../components/ui/checkbox';
import { ArrowLeft, Plus, Pencil, Trash } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';

const CMSBanners = () => {
  const [banners, setBanners] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [formData, setFormData] = useState({ name: '', image_url: '', link_url: '', position: 'sidebar', active: true });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!token || user.role !== 'admin') {
      navigate('/forinternalonly/dashboard');
      return;
    }
    loadBanners();
  }, [navigate]);

  const loadBanners = async () => {
    try {
      const response = await bannersAPI.list();
      setBanners(response.data);
    } catch (error) {
      toast.error('Failed to load banners');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const response = await uploadAPI.upload(file);
      setFormData({ ...formData, image_url: response.data.url });
      toast.success('Image uploaded');
    } catch (error) {
      toast.error('Failed to upload image');
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.image_url) {
      toast.error('Please fill in all required fields');
      return;
    }
    try {
      if (editingBanner) {
        await bannersAPI.update(editingBanner.id, formData);
        toast.success('Banner updated');
      } else {
        await bannersAPI.create(formData);
        toast.success('Banner created');
      }
      setShowDialog(false);
      setEditingBanner(null);
      setFormData({ name: '', image_url: '', link_url: '', position: 'sidebar', active: true });
      loadBanners();
    } catch (error) {
      toast.error('Failed to save banner');
    }
  };

  const handleEdit = (banner) => {
    setEditingBanner(banner);
    setFormData(banner);
    setShowDialog(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await bannersAPI.delete(id);
      toast.success('Banner deleted');
      loadBanners();
    } catch (error) {
      toast.error('Failed to delete banner');
    }
  };

  return (
    <div data-testid="cms-banners-page" className="min-h-screen bg-white">
      <nav className="border-b border-[#E2E8F0] bg-[#FAFAFA] px-6 md:px-12 py-4">
        <Link to="/forinternalonly/dashboard" className="flex items-center gap-2 text-[#0284C7] hover:text-[#0369A1]" data-testid="back-to-dashboard">
          <ArrowLeft size={20} weight="bold" />
          <span className="font-medium">Back to Dashboard</span>
        </Link>
      </nav>

      <div className="px-6 md:px-12 lg:px-24 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-black text-[#0A0F1C] mb-2 tracking-tight">Banners</h1>
            <p className="text-[#475569]">Manage advertising banners and track metrics</p>
          </div>
          <Dialog open={showDialog} onOpenChange={(open) => { setShowDialog(open); if (!open) { setEditingBanner(null); setFormData({ name: '', image_url: '', link_url: '', position: 'sidebar', active: true }); } }}>
            <DialogTrigger asChild>
              <Button className="bg-[#0284C7] hover:bg-[#0369A1] rounded-none" data-testid="create-banner-button">
                <Plus size={20} className="mr-2" weight="bold" />
                Create Banner
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-sm">
              <DialogHeader>
                <DialogTitle>{editingBanner ? 'Edit Banner' : 'Create New Banner'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Name</Label>
                  <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="mt-1 rounded-none" data-testid="banner-name-input" />
                </div>
                <div>
                  <Label>Image</Label>
                  <Input type="file" accept="image/*" onChange={handleImageUpload} className="mt-1 rounded-none" data-testid="banner-image-upload" />
                  {formData.image_url && <img src={formData.image_url} alt="Banner" className="w-full h-32 object-cover mt-2 border border-[#E2E8F0] rounded-sm" />}
                  <p className="text-xs text-[#94A3B8] mt-2">
                    Recommended sizes: 
                    <span className="block mt-1">• Sidebar: 300x250px or 300x600px</span>
                    <span className="block">• Bottom: 728x90px or 970x90px (full width)</span>
                  </p>
                </div>
                <div>
                  <Label>Link URL (Optional)</Label>
                  <Input value={formData.link_url} onChange={(e) => setFormData({ ...formData, link_url: e.target.value })} className="mt-1 rounded-none" placeholder="https://example.com" data-testid="banner-link-input" />
                  <p className="text-xs text-[#94A3B8] mt-1">Where users will be redirected when clicking the banner</p>
                </div>
                <div>
                  <Label>Position</Label>
                  <select
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="mt-1 w-full rounded-none border border-[#E2E8F0] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
                    data-testid="banner-position-select"
                  >
                    <option value="sidebar">Sidebar (Right side of homepage)</option>
                    <option value="bottom">Bottom (Full width before footer)</option>
                  </select>
                  <p className="text-xs text-[#94A3B8] mt-1">
                    {formData.position === 'sidebar' ? 'Appears on the right sidebar of the homepage' : 'Appears full-width above the footer on all pages'}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="active" checked={formData.active} onCheckedChange={(checked) => setFormData({ ...formData, active: checked })} data-testid="banner-active-checkbox" />
                  <Label htmlFor="active" className="cursor-pointer">Active</Label>
                </div>
                <Button onClick={handleSave} className="w-full bg-[#0284C7] hover:bg-[#0369A1] rounded-none" data-testid="save-banner-button">
                  {editingBanner ? 'Update Banner' : 'Create Banner'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="border border-[#E2E8F0] rounded-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Impressions</TableHead>
                <TableHead>Clicks</TableHead>
                <TableHead>CTR</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {banners.map((banner) => (
                <TableRow key={banner.id} data-testid={`banner-row-${banner.id}`}>
                  <TableCell className="font-medium">{banner.name}</TableCell>
                  <TableCell>{banner.position}</TableCell>
                  <TableCell>
                    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-sm ${banner.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {banner.active ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell>{banner.impressions}</TableCell>
                  <TableCell>{banner.clicks}</TableCell>
                  <TableCell>{banner.impressions > 0 ? ((banner.clicks / banner.impressions) * 100).toFixed(2) : 0}%</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(banner)} className="rounded-none" data-testid={`edit-banner-${banner.id}`}>
                        <Pencil size={16} />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(banner.id)} className="rounded-none text-red-600 hover:text-red-700" data-testid={`delete-banner-${banner.id}`}>
                        <Trash size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default CMSBanners;