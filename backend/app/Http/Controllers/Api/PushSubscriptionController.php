<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class PushSubscriptionController extends Controller
{
    public function update(Request $request)
    {
        $this->validate($request, [
            'endpoint'    => 'required',
            'keys.auth'   => 'required',
            'keys.p256dh' => 'required',
        ]);

        $endpoint = $request->endpoint;
        $key      = $request->keys['p256dh'];
        $token    = $request->keys['auth'];

        // updatePushSubscription is provided by the HasPushSubscriptions trait.
        // If using laravel-notification-channels/webpush, ensure its
        // PushSubscription model extends MongoDB\Laravel\Eloquent\Model,
        // or publish and override the model binding in config/webpush.php.
        $request->user()->updatePushSubscription($endpoint, $key, $token);

        return response()->json(['success' => true]);
    }
}