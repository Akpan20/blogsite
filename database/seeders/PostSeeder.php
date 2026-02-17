<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Post;
use Illuminate\Support\Str;

class PostSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get the first user or create one
        $user = User::first();
        
        if (!$user) {
            $user = User::create([
                'name' => 'Test User',
                'email' => 'test@example.com',
                'password' => bcrypt('password'),
            ]);
        }

        $posts = [
            [
                'title' => 'Welcome to Our Blog',
                'excerpt' => 'This is our first post introducing the new comment system with real-time reactions.',
                'content' => '<p>Welcome to our blog! We\'re excited to introduce our new comment system.</p>
                    <p>This system features:</p>
                    <ul>
                        <li>Real-time comments and reactions</li>
                        <li>Nested replies</li>
                        <li>Six different emoji reactions</li>
                        <li>Edit and delete capabilities</li>
                    </ul>
                    <p>Try it out by leaving a comment below!</p>',
            ],
            [
                'title' => 'Getting Started with Laravel and React',
                'excerpt' => 'Learn how to build modern web applications with Laravel backend and React frontend.',
                'content' => '<p>Laravel and React make a powerful combination for building modern web applications.</p>
                    <h2>Why Laravel?</h2>
                    <p>Laravel provides a robust backend with excellent developer experience, including:</p>
                    <ul>
                        <li>Eloquent ORM for database operations</li>
                        <li>Built-in authentication</li>
                        <li>Real-time broadcasting with Laravel Echo</li>
                    </ul>
                    <h2>Why React?</h2>
                    <p>React offers a component-based architecture perfect for interactive UIs:</p>
                    <ul>
                        <li>Virtual DOM for performance</li>
                        <li>Reusable components</li>
                        <li>Strong ecosystem</li>
                    </ul>',
            ],
            [
                'title' => 'Understanding WebSockets and Real-time Communication',
                'excerpt' => 'A deep dive into how WebSockets enable real-time features in modern web applications.',
                'content' => '<p>WebSockets provide a full-duplex communication channel over a single TCP connection.</p>
                    <h2>Benefits of WebSockets</h2>
                    <ul>
                        <li>Real-time updates without polling</li>
                        <li>Lower latency</li>
                        <li>Reduced server load</li>
                        <li>Better user experience</li>
                    </ul>
                    <h2>Use Cases</h2>
                    <p>WebSockets are perfect for:</p>
                    <ul>
                        <li>Chat applications</li>
                        <li>Live notifications</li>
                        <li>Collaborative editing</li>
                        <li>Real-time comments (like ours!)</li>
                    </ul>',
            ],
        ];

        foreach ($posts as $postData) {
            // 🔁 Create only if the slug doesn't exist
            Post::firstOrCreate(
                ['slug' => Str::slug($postData['title'])], // unique key
                [
                    'user_id'   => $user->id,
                    'title'     => $postData['title'],
                    'excerpt'   => $postData['excerpt'],
                    'content'   => $postData['content'],
                    'published' => true,
                ]
            );
        }

        $this->command->info('Created ' . count($posts) . ' sample posts!');
    }
}