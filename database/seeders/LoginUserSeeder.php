<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class LoginUserSeeder extends Seeder
{
    /**
     * Seed the application's database with a login-capable test user.
     */
    public function run(): void
    {
        DB::transaction(function () {
            $email = 'test@example.com';

            $userAuth = DB::table('user_auth')
                ->where('email', $email)
                ->first();

            if ($userAuth) {
                DB::table('user_auth')
                    ->where('id', $userAuth->id)
                    ->update([
                        'password' => Hash::make('password'),
                        'email_verified_at' => now(),
                        'updated_at' => now(),
                    ]);

                DB::table('user_info')->updateOrInsert(
                    ['user_id' => $userAuth->user_id],
                    [
                        'display_name' => 'Test User',
                        'profile_image_url' => null,
                        'updated_at' => now(),
                        'created_at' => now(),
                    ],
                );

                return;
            }

            $userId = DB::table('users')->insertGetId([
                'public_uuid' => (string) Str::uuid(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::table('user_auth')->insert([
                'user_id' => $userId,
                'email' => $email,
                'email_verified_at' => now(),
                'password' => Hash::make('password'),
                'remember_token' => Str::random(10),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::table('user_info')->insert([
                'user_id' => $userId,
                'display_name' => 'Test User',
                'profile_image_url' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        });
    }
}
