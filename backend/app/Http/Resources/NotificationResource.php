<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Str;

class NotificationResource extends JsonResource
{
    /**
     * Transform the notification into an array.
     *
     * @param Request $request
     * @return array
     */
    public function toArray($request): array
    {
        return [
            // Handle MongoDB's _id or the standard UUID string
            'id' => (string) ($this->id ?? $this->_id),
            
            // Convert 'App\Notifications\UserFollowed' to 'user_followed' 
            // This is much easier for your React/Vue frontend to switch on
            'type' => Str::snake(class_basename($this->type)),
            
            // Clean up the data payload. 
            // If it's a JSON string in Mongo, ensure it's returned as an array
            'data' => $this->data,
            
            // Status flags
            'is_read' => $this->read_at !== null,
            
            // Formatted Dates
            'read_at' => $this->read_at?->toISOString(),
            'created_at' => $this->created_at?->toISOString(),
            
            // Human-readable time for your UI (e.g., "2 minutes ago")
            'created_at_human' => $this->created_at?->diffForHumans(),
        ];
    }
}