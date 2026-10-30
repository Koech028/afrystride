import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, MailOpen, Trash2, ArrowLeft, Phone, User, Clock, Search } from 'lucide-react';
import { contactApi } from '../../services/api';
import Button from '../../components/ui/Button';

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const data = await contactApi.getMessages();
      setMessages(data);
    } catch (err) {
      if (err.status === 401) navigate('/admin/login');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await contactApi.markRead(id);
      setMessages(prev => prev.map(m => 
        m._id === id ? { ...m, status: 'read' } : m
      ));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await contactApi.deleteMessage(id);
      setDeleteConfirm(null);
      loadMessages();
    } catch (err) {
      alert(err.message || 'Failed to delete message');
    }
  };

  const filteredMessages = messages.filter(m =>
    m.name?.toLowerCase().includes(search.toLowerCase()) ||
    m.phone?.toLowerCase().includes(search.toLowerCase()) ||
    m.message?.toLowerCase().includes(search.toLowerCase())
  );

  const unreadCount = messages.filter(m => m.status === 'unread').length;

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Header */}
      <header className="bg-[#0A0A0A] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/admin/dashboard" className="text-sm hover:text-[#E31E24] flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" /> Dashboard
            </Link>
            <span className="font-bold">Contact Messages</span>
            {unreadCount > 0 && (
              <span className="bg-[#E31E24] text-white text-xs px-2 py-0.5 rounded-full">
                {unreadCount} unread
              </span>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Search messages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-[#E5E5E5] focus:border-[#E31E24] focus:outline-none"
          />
        </div>

        {/* Messages List */}
        <div className="bg-white">
          {loading ? (
            <div className="p-8 text-center text-[#9CA3AF]">Loading messages...</div>
          ) : filteredMessages.length === 0 ? (
            <div className="p-8 text-center text-[#9CA3AF]">
              <Mail className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No messages found</p>
            </div>
          ) : (
            <div className="divide-y divide-[#E5E5E5]">
              {filteredMessages.map(msg => (
                <div 
                  key={msg._id} 
                  className={`p-4 md:p-6 hover:bg-[#F5F5F5] transition-colors ${msg.status === 'unread' ? 'bg-[#E31E24]/5' : ''}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        {msg.status === 'unread' ? (
                          <span className="w-2 h-2 bg-[#E31E24] rounded-full shrink-0" />
                        ) : (
                          <MailOpen className="w-4 h-4 text-[#9CA3AF] shrink-0" />
                        )}
                        <span className="font-semibold text-[#0A0A0A]">{msg.name}</span>
                        <span className="flex items-center gap-1 text-sm text-[#9CA3AF]">
                          <Phone className="w-3 h-3" /> {msg.phone}
                        </span>
                        {msg.email && (
                          <span className="text-sm text-[#9CA3AF] hidden md:inline">• {msg.email}</span>
                        )}
                      </div>

                      {/* Message */}
                      <p className="text-[#0A0A0A] leading-relaxed mb-2 whitespace-pre-wrap">
                        {msg.message}
                      </p>

                      {/* Footer */}
                      <div className="flex items-center gap-2 text-xs text-[#9CA3AF]">
                        <Clock className="w-3 h-3" />
                        {new Date(msg.submitted_at).toLocaleString('en-KE', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {msg.status === 'unread' && (
                        <button
                          onClick={() => markAsRead(msg._id)}
                          className="p-2 text-[#9CA3AF] hover:text-[#1E8E3E] hover:bg-[#1E8E3E]/10 transition-colors"
                          title="Mark as read"
                        >
                          <MailOpen className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => setDeleteConfirm(msg)}
                        className="p-2 text-[#9CA3AF] hover:text-[#E31E24] hover:bg-[#E31E24]/10 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-white w-full max-w-md p-6">
            <h3 className="font-bold text-lg mb-2">Delete Message?</h3>
            <p className="text-[#9CA3AF] mb-6">
              Delete message from "{deleteConfirm.name}"? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button variant="secondary" fullWidth onClick={() => setDeleteConfirm(null)}>
                Cancel
              </Button>
              <Button 
                fullWidth 
                onClick={() => handleDelete(deleteConfirm._id)} 
                className="bg-[#E31E24] hover:bg-[#c41a1f]"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}