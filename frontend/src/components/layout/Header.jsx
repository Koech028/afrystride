import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Search, ShoppingBag } from 'lucide-react';
import { categoryApi } from '../../services/api';

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await categoryApi.list();
        const sorted = data.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
        setCategories(sorted);
      } catch (err) {
        console.error('Failed to load categories:', err);
      } finally {
        setCategoriesLoading(false);
      }
    };
    loadCategories();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShopOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-focus search input when overlay opens
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current.focus(), 100);
    }
  }, [searchOpen]);

  // Close search overlay on route change
  useEffect(() => {
    setSearchOpen(false);
    setSearchQuery('');
  }, [location.pathname, location.search]);

  const isActive = (href) => location.pathname === href || location.pathname.startsWith(href);

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;
    
    // Navigate to shop with search param, preserving any existing category if needed
    // But for a global search, we usually want just the search term
    navigate(`/shop?search=${encodeURIComponent(query)}`);
    setSearchOpen(false);
    setSearchQuery('');
    setMobileOpen(false);
  };

  return (
    <>
      <header className="bg-[#0A0A0A] text-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <img 
                src="/logo.svg" 
                alt="AfryStride" 
                className="h-8 md:h-10 w-auto"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/logo.png';
                }} 
              />
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              <Link 
                to="/"
                className={`text-sm font-medium tracking-wide uppercase hover:text-[#E31E24] transition-colors ${isActive('/') ? 'text-[#E31E24]' : ''}`}
              >
                Home
              </Link>

              {/* Shop Dropdown */}
              <div 
                className="relative" 
                ref={dropdownRef}
                onMouseEnter={() => setShopOpen(true)}
              >
                <button 
                  className={`flex items-center gap-1 text-sm font-medium tracking-wide uppercase hover:text-[#E31E24] transition-colors ${isActive('/shop') ? 'text-[#E31E24]' : ''}`}
                >
                  Shop
                  <svg 
                    className={`w-4 h-4 transition-transform duration-200 ${shopOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {shopOpen && (
                  <div 
                    className="absolute top-full left-0 mt-2 w-64 bg-[#0A0A0A] border border-white/10 shadow-xl overflow-hidden"
                    onMouseLeave={() => setShopOpen(false)}
                  >
                    <Link
                      to="/shop"
                      className="block px-4 py-3 text-sm font-semibold hover:bg-[#E31E24] transition-colors border-b border-white/10"
                      onClick={() => setShopOpen(false)}
                    >
                      All Products
                    </Link>
                    {categoriesLoading ? (
                      <div className="px-4 py-3 text-sm text-[#9CA3AF]">Loading...</div>
                    ) : categories.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-[#9CA3AF]">No categories</div>
                    ) : (
                      categories.map(cat => (
                        <Link
                          key={cat._id}
                          to={`/shop?category=${cat.slug}`}
                          className="block px-4 py-3 text-sm hover:bg-white/5 hover:text-[#E31E24] transition-colors"
                          onClick={() => setShopOpen(false)}
                        >
                          {cat.name}
                        </Link>
                      ))
                    )}
                  </div>
                )}
              </div>

              {navLinks.slice(1).map(link => (
                <Link 
                  key={link.href}
                  to={link.href}
                  className={`text-sm font-medium tracking-wide uppercase hover:text-[#E31E24] transition-colors ${isActive(link.href) ? 'text-[#E31E24]' : ''}`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <button 
                className="p-2 hover:text-[#E31E24] transition-colors"
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>
              <Link to="/shop" className="p-2 hover:text-[#E31E24] transition-colors relative">
                <ShoppingBag className="w-5 h-5" />
              </Link>
              <button 
                className="md:hidden p-2"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden bg-[#0A0A0A] border-t border-white/10">
            <div className="px-4 py-4 space-y-1">
              <Link
                to="/"
                className={`block px-3 py-2 text-sm font-medium uppercase tracking-wide ${isActive('/') ? 'text-[#E31E24]' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                Home
              </Link>
              
              <div className="space-y-1">
                <p className="px-3 py-2 text-sm font-bold uppercase tracking-wider text-[#9CA3AF]">Shop</p>
                <Link
                  to="/shop"
                  className="block px-6 py-2 text-sm hover:text-[#E31E24]"
                  onClick={() => setMobileOpen(false)}
                >
                  All Products
                </Link>
                {categories.map(cat => (
                  <Link
                    key={cat._id}
                    to={`/shop?category=${cat.slug}`}
                    className="block px-6 py-2 text-sm hover:text-[#E31E24]"
                    onClick={() => setMobileOpen(false)}
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>

              {navLinks.slice(1).map(link => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`block px-3 py-2 text-sm font-medium uppercase tracking-wide ${isActive(link.href) ? 'text-[#E31E24]' : ''}`}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Search Overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center pt-24 md:pt-32 px-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSearchOpen(false)}
          />
          
          {/* Search Panel */}
          <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-2xl overflow-hidden">
            <form onSubmit={handleSearchSubmit} className="flex items-center">
              <div className="pl-4 text-[#9CA3AF]">
                <Search className="w-5 h-5" />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search for jerseys, boots, tracksuits..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-4 text-[#0A0A0A] placeholder-[#9CA3AF] outline-none text-base md:text-lg"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    searchInputRef.current?.focus();
                  }}
                  className="p-2 text-[#9CA3AF] hover:text-[#0A0A0A] mr-2"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="submit"
                className="bg-[#E31E24] text-white px-6 py-4 font-medium text-sm uppercase tracking-wide hover:bg-[#c41a1f] transition-colors"
              >
                Search
              </button>
            </form>
            
            {/* Quick suggestions */}
            <div className="border-t border-gray-100 px-4 py-3 bg-gray-50">
              <p className="text-xs text-[#9CA3AF] uppercase tracking-wider font-semibold mb-2">Popular Searches</p>
              <div className="flex flex-wrap gap-2">
                {['Jerseys', 'Football Boots', 'Tracksuits', 'Gym Wear'].map(term => (
                  <button
                    key={term}
                    onClick={() => {
                      navigate(`/shop?search=${encodeURIComponent(term)}`);
                      setSearchOpen(false);
                      setSearchQuery('');
                      setMobileOpen(false);
                    }}
                    className="px-3 py-1.5 bg-white border border-gray-200 rounded text-sm text-[#0A0A0A] hover:border-[#E31E24] hover:text-[#E31E24] transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Close button (top right) */}
          <button
            onClick={() => setSearchOpen(false)}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2"
            aria-label="Close search"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      )}
    </>
  );
}