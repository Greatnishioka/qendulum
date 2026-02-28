<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Routerの書き方ちょっと面白い
// ルートURLにアクセスしたとき、Inertiaを使ってHomeコンポーネントをレンダリングしてる
Route::get('/', fn () => Inertia::render('Home'));
