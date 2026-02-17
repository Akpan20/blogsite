import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  color: string;
  icon?: string;
  parent_id?: number;
  order: number;
  is_featured: boolean;
  posts_count: number;
  children?: Category[];
}

export default function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
    icon: '',
    parent_id: null as number | null,
    is_featured: false,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/categories', {
        params: { with_children: true, with_posts_count: true }
      });
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingCategory) {
        await axios.put(`/api/categories/${editingCategory.id}`, formData);
      } else {
        await axios.post('/api/categories', formData);
      }

      fetchCategories();
      closeModal();
    } catch (error: any) {
      console.error('Failed to save category:', error);
      alert(error.response?.data?.message || 'Failed to save category');
    }
  };

  const handleDelete = async (category: Category) => {
    if (!confirm(`Delete "${category.name}"? This cannot be undone.`)) return;

    try {
      await axios.delete(`/api/categories/${category.id}`);
      fetchCategories();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete category');
    }
  };

  const openModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description || '',
        color: category.color,
        icon: category.icon || '',
        parent_id: category.parent_id || null,
        is_featured: category.is_featured,
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        description: '',
        color: '#3B82F6',
        icon: '',
        parent_id: null,
        is_featured: false,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const renderCategory = (category: Category, level = 0) => (
    <React.Fragment key={category.id}>
      <tr className="hover:bg-gray-50">
        <td className="px-6 py-4" style={{ paddingLeft: `${24 + level * 32}px` }}>
          <div className="flex items-center gap-2">
            {category.icon && <span>{category.icon}</span>}
            <span className="font-medium text-gray-900">{category.name}</span>
            <span
              className="inline-block w-4 h-4 rounded"
              style={{ backgroundColor: category.color }}
            />
          </div>
        </td>
        <td className="px-6 py-4 text-sm text-gray-500">{category.slug}</td>
        <td className="px-6 py-4 text-sm text-gray-500">{category.posts_count}</td>
        <td className="px-6 py-4 text-sm">
          {category.is_featured && (
            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
              Featured
            </span>
          )}
        </td>
        <td className="px-6 py-4 text-right">
          <button
            onClick={() => openModal(category)}
            className="text-blue-600 hover:text-blue-800 mr-3"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(category)}
            className="text-red-600 hover:text-red-800"
          >
            Delete
          </button>
        </td>
      </tr>
      {category.children?.map(child => renderCategory(child, level + 1))}
    </React.Fragment>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <button
          onClick={() => openModal()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Add Category
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Slug
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Posts
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categories.map(category => renderCategory(category))}
          </tbody>
        </table>

        {categories.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No categories yet. Create your first one!
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingCategory ? 'Edit Category' : 'Add Category'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Color
                  </label>
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full h-10 rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Icon (emoji)
                  </label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="📚"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Parent Category
                </label>
                <select
                  value={formData.parent_id || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    parent_id: e.target.value ? parseInt(e.target.value) : null 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">None (Root Category)</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id} disabled={cat.id === editingCategory?.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_featured"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="is_featured" className="text-sm font-medium text-gray-700">
                  Featured Category
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingCategory ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}