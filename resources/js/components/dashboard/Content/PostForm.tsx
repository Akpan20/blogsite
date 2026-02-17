"use client";

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useDebounce } from 'use-debounce';
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
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import TagSelector from '@/components/content/TagSelector';
import CategoryDropdown from '@/components/content/CategoryDropdown';
import SeriesSelector from '@/components/content/SeriesSelector';
import { Post } from '@/types';
import { useCreatePost, useUpdatePost } from '@/hooks/usePosts';
import api from '@/lib/api'; // adjust import path as needed

// Slugify helper
const slugify = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

// Enhanced schema with better messages
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

export default function PostForm({ post, onSuccess }: PostFormProps) {
  const createPost = useCreatePost();
  const updatePost = useUpdatePost();

  const [slugManuallyEdited, setSlugManuallyEdited] = useState(!!post?.slug);
  const [categoryId, setCategoryId] = useState<number | null>(post?.category_id || null);
  const [tags, setTags] = useState<Tag[]>(post?.tags || []);
  const [series, setSeries] = useState<Series[]>(post?.series || []);

  // Real‑time slug availability
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);

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
  const { isDirty: isSlugDirty } = form.getFieldState('slug');
  const [debouncedSlug] = useDebounce(watchedSlug, 500);

  // Auto-generate slug only if not manually edited
  useEffect(() => {
    if (!post && watchedTitle && !slugManuallyEdited && !isSlugDirty) {
      form.setValue('slug', slugify(watchedTitle), {
        shouldValidate: true,
        shouldDirty: false,
      });
    }
  }, [watchedTitle, post, slugManuallyEdited, isSlugDirty, form]);

  // Check slug availability when debounced slug changes
  useEffect(() => {
    const checkSlug = async () => {
      if (!debouncedSlug || debouncedSlug.length < 3) {
        setSlugAvailable(null);
        return;
      }

      setIsCheckingSlug(true);
      try {
        // Adjust endpoint as needed – here we pass ?slug=...&exclude=postId
        const { data } = await api.get('/posts/check-slug', {
          params: {
            slug: debouncedSlug,
            exclude: post?.id, // exclude current post when editing
          },
        });
        setSlugAvailable(data.available);
      } catch (error) {
        setSlugAvailable(false);
      } finally {
        setIsCheckingSlug(false);
      }
    };

    checkSlug();
  }, [debouncedSlug, post?.id]);

  const onSubmit = async (values: PostFormValues) => {
    const postData = {
      ...values,
      category_id: categoryId,
      tag_ids: tags.map(tag => tag.id),
      series_ids: series.map(s => s.id),
    };

    if (post) {
      updatePost.mutate(
        { id: post.id, ...postData },
        {
          onSuccess,
          onError: (error: any) => {
            // Handle validation errors from the server
            if (error.response?.data?.errors?.slug) {
              form.setError('slug', {
                type: 'manual',
                message: error.response.data.errors.slug[0],
              });
            } else {
              console.error('Update failed:', error);
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
            console.error('Creation failed:', error);
          }
        },
      });
    }
  };

  // SEO helpers
  const titleLength = watchedTitle.length;
  const excerptLength = form.watch('excerpt')?.length || 0;
  const slugPreview = watchedSlug ? `/posts/${watchedSlug}` : '';

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
                Post Title <span className="text-red-500 text-sm">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter a compelling, keyword-rich title..."
                  className="text-3xl font-bold h-16 border-b-2 focus-visible:ring-0 focus-visible:border-primary pb-2"
                  {...field}
                />
              </FormControl>
              <FormDescription className="flex items-center gap-2 text-sm">
                {titleLength > 0 && titleLength <= 70 ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                )}
                {titleLength} / 70 characters — ideal for search results
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Slug with real‑time availability */}
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
                      const newSlug = slugify(e.target.value);
                      field.onChange(newSlug);
                      setSlugManuallyEdited(true);
                    }}
                  />
                  {slugPreview && (
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      Preview: <strong>{slugPreview}</strong>
                    </span>
                  )}
                </div>
              </FormControl>
              <FormDescription className="text-sm">
                Used in the post URL. Auto-generated from title — edit if needed.
              </FormDescription>

              {/* Slug availability indicator */}
              {watchedSlug && watchedSlug.length >= 3 && (
                <div className="flex items-center gap-1 text-sm mt-1">
                  {isCheckingSlug ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Checking availability...</span>
                    </>
                  ) : slugAvailable === true ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-green-600">Slug is available!</span>
                    </>
                  ) : slugAvailable === false ? (
                    <>
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <span className="text-red-600">This slug is already taken. Please choose another.</span>
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
          <FormDescription className="text-sm">
            Choose a category to help organize your content
          </FormDescription>
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
          <FormDescription className="text-sm">
            Add up to 10 relevant tags to improve discoverability
          </FormDescription>
        </FormItem>

        {/* Series */}
        {post?.id && (
          <FormItem>
            <FormLabel>Series</FormLabel>
            <SeriesSelector
              postId={post.id}
              currentSeries={series}
              onChange={setSeries}
            />
            <FormDescription className="text-sm">
              Add this post to a series for sequential reading
            </FormDescription>
          </FormItem>
        )}

        {/* Excerpt / Meta Description */}
        <FormField
          control={form.control}
          name="excerpt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Excerpt / Meta Description <span className="text-amber-600 text-sm">(important for SEO)</span>
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Write a compelling 120–160 character summary that appears in Google search results..."
                  className="min-h-100px resize-y"
                  {...field}
                />
              </FormControl>
              <FormDescription className="flex items-center gap-2 text-sm">
                {excerptLength > 0 && excerptLength >= 120 && excerptLength <= 160 ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                )}
                {excerptLength} / 160 characters recommended
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Content */}
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Post Content</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Start writing your post here... Use headings, lists, and images for better SEO and readability."
                  className="min-h-300px md:min-h-500px resize-y font-medium leading-relaxed"
                  {...field}
                />
              </FormControl>
              <FormDescription className="text-sm text-muted-foreground">
                Tip: Use H2/H3 headings, bullet lists, short paragraphs, and relevant keywords naturally.
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
                  <SelectTrigger>
                    <SelectValue placeholder="Choose status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="draft">Draft (not visible to public)</SelectItem>
                  <SelectItem value="published">Published (live & indexed by search engines)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit button */}
        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={createPost.isPending || updatePost.isPending}
            className="flex-1 md:flex-initial"
          >
            {createPost.isPending || updatePost.isPending ? 'Saving...' : post ? 'Update Post' : 'Create & Publish'}
          </Button>

          {post && (
            <Button type="button" variant="outline" onClick={onSuccess}>
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}