<?php

use App\Http\Controllers\HomeController;
use Illuminate\Support\Facades\Route;

use Inertia\Inertia;

// Routerの書き方ちょっと面白い
// ルートURLにアクセスしたとき、Inertiaを使ってHomeコンポーネントをレンダリングしてる
Route::get('/', fn () => Inertia::render('Home'));
Route::group(['prefix' => 'api/v1'], function () {
    Route::get('/search', HomeController::class)->name('api.search');
});