"use client";

import { useEffect, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useDebounce } from 'use-debounce';
import { marked } from 'marked';
import { AlertCircle, CheckCircle2, Loader2, Eye, Pencil, Video } from 'lucide-react';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import TagSelector from '@/components/content/TagSelector';
import CategoryDropdown from '@/components/content/CategoryDropdown';
import SeriesSelector from '@/components/content/SeriesSelector';
import { Post } from '@/types';
import { useCreatePost, useUpdatePost } from '@/hooks/usePosts';
import api from '@/lib/api';
import { toast } from 'sonner';

marked.setOptions({ breaks: true, gfm: true });

const slugify = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

const formSchema = z.object({
  title: z
    .string()
    .min(10, 'Title should be at least 10 characters for better SEO')
    .max(70, 'Title is too long — keep under 70 characters for search results'),
  slug: z
    .string()
    .min(3, 'Slug must be at least 3 characters')
    .regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens allowed'),
  excerpt: z
    .string()
    .min(50, 'Excerpt is too short — aim for 120–160 characters for meta description')
    .max(160, 'Excerpt is too long — Google usually shows ~155–160 characters'),
  content: z.string().min(300, 'Content should be at least 300 characters for SEO value'),
  status: z.enum(['draft', 'published']),
  category_id: z.number().nullable().optional(),
});

type PostFormValues = z.infer<typeof formSchema>;

interface Tag {
  id: number;
  name: string;
  slug: string;
}

interface Series {
  id: number;
  name: string;
  slug: string;
}

interface PostFormProps {
  post?: Post;
  onSuccess?: () => void;
}

// ─── Placeholder components (replace with actual implementations) ────────────

function MediaUploader({ onUploadSuccess }: { onUploadSuccess: (url: string) => void }) {
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);

      const { data } = await api.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      onUploadSuccess(data.url);
      toast.success('Image uploaded successfully');
    } catch (err) {
      console.error('Upload failed:', err);
      toast.error('Failed to upload image');
    }
  };

  return (
    <label className="cursor-pointer">
      <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
      <Button type="button" variant="outline" size="sm" asChild>
        <span>📷 Upload Image</span>
      </Button>
    </label>
  );
}

function MediaGallery({ onSelect }: { onSelect: (url: string) => void }) {
  const [open, setOpen] = useState(false);
  const [media, setMedia] = useState<Array<{ id: number; url: string; name: string }>>([]);
  const [loading, setLoading] = useState(false);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/media');
      setMedia(Array.isArray(data) ? data : data.data ?? []);
    } catch (err) {
      console.error('Failed to fetch media:', err);
      toast.error('Failed to load media gallery');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (url: string) => {
    onSelect(url);
    setOpen(false);
    toast.success('Image inserted');
  };

  useEffect(() => {
    if (open) fetchMedia();
  }, [open]);

  if (!open) {
    return (
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
        🖼️ Media Library
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold">Media Library</h3>
          <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
            ✕
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : media.length === 0 ? (
            <p className="text-center text-gray-500 py-12">No media found. Upload some images first!</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {media.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item.url)}
                  className="group relative aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-blue-500 transition"
                >
                  <img
                    src={item.url}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Form Component ──────────────────────────────────────────────────────

export default function PostForm({ post, onSuccess }: PostFormProps) {
  const createPost = useCreatePost();
  const updatePost = useUpdatePost();

  const [slugManuallyEdited, setSlugManuallyEdited] = useState(!!post?.slug);
  const [categoryId, setCategoryId] = useState<number | null>(post?.category_id || null);
  const [tags, setTags] = useState<Tag[]>(post?.tags || []);
  const [series, setSeries] = useState<Series[]>(post?.series || []);
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [contentMode, setContentMode] = useState<'write' | 'preview'>('write');

  const form = useForm<PostFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: post
      ? {
          title: post.title,
          slug: post.slug,
          content: post.content,
          excerpt: post.excerpt || '',
          status: post.status,
          category_id: post.category_id,
        }
      : {
          title: '',
          slug: '',
          content: '',
          excerpt: '',
          status: 'draft',
          category_id: null,
        },
  });

  const watchedTitle = form.watch('title');
  const watchedSlug = form.watch('slug');
  const watchedContent = form.watch('content');
  const watchedExcerpt = form.watch('excerpt');
  const { isDirty: isSlugDirty } = form.getFieldState('slug');
  const [debouncedSlug] = useDebounce(watchedSlug, 500);

  // Auto-generate slug from title (only if not manually edited)
  useEffect(() => {
    if (!post && watchedTitle && !slugManuallyEdited && !isSlugDirty) {
      form.setValue('slug', slugify(watchedTitle), {
        shouldValidate: true,
        shouldDirty: false,
      });
    }
  }, [watchedTitle, post, slugManuallyEdited, isSlugDirty, form]);

  // Check slug availability
  useEffect(() => {
    const checkSlug = async () => {
      if (!debouncedSlug || debouncedSlug.length < 3) {
        setSlugAvailable(null);
        return;
      }

      setIsCheckingSlug(true);
      try {
        const { data } = await api.get('/posts/check-slug', {
          params: { slug: debouncedSlug, exclude: post?.id },
        });
        setSlugAvailable(data.available);
      } catch {
        setSlugAvailable(false);
      } finally {
        setIsCheckingSlug(false);
      }
    };

    checkSlug();
  }, [debouncedSlug, post?.id]);

  // Markdown preview
  const renderedPreview = useMemo(() => {
    if (!watchedContent) return '';
    return marked.parse(watchedContent) as string;
  }, [watchedContent]);

  const handleInsertImage = (url: string) => {
    const current = form.getValues('content');
    const markdownImage = `\n\n![Image description](${url})\n\n`;
    form.setValue('content', current + markdownImage, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const handleInsertVideo = () => {
    const current = form.getValues('content');
    const template = `\n\n<div class="aspect-video w-full">
  <iframe 
    src="https://www.youtube.com/embed/VIDEO_ID_HERE" 
    title="YouTube video player" 
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
    allowFullScreen
    class="w-full h-full rounded-lg"
  ></iframe>
</div>\n\n`;
    form.setValue('content', current + template, {
      shouldDirty: true,
    });
  };

  const onSubmit = async (values: PostFormValues) => {
    const postData = {
      ...values,
      category_id: categoryId,
      tag_ids: tags.map((t) => t.id),
      series_ids: series.map((s) => s.id),
    };

    if (post) {
      updatePost.mutate(
        { id: post.id, ...postData },
        {
          onSuccess,
          onError: (error: any) => {
            if (error.response?.data?.errors?.slug) {
              form.setError('slug', {
                type: 'manual',
                message: error.response.data.errors.slug[0],
              });
            } else {
              toast.error('Failed to update post');
            }
          },
        }
      );
    } else {
      createPost.mutate(postData, {
        onSuccess,
        onError: (error: any) => {
          if (error.response?.data?.errors?.slug) {
            form.setError('slug', {
              type: 'manual',
              message: error.response.data.errors.slug[0],
            });
          } else {
            toast.error('Failed to create post');
          }
        },
      });
    }
  };

  const titleLength = watchedTitle.length;
  const excerptLength = watchedExcerpt?.length || 0;

  return (
    <Form {...form}>
      <form id="post-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg font-semibold">
                Post Title <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter a compelling, keyword-rich title..."
                  className="text-2xl font-bold h-14 border-2 focus-visible:ring-0 focus-visible:border-primary"
                  {...field}
                />
              </FormControl>
              <FormDescription className="flex items-center gap-2 text-sm">
                {titleLength > 0 && titleLength >= 10 && titleLength <= 70 ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                )}
                {titleLength} / 70 characters — ideal for search results
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Slug */}
        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL Slug</FormLabel>
              <FormControl>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <Input
                    placeholder="my-awesome-post"
                    {...field}
                    onChange={(e) => {
                      field.onChange(slugify(e.target.value));
                      setSlugManuallyEdited(true);
                    }}
                  />
                  {watchedSlug && (
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      Preview: <strong>/content/{watchedSlug}</strong>
                    </span>
                  )}
                </div>
              </FormControl>
              <FormDescription>
                Used in the post URL. Auto-generated from title — edit if needed.
              </FormDescription>
              {watchedSlug && watchedSlug.length >= 3 && (
                <div className="flex items-center gap-2 text-sm mt-1">
                  {isCheckingSlug ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Checking availability...</span>
                    </>
                  ) : slugAvailable === true ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <span className="text-green-600 dark:text-green-400">Slug is available!</span>
                    </>
                  ) : slugAvailable === false ? (
                    <>
                      <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                      <span className="text-red-600 dark:text-red-400">Slug already taken.</span>
                    </>
                  ) : null}
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Category */}
        <FormItem>
          <FormLabel>Category</FormLabel>
          <CategoryDropdown
            value={categoryId}
            onChange={setCategoryId}
            showHierarchy={true}
            showIcons={true}
            showCounts={false}
            allowNull={true}
            placeholder="Select a category..."
          />
          <FormDescription>Choose a category to help organize your content</FormDescription>
        </FormItem>

        {/* Tags */}
        <FormItem>
          <FormLabel>Tags</FormLabel>
          <TagSelector
            selectedTags={tags}
            onChange={setTags}
            maxTags={10}
            placeholder="Add tags (press Enter or comma)..."
          />
          <FormDescription>Add up to 10 relevant tags to improve discoverability</FormDescription>
        </FormItem>

        {/* Series (only shown when editing existing post) */}
        {post?.id && (
          <FormItem>
            <FormLabel>Series</FormLabel>
            <SeriesSelector postId={post.id} currentSeries={series} onChange={setSeries} />
            <FormDescription>Add this post to a series for sequential reading</FormDescription>
          </FormItem>
        )}

        {/* Excerpt */}
        <FormField
          control={form.control}
          name="excerpt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Excerpt / Meta Description{' '}
                <span className="text-amber-600 dark:text-amber-400 text-sm">(important for SEO)</span>
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Write a compelling 120–160 character summary..."
                  className="min-h-100px resize-y"
                  {...field}
                />
              </FormControl>
              <FormDescription className="flex items-center gap-2 text-sm">
                {excerptLength >= 120 && excerptLength <= 160 ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                )}
                {excerptLength} / 160 characters recommended
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Content Editor */}
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <FormLabel className="text-lg font-semibold">Post Content</FormLabel>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Media Uploader */}
                  <MediaUploader onUploadSuccess={handleInsertImage} />

                  {/* Media Gallery */}
                  <MediaGallery onSelect={handleInsertImage} />

                  {/* Quick Video Embed */}
                  <Button type="button" variant="outline" size="sm" onClick={handleInsertVideo}>
                    <Video className="h-4 w-4 mr-1.5" />
                    Add Video
                  </Button>

                  {/* Write / Preview Toggle */}
                  <div className="flex rounded-md border border-input overflow-hidden">
                    <Button
                      type="button"
                      variant={contentMode === 'write' ? 'default' : 'ghost'}
                      size="sm"
                      className="rounded-none"
                      onClick={() => setContentMode('write')}
                    >
                      <Pencil className="h-4 w-4 mr-1.5" />
                      Write
                    </Button>
                    <Button
                      type="button"
                      variant={contentMode === 'preview' ? 'default' : 'ghost'}
                      size="sm"
                      className="rounded-none"
                      onClick={() => setContentMode('preview')}
                    >
                      <Eye className="h-4 w-4 mr-1.5" />
                      Preview
                    </Button>
                  </div>
                </div>
              </div>

              {contentMode === 'write' ? (
                <FormControl>
                  <Textarea
                    placeholder="Start writing in Markdown... **bold**, # Heading, - bullet, > quote, `code`"
                    className="min-h-500px md:min-h-600px font-mono text-base leading-relaxed resize-y"
                    {...field}
                  />
                </FormControl>
              ) : (
                <div className="min-h-500px md:min-h-600px border border-input rounded-md p-6 bg-card overflow-auto prose prose-lg dark:prose-invert max-w-none">
                  {renderedPreview ? (
                    <div
                      className="prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-a:text-primary hover:prose-a:underline prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground prose-code:bg-muted prose-code:text-foreground prose-pre:bg-muted/80 prose-pre:text-foreground prose-pre:rounded prose-pre:p-4 prose-pre:shadow-sm"
                      dangerouslySetInnerHTML={{ __html: renderedPreview }}
                    />
                  ) : (
                    <p className="text-muted-foreground italic text-center mt-20">
                      Nothing to preview yet — start writing!
                    </p>
                  )}
                </div>
              )}

              <FormDescription className="text-sm text-muted-foreground">
                Supports Markdown formatting: **bold**, *italic*, # Heading, - lists, &gt; quotes, `code blocks`
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Status */}
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full sm:w-72">
                    <SelectValue placeholder="Choose post status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="draft">Draft (not visible to public)</SelectItem>
                  <SelectItem value="published">Published (live & indexed)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit Actions */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-border">
          <Button
            type="submit"
            disabled={createPost.isPending || updatePost.isPending}
            className="flex-1 sm:flex-initial min-w-180px"
          >
            {createPost.isPending || updatePost.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : post ? (
              'Update Post'
            ) : (
              'Create & Publish'
            )}
          </Button>

          {post && (
            <Button type="button" variant="outline" onClick={onSuccess} className="flex-1 sm:flex-initial">
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}