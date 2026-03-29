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
    public function index(Request $request, Post $post): JsonResponse
    {
        $comments = Comment::where('post_id', (string) $post->_id)
            ->rootComments()
            ->withReplies()
            ->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 20));

        return response()->json($comments);
    }

    public function store(Request $request, Post $post): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'content'   => 'required|string|max:2000',
            // exists rule works with laravel-mongodb using _id
            'parent_id' => 'nullable|exists:comments,_id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors'  => $validator->errors(),
            ], 422);
        }

        if ($request->parent_id) {
            $parentComment = Comment::findOrFail($request->parent_id);
            // Cast both sides to string for ObjectId-safe comparison
            if ((string) $parentComment->post_id !== (string) $post->_id) {
                return response()->json([
                    'message' => 'Parent comment does not belong to this post',
                ], 422);
            }
        }

        $comment = Comment::create([
            'user_id'   => (string) Auth::id(),
            'post_id'   => (string) $post->_id,
            'parent_id' => $request->parent_id ? (string) $request->parent_id : null,
            'content'   => $request->content,
        ]);

        $comment->load(['user', 'reactions']);

        broadcast(new CommentPosted($comment))->toOthers();

        return response()->json([
            'message' => 'Comment posted successfully',
            'comment' => $comment,
        ], 201);
    }

    public function guestStore(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'post_id'   => 'required|exists:posts,_id',
            'content'   => 'required|string|min:3|max:2000',
            'name'      => 'required|string|max:100',
            'email'     => 'nullable|email|max:255',
            'parent_id' => 'nullable|exists:comments,_id',
        ]);

        $post = Post::findOrFail($validated['post_id']);

        $comment = Comment::create([
            'post_id'   => (string) $post->_id,
            'content'   => $validated['content'],
            'name'      => $validated['name'],
            'email'     => $validated['email'] ?? null,
            'parent_id' => isset($validated['parent_id']) ? (string) $validated['parent_id'] : null,
            'approved'  => false,
            'user_id'   => null,
        ]);

        $comment->load(['reactions']);

        broadcast(new CommentPosted($comment))->toOthers();

        return response()->json([
            'message' => 'Comment posted successfully',
            'comment' => $comment,
        ], 201);
    }

    public function show(Comment $comment): JsonResponse
    {
        $comment->load(['user', 'reactions', 'replies.user', 'replies.reactions']);
        return response()->json($comment);
    }

    public function update(Request $request, Comment $comment): JsonResponse
    {
        // Cast both sides — Auth::id() returns a string in MongoDB context
        if ((string) $comment->user_id !== (string) Auth::id()) {
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
                'errors'  => $validator->errors(),
            ], 422);
        }

        $comment->update([
            'content'   => $request->content,
            'is_edited' => true,
            'edited_at' => now(),
        ]);

        $comment->load(['user', 'reactions']);

        broadcast(new CommentUpdated($comment))->toOthers();

        return response()->json([
            'message' => 'Comment updated successfully',
            'comment' => $comment,
        ]);
    }

    public function destroy(Comment $comment): JsonResponse
    {
        if ((string) $comment->user_id !== (string) Auth::id()) {
            return response()->json([
                'message' => 'Unauthorized to delete this comment',
            ], 403);
        }

        $postId    = (string) $comment->post_id;
        $commentId = (string) $comment->_id;

        $comment->delete();

        broadcast(new CommentDeleted($commentId, $postId))->toOthers();

        return response()->json(['message' => 'Comment deleted successfully']);
    }

    public function toggleReaction(Request $request, Comment $comment): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'type' => 'required|string|in:' . implode(',', CommentReaction::TYPES),
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $userId = (string) Auth::id();
        $type   = $request->type;

        $existingReaction = CommentReaction::where('user_id', $userId)
            ->where('comment_id', (string) $comment->_id)
            ->first();

        if ($existingReaction) {
            if ($existingReaction->type === $type) {
                $existingReaction->delete();
                $message = 'Reaction removed';
            } else {
                $existingReaction->update(['type' => $type]);
                $message = 'Reaction updated';
            }
        } else {
            CommentReaction::create([
                'user_id'    => $userId,
                'comment_id' => (string) $comment->_id,
                'type'       => $type,
            ]);
            $message = 'Reaction added';
        }

        $comment->load('reactions');

        broadcast(new CommentReactionUpdated($comment))->toOthers();

        return response()->json([
            'message'         => $message,
            'reactions_count' => $comment->reactions_count,
            'user_reaction'   => $comment->user_reaction,
        ]);
    }

    public function getReplies(Comment $comment): JsonResponse
    {
        $replies = $comment->replies()
            ->with(['user', 'reactions'])
            ->paginate(10);

        return response()->json($replies);
    }

    public function getReactions(Comment $comment): JsonResponse
    {
        $reactions = $comment->reactions()
            // In MongoDB, column-selection syntax uses field names directly
            ->with('user:_id,name,email')
            ->get()
            ->groupBy('type')
            ->map(fn($group) => [
                'count' => $group->count(),
                'users' => $group->map(fn($r) => [
                    'id'   => (string) $r->user->_id,
                    'name' => $r->user->name,
                ])->values(),
            ]);

        return response()->json($reactions);
    }
}