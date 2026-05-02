import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../utils/api';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

const CMSLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await authAPI.login(email, password);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      toast.success('Login successful!');
      navigate('/forinternalonly/dashboard');
    } catch (error) {
      toast.error('Invalid credentials');
    }
  };

  return (
    <div data-testid="cms-login-page" className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <img
            src="https://customer-assets.emergentagent.com/job_e052bca8-dbf8-4933-8039-fac54198bda4/artifacts/kazh3wbj_243CB557-2CF0-4CAF-8C04-44D9C97272E7_1_105_c.jpeg"
            alt="ScubaPlaydate"
            className="h-20 w-20 mx-auto mb-4 object-contain"
          />
          <h1 className="text-3xl font-black text-[#0A0F1C] tracking-tight">CMS Login</h1>
          <p className="text-sm text-[#475569] mt-2">Access the ScubaPlaydate content management system</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              data-testid="login-email-input"
              className="mt-1 rounded-none"
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              data-testid="login-password-input"
              className="mt-1 rounded-none"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-[#0284C7] hover:bg-[#0369A1] text-white rounded-none"
            data-testid="login-submit-button"
          >
            Login
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CMSLogin;