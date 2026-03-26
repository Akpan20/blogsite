<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class SEOController extends Controller
{
    public function sitemap()
    {
        $sitemap = Cache::remember('sitemap', 3600, function () {
            $posts = Post::where('published', true)
                ->orderBy('updated_at', 'desc')
                ->get(['_id', 'slug', 'updated_at', 'created_at']);

            $xml  = '<?xml version="1.0" encoding="UTF-8"?>';
            $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
            $xml .= '<url><loc>' . url('/') . '</loc>';
            $xml .= '<lastmod>' . now()->toAtomString() . '</lastmod>';
            $xml .= '<changefreq>daily</changefreq><priority>1.0</priority></url>';

            foreach ($posts as $post) {
                $xml .= '<url>';
                $xml .= '<loc>' . url('/posts/' . ($post->slug ?? $post->id)) . '</loc>';
                $xml .= '<lastmod>' . $post->updated_at->toAtomString() . '</lastmod>';
                $xml .= '<changefreq>weekly</changefreq><priority>0.8</priority>';
                $xml .= '</url>';
            }

            $xml .= '</urlset>';
            return $xml;
        });

        return response($sitemap, 200)->header('Content-Type', 'application/xml');
    }

    public function robots()
    {
        $robots  = "User-agent: *\n";
        $robots .= "Allow: /\n";
        $robots .= "Disallow: /admin/\n";
        $robots .= "Disallow: /dashboard/\n";
        $robots .= "Disallow: /api/\n\n";
        $robots .= "Sitemap: " . url('/sitemap.xml') . "\n";

        return response($robots, 200)->header('Content-Type', 'text/plain');
    }

    public function getPostMeta(Post $post): JsonResponse
    {
        $baseUrl = config('app.url');
        $postUrl = $baseUrl . '/posts/' . ($post->slug ?? $post->id);

        return response()->json([
            'title'       => $post->meta_title ?? $post->title,
            'description' => $post->meta_description ?? $post->excerpt ?? substr(strip_tags($post->content), 0, 160),
            'keywords'    => $post->meta_keywords,
            'canonical'   => $post->canonical_url ?? $postUrl,
            'robots'      => ($post->index ? 'index' : 'noindex') . ',' . ($post->follow ? 'follow' : 'nofollow'),
            'og' => [
                'title'       => $post->meta_title ?? $post->title,
                'description' => $post->meta_description ?? $post->excerpt ?? substr(strip_tags($post->content), 0, 200),
                'image'       => $post->og_image ?? $post->featured_image ?? $baseUrl . '/images/default-og.jpg',
                'url'         => $postUrl,
                'type'        => 'article',
                'site_name'   => config('app.name'),
            ],
            'twitter' => [
                'card'        => 'summary_large_image',
                'title'       => $post->meta_title ?? $post->title,
                'description' => $post->meta_description ?? $post->excerpt ?? substr(strip_tags($post->content), 0, 200),
                'image'       => $post->og_image ?? $post->featured_image ?? $baseUrl . '/images/default-og.jpg',
            ],
            'article' => [
                'published_time' => $post->created_at->toIso8601String(),
                'modified_time'  => $post->updated_at->toIso8601String(),
                'author'         => $post->user?->name,
            ],
        ]);
    }

    public function trackView(Post $post): JsonResponse
    {
        $post->increment('views_count');
        return response()->json(['message' => 'View tracked', 'views' => $post->views_count]);
    }

    public function trending(Request $request): JsonResponse
    {
        $days = $request->get('days', 7);

        $trending = Post::where('published', true)
            ->where('created_at', '>=', now()->subDays($days))
            ->orderByDesc('views_count')
            ->with(['user'])
            ->limit(10)
            ->get();

        return response()->json($trending);
    }
}