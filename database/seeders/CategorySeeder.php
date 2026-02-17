<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Clear existing categories (optional - comment out if you want to keep existing)
        // Category::query()->delete();

        $order = 1;

        // ============================================
        // TECHNOLOGY & DIGITAL
        // ============================================
        $tech = Category::create([
            'name' => 'Technology',
            'description' => 'All things tech - from development to gadgets',
            'color' => '#3B82F6',
            'icon' => '💻',
            'is_featured' => true,
            'order' => $order++,
        ]);

        Category::create(['name' => 'Web Development', 'parent_id' => $tech->id, 'icon' => '🌐', 'color' => '#06B6D4', 'order' => 1]);
        Category::create(['name' => 'Frontend Development', 'parent_id' => $tech->id, 'icon' => '⚛️', 'color' => '#61DAFB', 'order' => 2]);
        Category::create(['name' => 'Backend Development', 'parent_id' => $tech->id, 'icon' => '⚙️', 'color' => '#10B981', 'order' => 3]);
        Category::create(['name' => 'Full Stack', 'parent_id' => $tech->id, 'icon' => '🔧', 'color' => '#8B5CF6', 'order' => 4]);
        Category::create(['name' => 'WordPress', 'parent_id' => $tech->id, 'icon' => '📝', 'color' => '#21759B', 'order' => 5]);
        
        $mobile = Category::create(['name' => 'Mobile Development', 'parent_id' => $tech->id, 'icon' => '📱', 'color' => '#EC4899', 'order' => 6]);
        Category::create(['name' => 'iOS Development', 'parent_id' => $mobile->id, 'icon' => '🍎', 'color' => '#000000', 'order' => 1]);
        Category::create(['name' => 'Android Development', 'parent_id' => $mobile->id, 'icon' => '🤖', 'color' => '#3DDC84', 'order' => 2]);
        Category::create(['name' => 'Cross-Platform', 'parent_id' => $mobile->id, 'icon' => '🔄', 'color' => '#61DAFB', 'order' => 3]);

        $programming = Category::create(['name' => 'Programming', 'parent_id' => $tech->id, 'icon' => '👨‍💻', 'color' => '#F59E0B', 'order' => 7]);
        Category::create(['name' => 'Python', 'parent_id' => $programming->id, 'icon' => '🐍', 'color' => '#3776AB', 'order' => 1]);
        Category::create(['name' => 'JavaScript', 'parent_id' => $programming->id, 'icon' => '⚡', 'color' => '#F7DF1E', 'order' => 2]);
        Category::create(['name' => 'PHP', 'parent_id' => $programming->id, 'icon' => '🐘', 'color' => '#777BB4', 'order' => 3]);
        Category::create(['name' => 'Java', 'parent_id' => $programming->id, 'icon' => '☕', 'color' => '#007396', 'order' => 4]);

        Category::create(['name' => 'AI & Machine Learning', 'parent_id' => $tech->id, 'icon' => '🤖', 'color' => '#8B5CF6', 'order' => 8]);
        Category::create(['name' => 'Cybersecurity', 'parent_id' => $tech->id, 'icon' => '🔒', 'color' => '#EF4444', 'order' => 9]);
        Category::create(['name' => 'Cloud Computing', 'parent_id' => $tech->id, 'icon' => '☁️', 'color' => '#06B6D4', 'order' => 10]);
        Category::create(['name' => 'DevOps', 'parent_id' => $tech->id, 'icon' => '⚙️', 'color' => '#F97316', 'order' => 11]);
        Category::create(['name' => 'Data Science', 'parent_id' => $tech->id, 'icon' => '📊', 'color' => '#10B981', 'order' => 12]);
        Category::create(['name' => 'Tech Reviews', 'parent_id' => $tech->id, 'icon' => '⭐', 'color' => '#FBBF24', 'order' => 13]);
        Category::create(['name' => 'Gaming', 'parent_id' => $tech->id, 'icon' => '🎮', 'color' => '#A855F7', 'order' => 14]);

        // ============================================
        // BUSINESS & FINANCE
        // ============================================
        $business = Category::create([
            'name' => 'Business',
            'description' => 'Business insights, entrepreneurship, and professional growth',
            'color' => '#10B981',
            'icon' => '💼',
            'is_featured' => true,
            'order' => $order++,
        ]);

        Category::create(['name' => 'Entrepreneurship', 'parent_id' => $business->id, 'icon' => '🚀', 'color' => '#F97316', 'order' => 1]);
        Category::create(['name' => 'Startup Stories', 'parent_id' => $business->id, 'icon' => '💡', 'color' => '#FBBF24', 'order' => 2]);
        
        $marketing = Category::create(['name' => 'Marketing', 'parent_id' => $business->id, 'icon' => '📢', 'color' => '#06B6D4', 'order' => 3]);
        Category::create(['name' => 'Digital Marketing', 'parent_id' => $marketing->id, 'icon' => '💻', 'color' => '#3B82F6', 'order' => 1]);
        Category::create(['name' => 'Content Marketing', 'parent_id' => $marketing->id, 'icon' => '✍️', 'color' => '#8B5CF6', 'order' => 2]);
        Category::create(['name' => 'SEO', 'parent_id' => $marketing->id, 'icon' => '🔍', 'color' => '#10B981', 'order' => 3]);
        Category::create(['name' => 'Social Media Marketing', 'parent_id' => $marketing->id, 'icon' => '📱', 'color' => '#EC4899', 'order' => 4]);

        $finance = Category::create(['name' => 'Finance', 'parent_id' => $business->id, 'icon' => '💰', 'color' => '#84CC16', 'order' => 4]);
        Category::create(['name' => 'Personal Finance', 'parent_id' => $finance->id, 'icon' => '💳', 'color' => '#10B981', 'order' => 1]);
        Category::create(['name' => 'Investing', 'parent_id' => $finance->id, 'icon' => '📈', 'color' => '#3B82F6', 'order' => 2]);
        Category::create(['name' => 'Cryptocurrency', 'parent_id' => $finance->id, 'icon' => '₿', 'color' => '#F7931A', 'order' => 3]);

        Category::create(['name' => 'E-commerce', 'parent_id' => $business->id, 'icon' => '🛒', 'color' => '#F59E0B', 'order' => 5]);
        Category::create(['name' => 'Productivity', 'parent_id' => $business->id, 'icon' => '✅', 'color' => '#14B8A6', 'order' => 6]);
        Category::create(['name' => 'Leadership', 'parent_id' => $business->id, 'icon' => '👔', 'color' => '#6366F1', 'order' => 7]);
        Category::create(['name' => 'Business Strategy', 'parent_id' => $business->id, 'icon' => '📊', 'color' => '#8B5CF6', 'order' => 8]);
        Category::create(['name' => 'Remote Work', 'parent_id' => $business->id, 'icon' => '🏠', 'color' => '#EC4899', 'order' => 9]);

        // ============================================
        // LIFESTYLE & PERSONAL
        // ============================================
        $lifestyle = Category::create([
            'name' => 'Lifestyle',
            'description' => 'Living well - health, fashion, and personal growth',
            'color' => '#EC4899',
            'icon' => '🌸',
            'is_featured' => true,
            'order' => $order++,
        ]);

        $health = Category::create(['name' => 'Health & Wellness', 'parent_id' => $lifestyle->id, 'icon' => '💪', 'color' => '#10B981', 'order' => 1]);
        Category::create(['name' => 'Fitness', 'parent_id' => $health->id, 'icon' => '🏋️', 'color' => '#EF4444', 'order' => 1]);
        Category::create(['name' => 'Nutrition', 'parent_id' => $health->id, 'icon' => '🥗', 'color' => '#84CC16', 'order' => 2]);
        Category::create(['name' => 'Mental Health', 'parent_id' => $health->id, 'icon' => '🧠', 'color' => '#8B5CF6', 'order' => 3]);
        Category::create(['name' => 'Yoga & Meditation', 'parent_id' => $health->id, 'icon' => '🧘', 'color' => '#A855F7', 'order' => 4]);

        Category::create(['name' => 'Fashion', 'parent_id' => $lifestyle->id, 'icon' => '👗', 'color' => '#EC4899', 'order' => 2]);
        Category::create(['name' => 'Beauty', 'parent_id' => $lifestyle->id, 'icon' => '💄', 'color' => '#F472B6', 'order' => 3]);
        
        $travel = Category::create(['name' => 'Travel', 'parent_id' => $lifestyle->id, 'icon' => '✈️', 'color' => '#06B6D4', 'order' => 4]);
        Category::create(['name' => 'Solo Travel', 'parent_id' => $travel->id, 'icon' => '🎒', 'color' => '#14B8A6', 'order' => 1]);
        Category::create(['name' => 'Budget Travel', 'parent_id' => $travel->id, 'icon' => '💰', 'color' => '#84CC16', 'order' => 2]);
        Category::create(['name' => 'Luxury Travel', 'parent_id' => $travel->id, 'icon' => '💎', 'color' => '#FBBF24', 'order' => 3]);
        Category::create(['name' => 'Adventure Travel', 'parent_id' => $travel->id, 'icon' => '🏔️', 'color' => '#F97316', 'order' => 4]);

        $food = Category::create(['name' => 'Food & Recipes', 'parent_id' => $lifestyle->id, 'icon' => '🍳', 'color' => '#F59E0B', 'order' => 5]);
        Category::create(['name' => 'Vegan & Vegetarian', 'parent_id' => $food->id, 'icon' => '🥬', 'color' => '#84CC16', 'order' => 1]);
        Category::create(['name' => 'Baking', 'parent_id' => $food->id, 'icon' => '🧁', 'color' => '#F472B6', 'order' => 2]);
        Category::create(['name' => 'International Cuisine', 'parent_id' => $food->id, 'icon' => '🌍', 'color' => '#06B6D4', 'order' => 3]);

        $home = Category::create(['name' => 'Home & Garden', 'parent_id' => $lifestyle->id, 'icon' => '🏡', 'color' => '#84CC16', 'order' => 6]);
        Category::create(['name' => 'Interior Design', 'parent_id' => $home->id, 'icon' => '🛋️', 'color' => '#A855F7', 'order' => 1]);
        Category::create(['name' => 'DIY Projects', 'parent_id' => $home->id, 'icon' => '🔨', 'color' => '#F97316', 'order' => 2]);
        Category::create(['name' => 'Gardening', 'parent_id' => $home->id, 'icon' => '🌱', 'color' => '#10B981', 'order' => 3]);

        Category::create(['name' => 'Parenting', 'parent_id' => $lifestyle->id, 'icon' => '👶', 'color' => '#FBBF24', 'order' => 7]);
        Category::create(['name' => 'Relationships', 'parent_id' => $lifestyle->id, 'icon' => '💑', 'color' => '#EF4444', 'order' => 8]);
        Category::create(['name' => 'Personal Development', 'parent_id' => $lifestyle->id, 'icon' => '🌱', 'color' => '#14B8A6', 'order' => 9]);

        // ============================================
        // CREATIVE & ARTS
        // ============================================
        $creative = Category::create([
            'name' => 'Creative & Arts',
            'description' => 'Creativity, design, and artistic expression',
            'color' => '#A855F7',
            'icon' => '🎨',
            'is_featured' => true,
            'order' => $order++,
        ]);

        Category::create(['name' => 'Photography', 'parent_id' => $creative->id, 'icon' => '📷', 'color' => '#3B82F6', 'order' => 1]);
        
        $design = Category::create(['name' => 'Design', 'parent_id' => $creative->id, 'icon' => '✨', 'color' => '#EC4899', 'order' => 2]);
        Category::create(['name' => 'Graphic Design', 'parent_id' => $design->id, 'icon' => '🖼️', 'color' => '#F97316', 'order' => 1]);
        Category::create(['name' => 'UI/UX Design', 'parent_id' => $design->id, 'icon' => '📱', 'color' => '#8B5CF6', 'order' => 2]);
        Category::create(['name' => 'Web Design', 'parent_id' => $design->id, 'icon' => '🌐', 'color' => '#06B6D4', 'order' => 3]);

        Category::create(['name' => 'Writing', 'parent_id' => $creative->id, 'icon' => '✍️', 'color' => '#6366F1', 'order' => 3]);
        Category::create(['name' => 'Music', 'parent_id' => $creative->id, 'icon' => '🎵', 'color' => '#EF4444', 'order' => 4]);
        Category::create(['name' => 'Film & TV', 'parent_id' => $creative->id, 'icon' => '🎬', 'color' => '#FBBF24', 'order' => 5]);
        Category::create(['name' => 'Arts & Crafts', 'parent_id' => $creative->id, 'icon' => '🖌️', 'color' => '#F472B6', 'order' => 6]);
        Category::create(['name' => 'Architecture', 'parent_id' => $creative->id, 'icon' => '🏛️', 'color' => '#64748B', 'order' => 7]);

        // ============================================
        // EDUCATION & LEARNING
        // ============================================
        $education = Category::create([
            'name' => 'Education & Learning',
            'description' => 'Knowledge, skills, and continuous learning',
            'color' => '#3B82F6',
            'icon' => '📚',
            'is_featured' => false,
            'order' => $order++,
        ]);

        Category::create(['name' => 'Tutorials', 'parent_id' => $education->id, 'icon' => '📖', 'color' => '#10B981', 'order' => 1]);
        Category::create(['name' => 'How-To Guides', 'parent_id' => $education->id, 'icon' => '📝', 'color' => '#06B6D4', 'order' => 2]);
        Category::create(['name' => 'Online Courses', 'parent_id' => $education->id, 'icon' => '🎓', 'color' => '#8B5CF6', 'order' => 3]);
        Category::create(['name' => 'Study Tips', 'parent_id' => $education->id, 'icon' => '💡', 'color' => '#FBBF24', 'order' => 4]);
        Category::create(['name' => 'Career Advice', 'parent_id' => $education->id, 'icon' => '💼', 'color' => '#10B981', 'order' => 5]);
        Category::create(['name' => 'Skills Development', 'parent_id' => $education->id, 'icon' => '🛠️', 'color' => '#F97316', 'order' => 6]);

        // ============================================
        // NEWS & OPINION
        // ============================================
        $news = Category::create([
            'name' => 'News & Opinion',
            'description' => 'Current events, analysis, and perspectives',
            'color' => '#EF4444',
            'icon' => '📰',
            'is_featured' => false,
            'order' => $order++,
        ]);

        Category::create(['name' => 'Current Events', 'parent_id' => $news->id, 'icon' => '🌍', 'color' => '#06B6D4', 'order' => 1]);
        Category::create(['name' => 'Politics', 'parent_id' => $news->id, 'icon' => '🏛️', 'color' => '#6366F1', 'order' => 2]);
        Category::create(['name' => 'Opinion & Editorial', 'parent_id' => $news->id, 'icon' => '💭', 'color' => '#8B5CF6', 'order' => 3]);
        Category::create(['name' => 'Analysis', 'parent_id' => $news->id, 'icon' => '🔍', 'color' => '#14B8A6', 'order' => 4]);
        Category::create(['name' => 'Interviews', 'parent_id' => $news->id, 'icon' => '🎤', 'color' => '#F59E0B', 'order' => 5]);

        // ============================================
        // ENTERTAINMENT
        // ============================================
        $entertainment = Category::create([
            'name' => 'Entertainment',
            'description' => 'Movies, books, TV, and pop culture',
            'color' => '#FBBF24',
            'icon' => '🎭',
            'is_featured' => false,
            'order' => $order++,
        ]);

        Category::create(['name' => 'Movies', 'parent_id' => $entertainment->id, 'icon' => '🎥', 'color' => '#EF4444', 'order' => 1]);
        Category::create(['name' => 'Books', 'parent_id' => $entertainment->id, 'icon' => '📚', 'color' => '#8B5CF6', 'order' => 2]);
        Category::create(['name' => 'TV Shows', 'parent_id' => $entertainment->id, 'icon' => '📺', 'color' => '#06B6D4', 'order' => 3]);
        Category::create(['name' => 'Celebrity News', 'parent_id' => $entertainment->id, 'icon' => '⭐', 'color' => '#F472B6', 'order' => 4]);
        Category::create(['name' => 'Podcasts', 'parent_id' => $entertainment->id, 'icon' => '🎙️', 'color' => '#F97316', 'order' => 5]);
        Category::create(['name' => 'Comics & Manga', 'parent_id' => $entertainment->id, 'icon' => '📖', 'color' => '#EC4899', 'order' => 6]);

        // ============================================
        // SPORTS & FITNESS
        // ============================================
        $sports = Category::create([
            'name' => 'Sports',
            'description' => 'Sports news, analysis, and fitness',
            'color' => '#10B981',
            'icon' => '⚽',
            'is_featured' => false,
            'order' => $order++,
        ]);

        Category::create(['name' => 'Football', 'parent_id' => $sports->id, 'icon' => '⚽', 'color' => '#10B981', 'order' => 1]);
        Category::create(['name' => 'Basketball', 'parent_id' => $sports->id, 'icon' => '🏀', 'color' => '#F97316', 'order' => 2]);
        Category::create(['name' => 'Tennis', 'parent_id' => $sports->id, 'icon' => '🎾', 'color' => '#FBBF24', 'order' => 3]);
        Category::create(['name' => 'Running', 'parent_id' => $sports->id, 'icon' => '🏃', 'color' => '#06B6D4', 'order' => 4]);
        Category::create(['name' => 'Cycling', 'parent_id' => $sports->id, 'icon' => '🚴', 'color' => '#84CC16', 'order' => 5]);
        Category::create(['name' => 'Extreme Sports', 'parent_id' => $sports->id, 'icon' => '🏂', 'color' => '#EF4444', 'order' => 6]);
        Category::create(['name' => 'Sports News', 'parent_id' => $sports->id, 'icon' => '📰', 'color' => '#8B5CF6', 'order' => 7]);

        // ============================================
        // SCIENCE & ENVIRONMENT
        // ============================================
        $science = Category::create([
            'name' => 'Science & Environment',
            'description' => 'Scientific discoveries and environmental issues',
            'color' => '#14B8A6',
            'icon' => '🔬',
            'is_featured' => false,
            'order' => $order++,
        ]);

        Category::create(['name' => 'Science News', 'parent_id' => $science->id, 'icon' => '🧪', 'color' => '#3B82F6', 'order' => 1]);
        Category::create(['name' => 'Space & Astronomy', 'parent_id' => $science->id, 'icon' => '🚀', 'color' => '#6366F1', 'order' => 2]);
        Category::create(['name' => 'Environment', 'parent_id' => $science->id, 'icon' => '🌍', 'color' => '#10B981', 'order' => 3]);
        Category::create(['name' => 'Climate Change', 'parent_id' => $science->id, 'icon' => '🌡️', 'color' => '#EF4444', 'order' => 4]);
        Category::create(['name' => 'Sustainability', 'parent_id' => $science->id, 'icon' => '♻️', 'color' => '#84CC16', 'order' => 5]);
        Category::create(['name' => 'Wildlife', 'parent_id' => $science->id, 'icon' => '🦁', 'color' => '#F59E0B', 'order' => 6]);

        // ============================================
        // AUTOMOTIVE
        // ============================================
        $automotive = Category::create([
            'name' => 'Automotive',
            'description' => 'Cars, vehicles, and automotive technology',
            'color' => '#64748B',
            'icon' => '🚗',
            'is_featured' => false,
            'order' => $order++,
        ]);

        Category::create(['name' => 'Car Reviews', 'parent_id' => $automotive->id, 'icon' => '⭐', 'color' => '#FBBF24', 'order' => 1]);
        Category::create(['name' => 'Electric Vehicles', 'parent_id' => $automotive->id, 'icon' => '⚡', 'color' => '#10B981', 'order' => 2]);
        Category::create(['name' => 'Motorcycles', 'parent_id' => $automotive->id, 'icon' => '🏍️', 'color' => '#EF4444', 'order' => 3]);
        Category::create(['name' => 'Auto Maintenance', 'parent_id' => $automotive->id, 'icon' => '🔧', 'color' => '#F97316', 'order' => 4]);

        $this->command->info('✅ Successfully seeded ' . Category::count() . ' categories!');
    }
}