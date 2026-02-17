<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $post_id
 * @property string|null $ip_address
 * @property string|null $user_agent
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|View newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|View newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|View query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|View whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|View whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|View whereIpAddress($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|View wherePostId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|View whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|View whereUserAgent($value)
 * @mixin \Eloquent
 */
class View extends Model
{
    //
}
