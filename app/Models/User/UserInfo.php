<?php

namespace App\Models\User;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserInfo extends Model
{
    use HasFactory;

    protected $table = 'user_info';

    protected $fillable = [
        'user_id',
        'display_name',
        'profile_image_url',
    ];

    protected $casts = [
        'user_id' => 'integer',
        'display_name' => 'string',
        'profile_image_url' => 'string',
    ];
}
