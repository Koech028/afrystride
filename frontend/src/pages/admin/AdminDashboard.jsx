import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Package, Grid3X3, MessageSquare, TrendingUp, LogOut, AlertCircle } from 'lucide-react';
import { adminApi } from '../../services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [admin, setAdmin] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsData, adminData] = await Promise.all([
          adminApi.getStats(),
          adminApi.me(),
        ]);
        setStats(statsData);
        setAdmin(adminData);
      } catch (err) {
        if (err.status === 401) {
          localStorage.removeItem('adminToken');
          navigate('/admin/login');
        }
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <div className="animate-pulse text-[#9CA3AF]">Loading...</div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Products', value: stats?.products?.total || 0, icon: Package, color: 'bg-blue-500' },
    { label: 'In Stock', value: stats?.products?.in_stock || 0, icon: TrendingUp, color: 'bg-[#1E8E3E]' },
    { label: 'Out of Stock', value: stats?.products?.out_of_stock || 0, icon: AlertCircle, color: 'bg-[#E31E24]' },
    { label: 'Categories', value: stats?.categories || 0, icon: Grid3X3, color: 'bg-purple-500' },
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Top Bar */}
      <header className="bg-[#0A0A0A] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img
                src="/logo.svg"
                alt=""
                className="h-8 w-auto"
                onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/logo.png';
                }}
            />
            <span className="font-bold">Admin Panel</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[#9CA3AF] hidden sm:inline">{admin?.email}</span>
            <button onClick={handleLogout} className="p-2 hover:text-[#E31E24] transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
                </div>
      </header>
      <Link to="/admin/change-password" className="text-sm hover:text-[#E31E24]">Change Password</Link>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map(card => (
            <div key={card.label} className="bg-white p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`${card.color} p-3 text-white`}>
                  <card.icon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-bold text-[#0A0A0A]">{card.value}</p>
              <p className="text-sm text-[#9CA3AF] mt-1">{card.label}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Link
            to="/admin/products"
            className="bg-white p-6 hover:shadow-lg transition-shadow group"
          >
            <div className="flex items-center gap-4">
              <div className="bg-[#E31E24]/10 p-3 group-hover:bg-[#E31E24] transition-colors">
                <Package className="w-6 h-6 text-[#E31E24] group-hover:text-white transition-colors" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Manage Products</h3>
                <p className="text-sm text-[#9CA3AF]">Add, edit, or remove products</p>
              </div>
            </div>
          </Link>

          <Link to="/admin/messages" className="bg-white p-6 hover:shadow-lg transition-shadow group">
            <div className="flex items-center gap-4">
              <div className="bg-blue-500/10 p-3 group-hover:bg-blue-500 transition-colors">
                <MessageSquare className="w-6 h-6 text-blue-500 group-hover:text-white transition-colors" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Contact Messages</h3>
                <p className="text-sm text-[#9CA3AF]">
                  {stats?.recent_messages?.filter(m => m.status === 'unread').length || 0} unread messages
                </p>
              </div>
            </div>
          </Link>
        </div>
        <Link
  to="/admin/categories"
  className="bg-white p-6 hover:shadow-lg transition-shadow group"
>
  <div className="flex items-center gap-4">
    <div className="bg-purple-500/10 p-3 group-hover:bg-purple-500 transition-colors">
      <Grid3X3 className="w-6 h-6 text-purple-500 group-hover:text-white transition-colors" />
    </div>
    <div>
      <h3 className="font-bold text-lg">Manage Categories</h3>
      <p className="text-sm text-[#9CA3AF]">Add, edit, or remove categories</p>
    </div>
  </div>
</Link>

        {/* Recent Messages */}
        <div className="bg-white">
          <div className="p-6 border-b border-[#E5E5E5] flex items-center justify-between">
            <h2 className="font-bold text-lg">Recent Messages</h2>
            <Link to="/admin/messages" className="text-sm text-[#E31E24] hover:underline">View All</Link>
          </div>
          {stats?.recent_messages?.length > 0 ? (
            <div className="divide-y divide-[#E5E5E5]">
              {stats.recent_messages.map(msg => (
                <div key={msg._id} className="p-4 flex items-start gap-4 hover:bg-[#F5F5F5] transition-colors">
                  <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${msg.status === 'unread' ? 'bg-[#E31E24]' : 'bg-[#9CA3AF]'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{msg.name}</span>
                      <span className="text-xs text-[#9CA3AF]">{msg.phone}</span>
                    </div>
                    <p className="text-sm text-[#0A0A0A] truncate">{msg.message}</p>
                    <p className="text-xs text-[#9CA3AF] mt-1">
                      {new Date(msg.submitted_at).toLocaleString('en-KE')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-[#9CA3AF]">No messages yet</div>
          )}
        </div>
      </div>
    </div>
  );
}