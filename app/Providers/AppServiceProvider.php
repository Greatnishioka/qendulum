<?php

namespace App\Providers;

use App\Application\Shared\Transaction\TransactionManager;
use App\Application\ValuableBook\Port\FavoriteStore;
use App\Application\ValuableBook\Port\UserIdResolver;
use App\Domain\Auth\Repository\UserAuthRepository;
use App\Domain\Auth\Service\PasswordHasher;
use App\Domain\Auth\Service\UserAuthenticator;
use App\Domain\Search\Repository\PaperSearchGateway;
use App\Domain\ValuableBook\Repository\ValuableBookRepository;
use App\Infrastructure\Auth\EloquentUserAuthRepository;
use App\Infrastructure\Auth\LaravelPasswordHasher;
use App\Infrastructure\Search\ArxivPaperSearchGateway;
use App\Infrastructure\Shared\Transaction\DbTransactionManager;
use App\Infrastructure\User\DbUserIdResolver;
use App\Infrastructure\ValuableBook\DbFavoriteStore;
use App\Infrastructure\ValuableBook\DbValuableBookRepository;
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
        $this->app->bind(PaperSearchGateway::class, ArxivPaperSearchGateway::class);
        $this->app->bind(ValuableBookRepository::class, DbValuableBookRepository::class);
        $this->app->bind(UserIdResolver::class, DbUserIdResolver::class);
        $this->app->bind(FavoriteStore::class, DbFavoriteStore::class);
        $this->app->bind(TransactionManager::class, DbTransactionManager::class);
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
