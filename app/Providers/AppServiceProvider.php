<?php

namespace App\Providers;

use App\Domain\Auth\Repository\UserAuthRepository;
use App\Domain\Auth\Service\PasswordHasher;
use App\Infrastructure\Auth\EloquentUserAuthRepository;
use App\Infrastructure\Auth\LaravelPasswordHasher;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(UserAuthRepository::class, EloquentUserAuthRepository::class);
        $this->app->bind(PasswordHasher::class, LaravelPasswordHasher::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
