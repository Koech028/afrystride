import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Search, X, ImagePlus, AlertTriangle, Upload, ImageIcon } from 'lucide-react';
import { productApi, categoryApi, uploadApi } from '../../services/api';
import Button from '../../components/ui/Button';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const navigate = useNavigate();
  const [uploadingImages, setUploadingImages] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    category: '',
    price: '',
    sizes: '',
    colours: '',
    stock_status: 'in_stock',
    description: '',
    badge: '',
    tags: '',
    images: [],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [productsData, catsData] = await Promise.all([
        productApi.list({ limit: 100 }),
        categoryApi.list(),
      ]);
      setProducts(productsData.items);
      setCategories(catsData);
    } catch (err) {
      if (err.status === 401) navigate('/admin/login');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '', slug: '', category: '', price: '', sizes: '', colours: '',
      stock_status: 'in_stock', description: '', badge: '', tags: '', images: [],
    });
    setEditingProduct(null);
  };

  const openAdd = () => {
    resetForm();
    setShowModal(true);
  };

  const openEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      slug: product.slug,
      category: product.category,
      price: product.price,
      sizes: product.sizes?.join(', ') || '',
      colours: product.colours?.join(', ') || '',
      stock_status: product.stock_status,
      description: product.description || '',
      badge: product.badge || '',
      tags: product.tags?.join(', ') || '',
      images: product.images || [],
    });
    setShowModal(true);
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setUploadingImages(true);
    const uploadedUrls = [];

    try {
      for (const file of files) {
        const result = await uploadApi.uploadImage(file);
        uploadedUrls.push(result.url);
      }
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls]
      }));
    } catch (err) {
      alert(err.message || 'Failed to upload image(s)');
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      sizes: formData.sizes.split(',').map(s => s.trim()).filter(Boolean),
      colours: formData.colours.split(',').map(c => c.trim()).filter(Boolean),
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
    };

    try {
      if (editingProduct) {
        await productApi.update(editingProduct._id, payload);
      } else {
        await productApi.create(payload);
      }
      setShowModal(false);
      resetForm();
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to save product');
    }
  };

  const handleDelete = async (id) => {
    try {
      await productApi.delete(id);
      setDeleteConfirm(null);
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to delete product');
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Header */}
      <header className="bg-[#0A0A0A] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/admin/dashboard" className="text-sm hover:text-[#E31E24]">← Dashboard</Link>
            <span className="font-bold">Products</span>
          </div>
          <Button size="sm" onClick={openAdd}>
            <Plus className="w-4 h-4 mr-1" /> Add Product
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-[#E5E5E5] focus:border-[#E31E24] focus:outline-none"
          />
        </div>

        {/* Products Table */}
        <div className="bg-white overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#0A0A0A] text-white text-left">
              <tr>
                <th className="px-4 py-3 text-sm font-medium">Product</th>
                <th className="px-4 py-3 text-sm font-medium">Category</th>
                <th className="px-4 py-3 text-sm font-medium">Price</th>
                <th className="px-4 py-3 text-sm font-medium">Stock</th>
                <th className="px-4 py-3 text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5]">
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-[#9CA3AF]">Loading...</td></tr>
              ) : filteredProducts.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-[#9CA3AF]">No products found</td></tr>
              ) : (
                filteredProducts.map(product => (
                  <tr key={product._id} className="hover:bg-[#F5F5F5] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.images?.[0] || '/placeholder-product.jpg'}
                          alt=""
                          className="w-12 h-12 object-cover bg-[#F5F5F5]"
                        />
                        <div>
                          <p className="font-medium text-sm">{product.name}</p>
                          <p className="text-xs text-[#9CA3AF]">{product.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">{product.category}</td>
                    <td className="px-4 py-3 text-sm font-medium">KES {product.price?.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 text-xs font-medium ${
                        product.stock_status === 'in_stock'
                          ? 'bg-[#1E8E3E]/10 text-[#1E8E3E]'
                          : 'bg-[#E31E24]/10 text-[#E31E24]'
                      }`}>
                        {product.stock_status === 'in_stock' ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(product)}
                          className="p-1.5 hover:bg-[#E31E24]/10 hover:text-[#E31E24] transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(product)}
                          className="p-1.5 hover:bg-[#E31E24]/10 hover:text-[#E31E24] transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-[#E5E5E5] p-4 flex items-center justify-between">
              <h2 className="font-bold text-lg">{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
              <button onClick={() => setShowModal(false)}><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name *</label>
                  <input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                    className="w-full px-3 py-2 border border-[#9CA3AF] focus:border-[#E31E24] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Slug *</label>
                  <input
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-3 py-2 border border-[#9CA3AF] focus:border-[#E31E24] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Category *</label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-[#9CA3AF] focus:border-[#E31E24] focus:outline-none bg-white"
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat.slug}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Price (KES) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 border border-[#9CA3AF] focus:border-[#E31E24] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Sizes (comma-separated)</label>
                  <input
                    value={formData.sizes}
                    onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
                    placeholder="S, M, L, XL or 38, 39, 40, 41"
                    className="w-full px-3 py-2 border border-[#9CA3AF] focus:border-[#E31E24] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Colours (comma-separated)</label>
                  <input
                    value={formData.colours}
                    onChange={(e) => setFormData({ ...formData, colours: e.target.value })}
                    placeholder="Red, Black, White"
                    className="w-full px-3 py-2 border border-[#9CA3AF] focus:border-[#E31E24] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Stock Status</label>
                  <select
                    value={formData.stock_status}
                    onChange={(e) => setFormData({ ...formData, stock_status: e.target.value })}
                    className="w-full px-3 py-2 border border-[#9CA3AF] focus:border-[#E31E24] focus:outline-none bg-white"
                  >
                    <option value="in_stock">In Stock</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Badge</label>
                  <select
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    className="w-full px-3 py-2 border border-[#9CA3AF] focus:border-[#E31E24] focus:outline-none bg-white"
                  >
                    <option value="">None</option>
                    <option value="New">New</option>
                    <option value="Best Seller">Best Seller</option>
                    <option value="School Uniform">School Uniform</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tags (comma-separated)</label>
                <input
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="featured, new, sale"
                  className="w-full px-3 py-2 border border-[#9CA3AF] focus:border-[#E31E24] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Product Images</label>

                {/* Image Preview Grid */}
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {formData.images.map((url, idx) => (
                      <div key={idx} className="relative aspect-square bg-[#F5F5F5]">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 right-1 bg-[#E31E24] text-white p-1 hover:bg-[#c41a1f]"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Button */}
                <label className="flex items-center justify-center gap-2 w-full py-8 border-2 border-dashed border-[#9CA3AF] hover:border-[#E31E24] cursor-pointer transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploadingImages}
                  />
                  {uploadingImages ? (
                    <span className="text-sm text-[#9CA3AF]">Uploading...</span>
                  ) : (
                    <>
                      <ImageIcon className="w-5 h-5 text-[#9CA3AF]" />
                      <span className="text-sm text-[#9CA3AF]">Click to upload images</span>
                    </>
                  )}
                </label>
                <p className="text-xs text-[#9CA3AF] mt-1">Max 5MB per image. JPG, PNG, WebP supported.</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-[#9CA3AF] focus:border-[#E31E24] focus:outline-none resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" fullWidth>
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </Button>
                <Button variant="secondary" type="button" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-white w-full max-w-md p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-[#E31E24] mx-auto mb-4" />
            <h3 className="font-bold text-lg mb-2">Delete Product?</h3>
            <p className="text-[#9CA3AF] mb-6">
              Are you sure you want to delete "{deleteConfirm.name}"? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button variant="secondary" fullWidth onClick={() => setDeleteConfirm(null)}>Cancel</Button>
              <Button fullWidth onClick={() => handleDelete(deleteConfirm._id)} className="bg-[#E31E24] hover:bg-[#c41a1f]">
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}