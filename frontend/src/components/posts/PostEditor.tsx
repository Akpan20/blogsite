import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { posts } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface PostEditorProps {
  initialData?: {
    id?: string;
    title?: string;
    content?: string;
    published?: boolean;
    premium?: boolean;
    categories?: string[];
    tags?: string[];
  };
  isEdit?: boolean;
}

export const PostEditor: React.FC<PostEditorProps> = ({ initialData, isEdit }) => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    content: initialData?.content || '',
    published: initialData?.published || false,
    premium: initialData?.premium || false,
    categories: initialData?.categories?.join(', ') || '',
    tags: initialData?.tags?.join(', ') || ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleToggle = (name: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: !prev[name as keyof typeof prev]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const postData = {
        ...formData,
        categories: formData.categories.split(',').map(c => c.trim()),
        tags: formData.tags.split(',').map(t => t.trim())
      };

      if (isEdit && initialData?.id) {
        await posts.update(initialData.id, postData);
      } else {
        await posts.create(postData);
      }

      router.push('/dashboard/posts');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{isEdit ? 'Edit Post' : 'Create New Post'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Input
              name="title"
              placeholder="Post Title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Textarea
              name="content"
              placeholder="Write your post content..."
              value={formData.content}
              onChange={handleChange}
              required
              className="min-h-[300px]"
            />
          </div>

          <div className="space-y-2">
            <Input
              name="categories"
              placeholder="Categories (comma-separated)"
              value={formData.categories}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Input
              name="tags"
              placeholder="Tags (comma-separated)"
              value={formData.tags}
              onChange={handleChange}
            />
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.published}
                onCheckedChange={() => handleToggle('published')}
              />
              <span>Published</span>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.premium}
                onCheckedChange={() => handleToggle('premium')}
              />
              <span>Premium Content</span>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? 'Saving...' : isEdit ? 'Update Post' : 'Create Post'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};