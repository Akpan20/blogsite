<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    // MongoDB IDs are strings/objects, not integers. 
    // Always cast to (string) for a reliable comparison.
    return (string) $user->id === (string) $id;
});