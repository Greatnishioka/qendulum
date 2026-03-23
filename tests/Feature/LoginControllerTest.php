<?php

namespace Tests\Feature;

use App\Models\User\UserAuth;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Tests\TestCase;

class LoginControllerTest extends TestCase
{
    use RefreshDatabase;

    /**
     * 仕様:
     * 正しいメールアドレスとパスワードが送信された場合、
     * web ガードでログインを成立させて直前ページへリダイレクトする。
     */
    public function test_it_logs_in_with_valid_credentials(): void
    {
        $userId = DB::table('users')->insertGetId([
            'public_uuid' => (string) Str::uuid(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $userAuthId = DB::table('user_auth')->insertGetId([
            'user_id' => $userId,
            'email' => 'test@example.com',
            'password' => Hash::make('password'),
            'remember_token' => Str::random(10),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $response = $this
            ->from('/')
            ->post(route('login'), [
                'email' => 'test@example.com',
                'password' => 'password',
            ]);

        $response->assertRedirect('/');
        $this->assertAuthenticatedAs(UserAuth::findOrFail($userAuthId), 'web');
    }

    /**
     * 仕様:
     * 認証情報が不正な場合はログインさせず、
     * email フィールドに認証エラーを積んで直前ページへ戻す。
     */
    public function test_it_rejects_invalid_credentials(): void
    {
        $userId = DB::table('users')->insertGetId([
            'public_uuid' => (string) Str::uuid(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('user_auth')->insert([
            'user_id' => $userId,
            'email' => 'test@example.com',
            'password' => Hash::make('password'),
            'remember_token' => Str::random(10),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $response = $this
            ->from('/')
            ->post(route('login'), [
                'email' => 'test@example.com',
                'password' => 'wrong-password',
            ]);

        $response
            ->assertRedirect('/')
            ->assertSessionHasErrors([
                'email' => 'メールアドレスまたはパスワードが正しくありません。',
            ]);

        $this->assertGuest('web');
    }
}
