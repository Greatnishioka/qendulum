<?php

namespace App\Providers;

use App\Domain\Auth\Repository\UserAuthRepository;
use App\Domain\Auth\Service\PasswordHasher;
use App\Domain\Auth\Service\UserAuthenticator;
use App\Application\ValuableBook\Contract\CreateFavoriteGateway;
use App\Application\ValuableBook\Contract\SearchArxivGateway;
use App\Infrastructure\Auth\EloquentUserAuthRepository;
use App\Infrastructure\Auth\LaravelPasswordHasher;
use App\Infrastructure\ValuableBook\ArxivSearchGateway;
use App\Infrastructure\ValuableBook\DbValuableBookInfrastructure;
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
        $this->app->bind(CreateFavoriteGateway::class, DbValuableBookInfrastructure::class);
        $this->app->bind(SearchArxivGateway::class, ArxivSearchGateway::class);
        $this->app->singleton(UserAuthenticator::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
