import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { settingsAPI } from '../../utils/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { ArrowLeft, FloppyDisk } from '@phosphor-icons/react';
import { toast } from 'sonner';

const CMSSettings = () => {
  const [settings, setSettings] = useState({ google_analytics_id: '', google_adsense_id: '' });
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

  const handleSave = async () => {
    try {
      await settingsAPI.update(settings);
      toast.success('Settings saved');
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

        <div className="space-y-6 border border-[#E2E8F0] p-8 rounded-sm">
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