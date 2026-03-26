<?php

use App\Http\Actions\ValuableBook\FavoriteAction;
use App\Http\Actions\Search\SearchAction;
use App\Http\Actions\Auth\LoginAction;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Routerの書き方ちょっと面白い
// ルートURLにアクセスしたとき、Inertiaを使ってHomeコンポーネントをレンダリングしてる
Route::get('/', fn() => Inertia::render('Home'));
Route::get('/search', SearchAction::class)->name('api.search');

Route::post('/favorites', FavoriteAction::class)->name('favorites.store'); // お気に入りの追加

// ログイン機能
Route::post('/login', LoginAction::class)->name('login');
