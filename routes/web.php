<?php

use App\Http\Controllers\FavoriteController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\Auth\LoginController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Routerの書き方ちょっと面白い
// ルートURLにアクセスしたとき、Inertiaを使ってHomeコンポーネントをレンダリングしてる
Route::get('/', fn() => Inertia::render('Home'));
Route::get('/search', HomeController::class)->name('api.search');

Route::post('/favorites', FavoriteController::class)->name('favorites.store'); // お気に入りの追加

// ログイン機能
Route::post('/login', LoginController::class)->name('login');
