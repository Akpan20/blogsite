<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\Tag;
use App\Models\Series;

class ContentOrganizationSeeder extends Seeder
{
    public function run()
    {
        // Create categories
        $tech = Category::create([
            'name' => 'Technology',
            'slug' => 'technology',
            'color' => '#3B82F6',
            'icon' => '💻',
            'is_featured' => true,
        ]);

        Category::create([
            'name' => 'Web Development',
            'slug' => 'web-development',
            'parent_id' => $tech->id,
            'color' => '#10B981',
            'icon' => '🌐',
        ]);

        Category::create([
            'name' => 'Mobile Development',
            'slug' => 'mobile-development',
            'parent_id' => $tech->id,
            'color' => '#8B5CF6',
            'icon' => '📱',
        ]);

        $design = Category::create([
            'name' => 'Design',
            'slug' => 'design',
            'color' => '#EC4899',
            'icon' => '🎨',
            'is_featured' => true,
        ]);

        // Create tags
        Tag::create(['name' => 'Laravel', 'color' => '#FF2D20']);
        Tag::create(['name' => 'React', 'color' => '#61DAFB']);
        Tag::create(['name' => 'Vue', 'color' => '#42B883']);
        Tag::create(['name' => 'PHP', 'color' => '#777BB4']);
        Tag::create(['name' => 'JavaScript', 'color' => '#F7DF1E']);
        Tag::create(['name' => 'TypeScript', 'color' => '#3178C6']);
        Tag::create(['name' => 'CSS', 'color' => '#1572B6']);
        Tag::create(['name' => 'UI/UX', 'color' => '#EC4899']);
        Tag::create(['name' => 'Tutorial', 'color' => '#10B981']);
        Tag::create(['name' => 'Best Practices', 'color' => '#F59E0B']);

        // Create a sample series
        Series::create([
            'title' => 'Laravel for Beginners',
            'slug' => 'laravel-for-beginners',
            'description' => 'A comprehensive guide to learning Laravel from scratch',
            'user_id' => 1, // Adjust based on your users
            'is_published' => true,
            'is_featured' => true,
        ]);
    }
}