<?php

use App\Http\Controllers\HomeController;
use Illuminate\Support\Facades\Route;

Route::get('/', HomeController::class)->name('home');

use Inertia\Inertia;

// Routerの書き方ちょっと面白い
// ルートURLにアクセスしたとき、Inertiaを使ってHomeコンポーネントをレンダリングしてる
Route::get('/', fn () => Inertia::render('Home'));
Route::group(['prefix' => 'api/v1'], function () {
    Route::get('/search', [HomeController::class, 'search']);
});