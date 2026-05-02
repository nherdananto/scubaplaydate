import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Newspaper, Users, Image, Gear, SignOut } from '@phosphor-icons/react';
import { Button } from '../../components/ui/button';

const CMSDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/forinternalonly');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/forinternalonly');
  };

  const menuItems = [
    { name: 'Articles', icon: Newspaper, path: '/forinternalonly/articles', testId: 'dashboard-articles' },
    { name: 'Users', icon: Users, path: '/forinternalonly/users', testId: 'dashboard-users', adminOnly: true },
    { name: 'Banners', icon: Image, path: '/forinternalonly/banners', testId: 'dashboard-banners', adminOnly: true },
    { name: 'Settings', icon: Gear, path: '/forinternalonly/settings', testId: 'dashboard-settings', adminOnly: true },
  ];

  return (
    <div data-testid="cms-dashboard-page" className="min-h-screen bg-white">
      <nav className="border-b border-[#E2E8F0] bg-[#FAFAFA]">
        <div className="px-6 md:px-12 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="https://customer-assets.emergentagent.com/job_e052bca8-dbf8-4933-8039-fac54198bda4/artifacts/kazh3wbj_243CB557-2CF0-4CAF-8C04-44D9C97272E7_1_105_c.jpeg"
              alt="ScubaPlaydate"
              className="h-10 w-10 object-contain"
            />
            <span className="text-xl font-black text-[#0284C7]">CMS Dashboard</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[#475569]">Welcome, {user.email}</span>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="rounded-none"
              data-testid="logout-button"
            >
              <SignOut size={16} className="mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <div className="px-6 md:px-12 lg:px-24 py-16">
        <h1 className="text-4xl font-black text-[#0A0F1C] mb-2 tracking-tight">Dashboard</h1>
        <p className="text-[#475569] mb-12">Manage your ScubaPlaydate content</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {menuItems
            .filter(item => !item.adminOnly || user.role === 'admin')
            .map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  data-testid={item.testId}
                  className="border border-[#E2E8F0] p-8 rounded-sm hover:shadow-lg hover:-translate-y-1 transition-all group"
                >
                  <Icon size={40} className="text-[#0284C7] mb-4" weight="bold" />
                  <h3 className="text-xl font-bold text-[#0A0F1C] group-hover:text-[#0284C7] transition-colors">
                    {item.name}
                  </h3>
                </Link>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default CMSDashboard;