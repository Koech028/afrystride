import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Search, X, AlertTriangle, Upload } from 'lucide-react';
import { categoryApi, uploadApi } from '../../services/api';
import Button from '../../components/ui/Button';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    display_order: 0,
    parent_category: '',
    image: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await categoryApi.list();
      setCategories(data);
    } catch (err) {
      if (err.status === 401) navigate('/admin/login');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', slug: '', display_order: 0, parent_category: '', image: '' });
    setEditingCategory(null);
  };

  const openAdd = () => {
    resetForm();
    setShowModal(true);
  };

  const openEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      display_order: category.display_order || 0,
      parent_category: category.parent_category || '',
      image: category.image || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      display_order: parseInt(formData.display_order) || 0,
      parent_category: formData.parent_category || null,
    };

    try {
      if (editingCategory) {
        await categoryApi.update(editingCategory._id, payload);
      } else {
        await categoryApi.create(payload);
      }
      setShowModal(false);
      resetForm();
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to save category');
    }
  };

  const handleDelete = async (id) => {
    try {
      await categoryApi.delete(id);
      setDeleteConfirm(null);
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to delete category');
    }
  };

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Header */}
      <header className="bg-[#0A0A0A] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/admin/dashboard" className="text-sm hover:text-[#E31E24]">← Dashboard</Link>
            <span className="font-bold">Categories</span>
          </div>
          <Button size="sm" onClick={openAdd}>
            <Plus className="w-4 h-4 mr-1" /> Add Category
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-[#E5E5E5] focus:border-[#E31E24] focus:outline-none"
          />
        </div>

        {/* Categories Table */}
        <div className="bg-white overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#0A0A0A] text-white text-left">
              <tr>
                <th className="px-4 py-3 text-sm font-medium">Category</th>
                <th className="px-4 py-3 text-sm font-medium">Slug</th>
                <th className="px-4 py-3 text-sm font-medium">Display Order</th>
                <th className="px-4 py-3 text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5]">
              {loading ? (
                <tr><td colSpan={4} className="p-8 text-center text-[#9CA3AF]">Loading...</td></tr>
              ) : filteredCategories.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-[#9CA3AF]">No categories found</td></tr>
              ) : (
                filteredCategories.map(category => (
                  <tr key={category._id} className="hover:bg-[#F5F5F5] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {category.image ? (
                          <img src={category.image} alt="" className="w-10 h-10 object-cover bg-[#F5F5F5]" />
                        ) : (
                          <div className="w-10 h-10 bg-[#E5E5E5] flex items-center justify-center text-[#9CA3AF] text-xs">No Img</div>
                        )}
                        <div>
                          <p className="font-medium text-sm">{category.name}</p>
                          {category.parent_category && (
                            <p className="text-xs text-[#9CA3AF]">Parent: {category.parent_category}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#9CA3AF]">{category.slug}</td>
                    <td className="px-4 py-3 text-sm">{category.display_order}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(category)}
                          className="p-1.5 hover:bg-[#E31E24]/10 hover:text-[#E31E24] transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(category)}
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
          <div className="relative bg-white w-full max-w-lg">
            <div className="sticky top-0 bg-white border-b border-[#E5E5E5] p-4 flex items-center justify-between">
              <h2 className="font-bold text-lg">{editingCategory ? 'Edit Category' : 'Add Category'}</h2>
              <button onClick={() => setShowModal(false)}><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') })}
                  className="w-full px-3 py-2 border border-[#9CA3AF] focus:border-[#E31E24] focus:outline-none"
                  placeholder="e.g. Football Boots"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Slug *</label>
                <input
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-3 py-2 border border-[#9CA3AF] focus:border-[#E31E24] focus:outline-none bg-[#F5F5F5]"
                  placeholder="football-boots"
                />
                <p className="text-xs text-[#9CA3AF] mt-1">URL-friendly identifier (auto-generated from name)</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Display Order</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: e.target.value })}
                    className="w-full px-3 py-2 border border-[#9CA3AF] focus:border-[#E31E24] focus:outline-none"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Parent Category</label>
                  <select
                    value={formData.parent_category}
                    onChange={(e) => setFormData({ ...formData, parent_category: e.target.value })}
                    className="w-full px-3 py-2 border border-[#9CA3AF] focus:border-[#E31E24] focus:outline-none bg-white"
                  >
                    <option value="">None (Top Level)</option>
                    {categories
                      .filter(c => c._id !== editingCategory?._id)
                      .map(cat => (
                        <option key={cat._id} value={cat.slug}>{cat.name}</option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Category Image</label>
                {formData.image && (
                  <div className="relative w-20 h-20 mb-2">
                    <img src={formData.image} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, image: '' })}
                      className="absolute -top-2 -right-2 bg-[#E31E24] text-white p-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                <label className="flex items-center gap-2 px-4 py-2 border border-[#9CA3AF] hover:border-[#E31E24] cursor-pointer transition-colors w-fit">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      if (!e.target.files?.[0]) return;
                      try {
                        const result = await uploadApi.uploadImage(e.target.files[0]);
                        setFormData({ ...formData, image: result.url });
                      } catch (err) {
                        alert(err.message);
                      }
                    }}
                    className="hidden"
                  />
                  <Upload className="w-4 h-4" />
                  <span className="text-sm">Upload Image</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" fullWidth>
                  {editingCategory ? 'Update Category' : 'Create Category'}
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
            <h3 className="font-bold text-lg mb-2">Delete Category?</h3>
            <p className="text-[#9CA3AF] mb-6">
              Are you sure you want to delete "{deleteConfirm.name}"? Products in this category will lose their category assignment.
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