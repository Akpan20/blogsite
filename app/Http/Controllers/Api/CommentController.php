<?php

namespace App\Http\Controllers\Api;

use App\Events\CommentDeleted;
use App\Events\CommentPosted;
use App\Events\CommentReactionUpdated;
use App\Events\CommentUpdated;
use App\Http\Controllers\Controller;
use App\Models\Comment;
use App\Models\CommentReaction;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class CommentController extends Controller
{
    /**
     * Display a listing of comments for a post
     */
    public function index(Request $request, Post $post): JsonResponse
    {
        $comments = Comment::where('post_id', $post->id)
            ->rootComments()
            ->withReplies()
            ->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 20));

        return response()->json($comments);
    }

    /**
     * Store a newly created comment
     */
    public function store(Request $request, Post $post): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'content' => 'required|string|max:2000',
            'parent_id' => 'nullable|exists:comments,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        // If parent_id is provided, verify it belongs to the same post
        if ($request->parent_id) {
            $parentComment = Comment::findOrFail($request->parent_id);
            if ($parentComment->post_id !== $post->id) {
                return response()->json([
                    'message' => 'Parent comment does not belong to this post',
                ], 422);
            }
        }

        $comment = Comment::create([
            'user_id' => Auth::id(),
            'post_id' => $post->id,
            'parent_id' => $request->parent_id,
            'content' => $request->content,
        ]);

        $comment->load(['user', 'reactions']);

        // Broadcast the new comment
        broadcast(new CommentPosted($comment))->toOthers();

        return response()->json([
            'message' => 'Comment posted successfully',
            'comment' => $comment,
        ], 201);
    }

    /**
     * Display the specified comment
     */
    public function show(Comment $comment): JsonResponse
    {
        $comment->load(['user', 'reactions', 'replies.user', 'replies.reactions']);

        return response()->json($comment);
    }

    /**
     * Update the specified comment
     */
    public function update(Request $request, Comment $comment): JsonResponse
    {
        // Check if user owns the comment
        if ($comment->user_id !== Auth::id()) {
            return response()->json([
                'message' => 'Unauthorized to update this comment',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'content' => 'required|string|max:2000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $comment->update([
            'content' => $request->content,
            'is_edited' => true,
            'edited_at' => now(),
        ]);

        $comment->load(['user', 'reactions']);

        // Broadcast the update
        broadcast(new CommentUpdated($comment))->toOthers();

        return response()->json([
            'message' => 'Comment updated successfully',
            'comment' => $comment,
        ]);
    }

    /**
     * Remove the specified comment
     */
    public function destroy(Comment $comment): JsonResponse
    {
        // Check if user owns the comment
        if ($comment->user_id !== Auth::id()) {
            return response()->json([
                'message' => 'Unauthorized to delete this comment',
            ], 403);
        }

        $postId = $comment->post_id;
        $commentId = $comment->id;

        $comment->delete();

        // Broadcast the deletion
        broadcast(new CommentDeleted($commentId, $postId))->toOthers();

        return response()->json([
            'message' => 'Comment deleted successfully',
        ]);
    }

    /**
     * Toggle a reaction on a comment
     */
    public function toggleReaction(Request $request, Comment $comment): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'type' => 'required|string|in:' . implode(',', CommentReaction::TYPES),
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $userId = Auth::id();
        $type = $request->type;

        $existingReaction = CommentReaction::where('user_id', $userId)
            ->where('comment_id', $comment->id)
            ->first();

        if ($existingReaction) {
            if ($existingReaction->type === $type) {
                // Remove reaction if clicking the same type
                $existingReaction->delete();
                $message = 'Reaction removed';
            } else {
                // Update to new reaction type
                $existingReaction->update(['type' => $type]);
                $message = 'Reaction updated';
            }
        } else {
            // Create new reaction
            CommentReaction::create([
                'user_id' => $userId,
                'comment_id' => $comment->id,
                'type' => $type,
            ]);
            $message = 'Reaction added';
        }

        // Reload comment to get updated reactions
        $comment->load('reactions');

        // Broadcast the reaction update
        broadcast(new CommentReactionUpdated($comment))->toOthers();

        return response()->json([
            'message' => $message,
            'reactions_count' => $comment->reactions_count,
            'user_reaction' => $comment->user_reaction,
        ]);
    }

    public function getReplies(Comment $comment): JsonResponse
    {
        $replies = $comment->replies()
            ->with(['user', 'reactions'])
            ->paginate(10);
        
        return response()->json($replies);
    }

    /**
     * Get all reactions for a comment
     */
    public function getReactions(Comment $comment): JsonResponse
    {
        $reactions = $comment->reactions()
            ->with('user:id,name,email')
            ->get()
            ->groupBy('type')
            ->map(function ($group) {
                return [
                    'count' => $group->count(),
                    'users' => $group->map(fn($r) => [
                        'id' => $r->user->id,
                        'name' => $r->user->name,
                    ])->values(),
                ];
            });

        return response()->json($reactions);
    }
}