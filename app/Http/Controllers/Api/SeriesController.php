<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Series;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SeriesController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = Series::query();

            if ($request->has('featured') && filter_var($request->input('featured'), FILTER_VALIDATE_BOOLEAN)) {
                $query->where('is_featured', true);
            }

            if (!$request->has('include_unpublished')) {
                $query->where('is_published', true);
            }

            if ($request->has('author_id')) {
                $query->where('user_id', $request->input('author_id'));
            }

            $query->with('user');

            $sortBy    = in_array($request->input('sort_by'), ['created_at', 'updated_at', 'title', 'posts_count'])
                ? $request->input('sort_by', 'created_at')
                : 'created_at';
            $sortOrder = $request->input('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            if ($request->has('limit')) {
                return response()->json($query->limit((int) $request->input('limit', 15))->get());
            }

            return response()->json($query->paginate((int) $request->input('per_page', 15)));

        } catch (\Exception $e) {
            \Log::error('Series index error: ' . $e->getMessage());
            return response()->json([]);
        }
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title'            => 'required|string|max:255',
            'description'      => 'nullable|string',
            'cover_image'      => 'nullable|string',
            'is_published'     => 'boolean',
            'is_featured'      => 'boolean',
            'meta_title'       => 'nullable|string|max:255',
            'meta_description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Check slug uniqueness manually
        if ($request->filled('slug') && Series::where('slug', $request->slug)->exists()) {
            return response()->json(['errors' => ['slug' => ['Slug already taken.']]], 422);
        }

        $series = Series::create([
            ...$request->except('slug'),
            'slug'    => $request->input('slug') ?: \Str::slug($request->title),
            'user_id' => auth()->id(),
        ]);

        return response()->json($series, 201);
    }

    public function show($slug)
    {
        $series = Series::where('slug', $slug)
            ->with(['user', 'posts' => function ($q) {
                $q->where('status', 'published')->with('user');
            }])
            ->firstOrFail();

        return response()->json($series);
    }

    public function update(Request $request, Series $series)
    {
        if ((string) $series->user_id !== (string) auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'title'            => 'string|max:255',
            'description'      => 'nullable|string',
            'cover_image'      => 'nullable|string',
            'is_published'     => 'boolean',
            'is_featured'      => 'boolean',
            'meta_title'       => 'nullable|string|max:255',
            'meta_description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Check slug uniqueness manually if changing
        if ($request->filled('slug') && $request->slug !== $series->slug) {
            if (Series::where('slug', $request->slug)->exists()) {
                return response()->json(['errors' => ['slug' => ['Slug already taken.']]], 422);
            }
        }

        $series->update($request->all());
        return response()->json($series);
    }

    public function destroy(Series $series)
    {
        if ((string) $series->user_id !== (string) auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $series->delete();
        return response()->json(['message' => 'Series deleted successfully']);
    }

    public function posts(Request $request, $slug)
    {
        $series = Series::where('slug', $slug)->firstOrFail();

        $posts = $series->posts()
            ->where('status', 'published')
            ->with(['user', 'category', 'tags'])
            ->get();

        return response()->json($posts);
    }

    public function progress(Series $series, Post $post)
    {
        return response()->json([
            'progress'      => $series->getProgress($post),
            'next_post'     => $series->getNextPost($post),
            'previous_post' => $series->getPreviousPost($post),
        ]);
    }
}