<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'admin@blogsite.com'],
            [
                'name' => 'Admin',
                'password' => Hash::make('admin1234?*'),
                'email_verified_at' => now(),
                'role' => 'admin',
                'is_active' => true,
            ]
        );
    }
}