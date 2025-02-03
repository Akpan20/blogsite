import { useState } from 'react';
import { Card } from '@/components/ui/card';

export default function SeoEditor({ initialData, onSave }) {
  const [seoData, setSeoData] = useState(initialData);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave(seoData);
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">SEO Settings</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">SEO Title</label>
          <input
            type="text"
            value={seoData.title}
            onChange={(e) => setSeoData({ ...seoData, title: e.target.value })}
            className="w-full p-2 border rounded"
            maxLength={60}
          />
          <p className="text-sm text-gray-500 mt-1">
            {seoData.title.length}/60 characters
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Meta Description
          </label>
          <textarea
            value={seoData.description}
            onChange={(e) =>
              setSeoData({ ...seoData, description: e.target.value })
            }
            className="w-full p-2 border rounded"
            maxLength={160}
            rows={3}
          />
          <p className="text-sm text-gray-500 mt-1">
            {seoData.description.length}/160 characters
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Keywords (comma-separated)
          </label>
          <input
            type="text"
            value={seoData.keywords}
            onChange={(e) => setSeoData({ ...seoData, keywords: e.target.value })}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Canonical URL (optional)
          </label>
          <input
            type="url"
            value={seoData.canonical}
            onChange={(e) =>
              setSeoData({ ...seoData, canonical: e.target.value })
            }
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Open Graph Image URL
          </label>
          <input
            type="url"
            value={seoData.ogImage}
            onChange={(e) => setSeoData({ ...seoData, ogImage: e.target.value })}
            className="w-full p-2 border rounded"
          />
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Save SEO Settings
        </button>
      </form>
    </Card>
  );
}