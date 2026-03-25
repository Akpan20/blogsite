<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        // Wipe existing categories cleanly
        Category::query()->forceDelete();

        $this->command->info('🌱 Seeding categories...');

        $order = 1;

        // ════════════════════════════════════════
        // TECHNOLOGY & DIGITAL
        // ════════════════════════════════════════
        $tech = $this->create('Technology', '💻', '#3B82F6', true, $order++);
            $this->create('Web Development',      '🌐', '#06B6D4', false, 1,  $tech->id);
            $this->create('Frontend Development', '⚛️', '#61DAFB', false, 2,  $tech->id);
            $this->create('Backend Development',  '⚙️', '#10B981', false, 3,  $tech->id);
            $this->create('Full Stack',           '🔧', '#8B5CF6', false, 4,  $tech->id);
            $this->create('WordPress',            '📝', '#21759B', false, 5,  $tech->id);
            $this->create('AI & Machine Learning','🤖', '#8B5CF6', false, 6,  $tech->id);
            $this->create('Cybersecurity',        '🔒', '#EF4444', false, 7,  $tech->id);
            $this->create('Cloud Computing',      '☁️', '#06B6D4', false, 8,  $tech->id);
            $this->create('DevOps',               '⚙️', '#F97316', false, 9,  $tech->id);
            $this->create('Data Science',         '📊', '#10B981', false, 10, $tech->id);
            $this->create('Tech Reviews',         '⭐', '#FBBF24', false, 11, $tech->id);
            $this->create('Gaming',               '🎮', '#A855F7', false, 12, $tech->id);

            $mobile = $this->create('Mobile Development', '📱', '#EC4899', false, 13, $tech->id);
                $this->create('iOS Development',    '🍎', '#000000', false, 1, $mobile->id);
                $this->create('Android Development','🤖', '#3DDC84', false, 2, $mobile->id);
                $this->create('Cross-Platform',     '🔄', '#61DAFB', false, 3, $mobile->id);

            $programming = $this->create('Programming', '👨‍💻', '#F59E0B', false, 14, $tech->id);
                $this->create('Python',     '🐍', '#3776AB', false, 1, $programming->id);
                $this->create('JavaScript', '⚡', '#F7DF1E', false, 2, $programming->id);
                $this->create('PHP',        '🐘', '#777BB4', false, 3, $programming->id);
                $this->create('Java',       '☕', '#007396', false, 4, $programming->id);

        // ════════════════════════════════════════
        // BUSINESS & FINANCE
        // ════════════════════════════════════════
        $business = $this->create('Business', '💼', '#10B981', true, $order++);
            $this->create('Entrepreneurship', '🚀', '#F97316', false, 1, $business->id);
            $this->create('Startup Stories',  '💡', '#FBBF24', false, 2, $business->id);
            $this->create('E-commerce',       '🛒', '#F59E0B', false, 3, $business->id);
            $this->create('Productivity',     '✅', '#14B8A6', false, 4, $business->id);
            $this->create('Leadership',       '👔', '#6366F1', false, 5, $business->id);
            $this->create('Business Strategy','📊', '#8B5CF6', false, 6, $business->id);
            $this->create('Remote Work',      '🏠', '#EC4899', false, 7, $business->id);

            $marketing = $this->create('Marketing', '📢', '#06B6D4', false, 8, $business->id);
                $this->create('Digital Marketing',      '💻', '#3B82F6', false, 1, $marketing->id);
                $this->create('Content Marketing',      '✍️', '#8B5CF6', false, 2, $marketing->id);
                $this->create('SEO',                    '🔍', '#10B981', false, 3, $marketing->id);
                $this->create('Social Media Marketing', '📱', '#EC4899', false, 4, $marketing->id);

            $finance = $this->create('Finance', '💰', '#84CC16', false, 9, $business->id);
                $this->create('Personal Finance', '💳', '#10B981', false, 1, $finance->id);
                $this->create('Investing',        '📈', '#3B82F6', false, 2, $finance->id);
                $this->create('Cryptocurrency',   '₿',  '#F7931A', false, 3, $finance->id);

        // ════════════════════════════════════════
        // LIFESTYLE & PERSONAL
        // ════════════════════════════════════════
        $lifestyle = $this->create('Lifestyle', '🌸', '#EC4899', true, $order++);
            $this->create('Fashion',             '👗', '#EC4899', false, 1, $lifestyle->id);
            $this->create('Beauty',              '💄', '#F472B6', false, 2, $lifestyle->id);
            $this->create('Parenting',           '👶', '#FBBF24', false, 3, $lifestyle->id);
            $this->create('Relationships',       '💑', '#EF4444', false, 4, $lifestyle->id);
            $this->create('Personal Development','🌱', '#14B8A6', false, 5, $lifestyle->id);

            $health = $this->create('Health & Wellness', '💪', '#10B981', false, 6, $lifestyle->id);
                $this->create('Fitness',          '🏋️', '#EF4444', false, 1, $health->id);
                $this->create('Nutrition',        '🥗', '#84CC16', false, 2, $health->id);
                $this->create('Mental Health',    '🧠', '#8B5CF6', false, 3, $health->id);
                $this->create('Yoga & Meditation','🧘', '#A855F7', false, 4, $health->id);

            $travel = $this->create('Travel', '✈️', '#06B6D4', false, 7, $lifestyle->id);
                $this->create('Solo Travel',      '🎒', '#14B8A6', false, 1, $travel->id);
                $this->create('Budget Travel',    '💰', '#84CC16', false, 2, $travel->id);
                $this->create('Luxury Travel',    '💎', '#FBBF24', false, 3, $travel->id);
                $this->create('Adventure Travel', '🏔️', '#F97316', false, 4, $travel->id);

            $food = $this->create('Food & Recipes', '🍳', '#F59E0B', false, 8, $lifestyle->id);
                $this->create('Vegan & Vegetarian',  '🥬', '#84CC16', false, 1, $food->id);
                $this->create('Baking',              '🧁', '#F472B6', false, 2, $food->id);
                $this->create('International Cuisine','🌍', '#06B6D4', false, 3, $food->id);

            $home = $this->create('Home & Garden', '🏡', '#84CC16', false, 9, $lifestyle->id);
                $this->create('Interior Design', '🛋️', '#A855F7', false, 1, $home->id);
                $this->create('DIY Projects',    '🔨', '#F97316', false, 2, $home->id);
                $this->create('Gardening',       '🌱', '#10B981', false, 3, $home->id);

        // ════════════════════════════════════════
        // CREATIVE & ARTS
        // ════════════════════════════════════════
        $creative = $this->create('Creative & Arts', '🎨', '#A855F7', true, $order++);
            $this->create('Photography', '📷', '#3B82F6', false, 1, $creative->id);
            $this->create('Writing',     '✍️', '#6366F1', false, 2, $creative->id);
            $this->create('Music',       '🎵', '#EF4444', false, 3, $creative->id);
            $this->create('Film & TV',   '🎬', '#FBBF24', false, 4, $creative->id);
            $this->create('Arts & Crafts','🖌️','#F472B6', false, 5, $creative->id);
            $this->create('Architecture','🏛️', '#64748B', false, 6, $creative->id);

            $design = $this->create('Design', '✨', '#EC4899', false, 7, $creative->id);
                $this->create('Graphic Design', '🖼️', '#F97316', false, 1, $design->id);
                $this->create('UI/UX Design',   '📱', '#8B5CF6', false, 2, $design->id);
                $this->create('Web Design',     '🌐', '#06B6D4', false, 3, $design->id);

        // ════════════════════════════════════════
        // EDUCATION & LEARNING
        // ════════════════════════════════════════
        $education = $this->create('Education & Learning', '📚', '#3B82F6', false, $order++);
            $this->create('Tutorials',         '📖', '#10B981', false, 1, $education->id);
            $this->create('How-To Guides',     '📝', '#06B6D4', false, 2, $education->id);
            $this->create('Online Courses',    '🎓', '#8B5CF6', false, 3, $education->id);
            $this->create('Study Tips',        '💡', '#FBBF24', false, 4, $education->id);
            $this->create('Career Advice',     '💼', '#10B981', false, 5, $education->id);
            $this->create('Skills Development','🛠️', '#F97316', false, 6, $education->id);

        // ════════════════════════════════════════
        // NEWS & OPINION
        // ════════════════════════════════════════
        $news = $this->create('News & Opinion', '📰', '#EF4444', false, $order++);
            $this->create('Current Events',    '🌍', '#06B6D4', false, 1, $news->id);
            $this->create('Politics',          '🏛️', '#6366F1', false, 2, $news->id);
            $this->create('Opinion & Editorial','💭', '#8B5CF6', false, 3, $news->id);
            $this->create('Analysis',          '🔍', '#14B8A6', false, 4, $news->id);
            $this->create('Interviews',        '🎤', '#F59E0B', false, 5, $news->id);

        // ════════════════════════════════════════
        // ENTERTAINMENT
        // ════════════════════════════════════════
        $entertainment = $this->create('Entertainment', '🎭', '#FBBF24', false, $order++);
            $this->create('Movies',        '🎥', '#EF4444', false, 1, $entertainment->id);
            $this->create('Books',         '📚', '#8B5CF6', false, 2, $entertainment->id);
            $this->create('TV Shows',      '📺', '#06B6D4', false, 3, $entertainment->id);
            $this->create('Celebrity News','⭐', '#F472B6', false, 4, $entertainment->id);
            $this->create('Podcasts',      '🎙️', '#F97316', false, 5, $entertainment->id);
            $this->create('Comics & Manga','📖', '#EC4899', false, 6, $entertainment->id);

        // ════════════════════════════════════════
        // SPORTS
        // ════════════════════════════════════════
        $sports = $this->create('Sports', '⚽', '#10B981', false, $order++);
            $this->create('Football',      '⚽', '#10B981', false, 1, $sports->id);
            $this->create('Basketball',    '🏀', '#F97316', false, 2, $sports->id);
            $this->create('Tennis',        '🎾', '#FBBF24', false, 3, $sports->id);
            $this->create('Running',       '🏃', '#06B6D4', false, 4, $sports->id);
            $this->create('Cycling',       '🚴', '#84CC16', false, 5, $sports->id);
            $this->create('Extreme Sports','🏂', '#EF4444', false, 6, $sports->id);
            $this->create('Sports News',   '📰', '#8B5CF6', false, 7, $sports->id);

        // ════════════════════════════════════════
        // SCIENCE & ENVIRONMENT
        // ════════════════════════════════════════
        $science = $this->create('Science & Environment', '🔬', '#14B8A6', false, $order++);
            $this->create('Science News',      '🧪', '#3B82F6', false, 1, $science->id);
            $this->create('Space & Astronomy', '🚀', '#6366F1', false, 2, $science->id);
            $this->create('Environment',       '🌍', '#10B981', false, 3, $science->id);
            $this->create('Climate Change',    '🌡️', '#EF4444', false, 4, $science->id);
            $this->create('Sustainability',    '♻️', '#84CC16', false, 5, $science->id);
            $this->create('Wildlife',          '🦁', '#F59E0B', false, 6, $science->id);

        // ════════════════════════════════════════
        // AUTOMOTIVE
        // ════════════════════════════════════════
        $automotive = $this->create('Automotive', '🚗', '#64748B', false, $order++);
            $this->create('Car Reviews',       '⭐', '#FBBF24', false, 1, $automotive->id);
            $this->create('Electric Vehicles', '⚡', '#10B981', false, 2, $automotive->id);
            $this->create('Motorcycles',       '🏍️', '#EF4444', false, 3, $automotive->id);
            $this->create('Auto Maintenance',  '🔧', '#F97316', false, 4, $automotive->id);

        $total = Category::count();
        $this->command->info("✅ Seeded {$total} categories successfully!");
    }

    private function create(
        string $name,
        string $icon,
        string $color,
        bool $featured,
        int $order,
        ?int $parentId = null
    ): Category {
        return Category::create([
            'name'        => $name,
            'slug'        => Str::slug($name),  // ← generate slug explicitly
            'icon'        => $icon,
            'color'       => $color,
            'is_featured' => $featured,
            'order'       => $order,
            'parent_id'   => $parentId,
        ]);
    }
}