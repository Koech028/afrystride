import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { adminApi } from '../../services/api';
import Button from '../../components/ui/Button';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await adminApi.login(email, password);
      localStorage.setItem('adminToken', response.access_token);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">

         <img 
                src="/logo.svg" 
                alt="AfryStride" 
                className="h-12 mx-auto mb-4 w-auto"
                onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
             }} 
            />
          <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
          <p className="text-[#9CA3AF] mt-1">Sign in to manage your store</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 space-y-6">
          {error && (
            <div className="bg-[#E31E24]/10 border border-[#E31E24] text-[#E31E24] px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-[#9CA3AF] focus:border-[#E31E24] focus:outline-none"
                placeholder="admin@afrystride.co.ke"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 border border-[#9CA3AF] focus:border-[#E31E24] focus:outline-none"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <Button type="submit" fullWidth disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <p className="text-center text-[#9CA3AF] text-sm mt-6">
          <a href="/" className="hover:text-white transition-colors">← Back to Store</a>
        </p>
      </div>
    </div>
  );
}