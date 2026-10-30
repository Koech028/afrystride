import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import { productApi, categoryApi } from '../services/api';
import ProductGrid from '../components/product/ProductGrid';
import Button from '../components/ui/Button';
import SEO from '../components/seo/SEO';

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    size: '',
    min_price: '',
    max_price: '',
    in_stock: '',
    tag: '',
    search: searchParams.get('search') || '',
    sort_by: 'created_at',
    sort_order: 'desc',
  });

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters, page: pagination.page, limit: 20 };
      // Remove empty values
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });
      
      const data = await productApi.list(params);
      setProducts(data.items);
      setPagination({ page: data.page, pages: data.pages, total: data.total });
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await categoryApi.list();
        setCategories(cats);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Sync URL params -> state whenever the URL changes
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      category: searchParams.get('category') || '',
      search: searchParams.get('search') || '',
    }));
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [searchParams]);

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
    
    // Sync category filters cleanly to URL queries for indexable deep links
    if (key === 'category') {
      if (value) setSearchParams({ category: value });
      else setSearchParams({});
    }
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      size: '',
      min_price: '',
      max_price: '',
      in_stock: '',
      tag: '',
      search: '',
      sort_by: 'created_at',
      sort_order: 'desc',
    });
    setSearchParams({});
  };

  const allSizes = ['S', 'M', 'L', 'XL', 'XXL', '38', '39', '40', '41', '42', '43', '44', '45', '46'];

  // 1. Dynamic Localized SEO Strings based on active category filters
  const getActiveCategoryName = () => {
    const activeCat = categories.find(c => c.slug === filters.category);
    return activeCat ? activeCat.name : '';
  };

  const currentCategory = getActiveCategoryName();
  
  const seoTitle = currentCategory 
    ? `Buy ${currentCategory} Online in Kenya | AfryStride`
    : "Shop Premium Sportswear Online Kenya | AfryStride Store";

  const seoDescription = currentCategory
    ? `Browse our wide collection of original ${currentCategory.toLowerCase()} at AfryStride Kenya. Find best prices on quality athletic gear. Fast delivery in Nairobi & countrywide.`
    : "Browse our full collection of premium sportswear at AfryStride. Buy football boots, original jerseys, tracksuits, school sportswear, and training kits with fast delivery across Kenya.";

  const seoKeywords = currentCategory
    ? `${currentCategory.toLowerCase()} price kenya, buy ${currentCategory.toLowerCase()} nairobi, original ${currentCategory.toLowerCase()} shop, sportswear kenya, afrystride`
    : "sportswear kenya, sports shop in nairobi cbd, football boots nairobi, original jerseys kenya, school sportswear supplier, tracksuits nairobi, gym wear online kenya, afrystride";

  // Reusable filter content for both desktop sidebar and mobile drawer
  const FilterContent = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-bold uppercase tracking-wider text-sm">Filters</h3>
        <button onClick={clearFilters} className="text-xs text-[#E31E24] hover:underline">Clear All</button>
      </div>

      {/* Category */}
      <div>
        <h4 className="font-semibold text-sm mb-3">Category</h4>
        <div className="space-y-2">
          {categories.map(cat => (
            <label key={cat._id || cat.id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="category"
                checked={filters.category === cat.slug}
                onChange={() => updateFilter('category', cat.slug)}
                className="accent-[#E31E24]"
              />
              <span className="text-sm text-[#0A0A0A]">{cat.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price */}
      <div>
        <h4 className="font-semibold text-sm mb-3">Price Range (KES)</h4>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.min_price}
            onChange={(e) => updateFilter('min_price', e.target.value)}
            className="w-full px-3 py-2 border border-[#9CA3AF] text-sm"
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.max_price}
            onChange={(e) => updateFilter('max_price', e.target.value)}
            className="w-full px-3 py-2 border border-[#9CA3AF] text-sm"
          />
        </div>
      </div>

      {/* Size */}
      <div>
        <h4 className="font-semibold text-sm mb-3">Size</h4>
        <div className="flex flex-wrap gap-2">
          {allSizes.map(size => (
            <button
              key={size}
              onClick={() => updateFilter('size', filters.size === size ? '' : size)}
              className={`px-3 py-1 text-xs font-medium border transition-colors ${
                filters.size === size 
                  ? 'bg-[#E31E24] text-white border-[#E31E24]' 
                  : 'border-[#9CA3AF] text-[#0A0A0A] hover:border-[#E31E24]'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Stock */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.in_stock === 'true'}
            onChange={(e) => updateFilter('in_stock', e.target.checked ? 'true' : '')}
            className="accent-[#E31E24]"
          />
          <span className="text-sm text-[#0A0A0A]">In Stock Only</span>
        </label>
      </div>
    </div>
  );

  return (
    <div>
      <SEO
        title={seoTitle}
        description={seoDescription}
        keywords={seoKeywords}
        url={filters.category ? `https://afrystride.com/${filters.category}` : "https://afrystride.com"}
      />
      
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-[#0A0A0A]">
                {currentCategory ? `${currentCategory}` : "Shop All Sports Gear"}
              </h1>
              <p className="text-[#9CA3AF] mt-1">{pagination.total} products available</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                className="md:hidden flex items-center gap-2 px-4 py-2 border border-[#0A0A0A] text-sm font-medium"
                onClick={() => setFiltersOpen(true)}
              >
                <SlidersHorizontal className="w-4 h-4" /> Filters
              </button>
              
              <select
                value={`${filters.sort_by}-${filters.sort_order}`}
                onChange={(e) => {
                  const [sort_by, sort_order] = e.target.value.split('-');
                  updateFilter('sort_by', sort_by);
                  updateFilter('sort_order', sort_order);
                }}
                className="px-4 py-2 border border-[#9CA3AF] text-sm bg-white"
              >
                <option value="created_at-desc">Newest First</option>
                <option value="created_at-asc">Oldest First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Name: A-Z</option>
              </select>
            </div>
          </div>

          <div className="flex gap-8">
            {/* Sidebar Filters - Desktop */}
            <aside className="hidden md:block w-64 shrink-0">
              <div className="sticky top-24">
                <FilterContent />
              </div>
            </aside>

            {/* Product Grid Area */}
            <main className="flex-1">
              <ProductGrid products={products} loading={loading} />
              
              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  <button
                    disabled={pagination.page <= 1}
                    onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                    className="px-4 py-2 border border-[#0A0A0A] disabled:opacity-30 text-sm font-medium"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 text-sm">
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  <button
                    disabled={pagination.page >= pagination.pages}
                    onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                    className="px-4 py-2 border border-[#0A0A0A] disabled:opacity-30 text-sm font-medium"
                  >
                    Next
                  </button>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {filtersOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setFiltersOpen(false)}
          />
          {/* Drawer Panel */}
          <div className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-white z-50 md:hidden overflow-y-auto p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-lg">Filters</h2>
              <button 
                onClick={() => setFiltersOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <FilterContent />
          </div>
        </>
      )}
    </div>
  );
}