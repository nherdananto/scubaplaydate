import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { settingsAPI, uploadAPI } from '../../utils/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { ArrowLeft, FloppyDisk, Upload } from '@phosphor-icons/react';
import { toast } from 'sonner';

const CMSSettings = () => {
  const [settings, setSettings] = useState({ google_analytics_id: '', google_adsense_id: '', logo_url: '' });
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!token || user.role !== 'admin') {
      navigate('/forinternalonly/dashboard');
      return;
    }
    loadSettings();
  }, [navigate]);

  const loadSettings = async () => {
    try {
      const response = await settingsAPI.get();
      setSettings(response.data);
    } catch (error) {
      toast.error('Failed to load settings');
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const fileType = file.type;
    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(fileType)) {
      toast.error('Only PNG and JPG files are supported');
      return;
    }
    
    setUploading(true);
    try {
      const response = await uploadAPI.upload(file);
      setSettings({ ...settings, logo_url: response.data.url });
      toast.success('Logo uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload logo');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      await settingsAPI.update(settings);
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    }
  };

  return (
    <div data-testid="cms-settings-page" className="min-h-screen bg-white">
      <nav className="border-b border-[#E2E8F0] bg-[#FAFAFA] px-6 md:px-12 py-4">
        <Link to="/forinternalonly/dashboard" className="flex items-center gap-2 text-[#0284C7] hover:text-[#0369A1]" data-testid="back-to-dashboard">
          <ArrowLeft size={20} weight="bold" />
          <span className="font-medium">Back to Dashboard</span>
        </Link>
      </nav>

      <div className="px-6 md:px-12 lg:px-24 py-12 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-[#0A0F1C] mb-2 tracking-tight">Settings</h1>
          <p className="text-[#475569]">Configure site-wide settings</p>
        </div>

        <div className="space-y-8 border border-[#E2E8F0] p-8 rounded-sm">
          <div>
            <h3 className="text-xl font-bold text-[#0A0F1C] mb-4 tracking-tight">Site Branding</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="logo_upload">Site Logo</Label>
                <div className="mt-2 space-y-3">
                  {settings.logo_url && (
                    <div className="border border-[#E2E8F0] rounded-sm p-4 bg-[#F8FAFC] inline-block">
                      <img 
                        src={settings.logo_url} 
                        alt="Current Logo" 
                        className="h-16 w-16 object-contain"
                        style={{ background: 'transparent' }}
                      />
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <Input
                      id="logo_upload"
                      type="file"
                      accept="image/png, image/jpeg, image/jpg"
                      onChange={handleLogoUpload}
                      disabled={uploading}
                      className="rounded-none"
                      data-testid="logo-upload-input"
                    />
                    {uploading && <span className="text-sm text-[#64748B]">Uploading...</span>}
                  </div>
                  <p className="text-xs text-[#94A3B8]">
                    Recommended size: 64x64px or larger. Supports PNG (with transparency) and JPG formats.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-[#E2E8F0] pt-6">
            <h3 className="text-xl font-bold text-[#0A0F1C] mb-4 tracking-tight">Analytics & Advertising</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="google_analytics_id">Google Analytics Tracking ID</Label>
                <Input
                  id="google_analytics_id"
                  value={settings.google_analytics_id || ''}
                  onChange={(e) => setSettings({ ...settings, google_analytics_id: e.target.value })}
                  className="mt-1 rounded-none"
                  placeholder="G-XXXXXXXXXX"
                  data-testid="analytics-id-input"
                />
                <p className="text-xs text-[#94A3B8] mt-1">Enter your Google Analytics 4 measurement ID</p>
              </div>
              <div>
                <Label htmlFor="google_adsense_id">Google AdSense Publisher ID</Label>
                <Input
                  id="google_adsense_id"
                  value={settings.google_adsense_id || ''}
                  onChange={(e) => setSettings({ ...settings, google_adsense_id: e.target.value })}
                  className="mt-1 rounded-none"
                  placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                  data-testid="adsense-id-input"
                />
                <p className="text-xs text-[#94A3B8] mt-1">Enter your Google AdSense publisher ID</p>
              </div>
            </div>
          </div>

          <Button
            onClick={handleSave}
            className="bg-[#0284C7] hover:bg-[#0369A1] rounded-none"
            data-testid="save-settings-button"
          >
            <FloppyDisk size={20} className="mr-2" weight="bold" />
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CMSSettings;