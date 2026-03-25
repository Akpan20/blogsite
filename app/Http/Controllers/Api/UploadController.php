<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Laravel\Facades\Image;

class UploadController extends Controller
{
    /**
     * List all uploaded media (Newest first)
     */
    public function index()
    {
        if (!Storage::disk('public')->exists('posts')) {
            return response()->json([]);
        }

        $files = Storage::disk('public')->files('posts');
        
        $media = collect($files)->map(function ($path) {
            return [
                'name' => basename($path),
                'url' => asset('storage/' . $path),
                'size' => round(Storage::disk('public')->size($path) / 1024, 2) . ' KB',
            ];
        })->reverse()->values();

        return response()->json($media);
    }

    /**
     * Upload and Compress Image
     */
    public function uploadImage(Request $request): JsonResponse
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:10240', // 10MB
        ]);

        $path = $request->file('image')->store('uploads/images', 'public');

        return response()->json([
            'url' => Storage::url($path),
            'message' => 'Image uploaded successfully',
            'path' => $path,
        ], 201);
    }

    /**
     * Delete Media
     */
    public function destroy(Request $request)
    {
        $request->validate(['url' => 'required|string']);

        // Convert full URL back to relative disk path
        $path = str_replace(asset('storage/'), '', $request->url);

        if (Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
            return response()->json(['message' => 'Media deleted successfully']);
        }

        return response()->json(['error' => 'File not found at ' . $path], 404);
    }
}