import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Search, BarChart2, FileText, FileDown, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { usePosts } from '@/hooks/usePosts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import api from '@/lib/api';

export default function OtherTools() {
  const { data: posts, isLoading: postsLoading } = usePosts();
  const [selectedPostId, setSelectedPostId] = useState<string>('');
  const [seoResult, setSeoResult] = useState<string>('');
  const [exportLoading, setExportLoading] = useState(false);
  const [seoLoading, setSeoLoading] = useState(false);

  // Export all posts as Markdown or CSV
  const handleExport = async (format: 'markdown' | 'csv') => {
    if (!posts || posts.length === 0) {
      toast.error('No posts to export');
      return;
    }

    setExportLoading(true);

    try {
      if (format === 'markdown') {
        let content = '# My Blog Posts Export\n\n';
        posts.forEach((post) => {
          content += `## ${post.title}\n\n`;
          content += `${post.content}\n\n`;
          content += `Published: ${new Date(post.created_at).toLocaleDateString()}\n`;
          content += `---\n\n`;
        });

        const blob = new Blob([content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `blog-posts-export-${new Date().toISOString().split('T')[0]}.md`;
        a.click();
        URL.revokeObjectURL(url);

        toast.success('Posts exported as Markdown');
      } else if (format === 'csv') {
        const headers = ['Title', 'Slug', 'Content', 'Status', 'Created At'];
        const rows = posts.map((p) => [
          `"${p.title.replace(/"/g, '""')}"`,
          p.slug,
          `"${p.content.replace(/"/g, '""')}"`,
          p.status,
          p.created_at,
        ]);

        const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `blog-posts-export-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);

        toast.success('Posts exported as CSV');
      }
    } catch (err) {
      toast.error('Export failed');
      console.error(err);
    } finally {
      setExportLoading(false);
    }
  };

  // Very basic client-side SEO check (can be expanded later)
  const runSeoCheck = async () => {
    if (!selectedPostId) {
      toast.error('Please select a post');
      return;
    }

    setSeoLoading(true);
    setSeoResult('');

    try {
      // Optional: fetch full post content if needed
      const { data: post } = await api.get(`/posts/${selectedPostId}`);

      const title = post.title || '';
      const content = post.content || '';
      const slug = post.slug || '';

      const issues: string[] = [];

      // Title checks
      if (!title) issues.push('• No title found');
      else if (title.length < 10) issues.push('• Title too short (< 10 chars)');
      else if (title.length > 70) issues.push('• Title too long (> 70 chars)');

      // Slug checks
      if (!slug) issues.push('• No slug found');
      else if (!/^[a-z0-9-]+$/.test(slug)) issues.push('• Slug contains invalid characters');

      // Content checks
      if (!content) issues.push('• No content found');
      else {
        const words = content.split(/\s+/).length;
        if (words < 300) issues.push(`• Content is short (${words} words – aim for 600+)`);
        if (!content.includes('<h2') && !content.includes('<h3')) {
          issues.push('• No subheadings (h2/h3) found – improve structure');
        }
      }

      // Keyword density (very basic)
      const text = (title + ' ' + content).toLowerCase();
      const wordCount = text.split(/\s+/).length;
      const hasKeyword = text.includes('blog') || text.includes('post'); // dummy example
      if (!hasKeyword) issues.push('• No obvious keywords detected in content');

      setSeoResult(
        issues.length === 0
          ? '✅ Looks good! No major issues detected in this basic check.'
          : `Found ${issues.length} potential improvements:\n\n${issues.join('\n')}`
      );
    } catch (err) {
      toast.error('Failed to analyze post');
      setSeoResult('Error loading post data');
    } finally {
      setSeoLoading(false);
    }
  };

  const handleGenerateReport = () => {
    toast.info('Advanced report generation coming soon');
    // Future: call backend endpoint to generate PDF/CSV analytics report
  };

  return (
    <div className="container mx-auto py-10 space-y-10">
      <h1 className="text-3xl font-bold tracking-tight">Other Tools</h1>
      <p className="text-muted-foreground">Useful utilities for managing and growing your blog</p>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Export Posts */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center gap-3">
            <Download className="h-6 w-6 text-green-600" />
            <CardTitle>Export Posts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Download all your blog posts in Markdown or CSV format.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                onClick={() => handleExport('markdown')}
                disabled={exportLoading || postsLoading || !posts?.length}
              >
                {exportLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Export Markdown
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={() => handleExport('csv')}
                disabled={exportLoading || postsLoading || !posts?.length}
              >
                {exportLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <FileDown className="mr-2 h-4 w-4" />
                    Export CSV
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Basic SEO Checker */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center gap-3">
            <Search className="h-6 w-6 text-purple-600" />
            <CardTitle>SEO Checker</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Quick on-page SEO analysis for any of your posts.
            </p>

            <Select value={selectedPostId} onValueChange={setSelectedPostId} disabled={postsLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Select a post to analyze" />
              </SelectTrigger>
              <SelectContent>
                {posts?.map((post) => (
                  <SelectItem key={post.id} value={post.id.toString()}>
                    {post.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              onClick={runSeoCheck}
              disabled={seoLoading || !selectedPostId || postsLoading}
              className="w-full"
            >
              {seoLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Run SEO Check'
              )}
            </Button>

            {seoResult && (
              <div className="mt-4 p-4 bg-muted rounded-md text-sm whitespace-pre-wrap">
                {seoResult}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Advanced Analytics Report (Placeholder) */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center gap-3">
            <BarChart2 className="h-6 w-6 text-orange-600" />
            <CardTitle>Advanced Analytics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Generate detailed reports including traffic sources, reader demographics, and more (CSV/PDF).
            </p>

            <Button
              onClick={handleGenerateReport}
              variant="outline"
              className="w-full"
              disabled
            >
              Generate Report (Coming Soon)
            </Button>

            <p className="text-xs text-muted-foreground italic">
              Future version will include:
              <br />• Monthly performance summary
              <br />• Top countries & devices
              <br />• Engagement heatmaps
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}