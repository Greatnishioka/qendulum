<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class UserValuableBookFavorite extends Model
{
    use HasFactory;

    protected $table = 'user_valuable_book_favorite';


    protected $fillable = [
        'user_id',
        'valuable_book_id',
    ];

    protected $casts = [
        'user_id' => 'integer',
        'valuable_book_id' => 'integer',
    ];
}
