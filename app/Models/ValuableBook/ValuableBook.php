<?php

namespace App\Models\ValuableBook;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ValuableBook extends Model
{
    use HasFactory;

    protected $table = 'valuable_book';

    protected $fillable = [
        'source',
        'source_paper_id',
        'title',
        'abstract',
        'published_at',
        'updated_at_source',
        'pdf_url',
        'abs_url',
        'primary_category',
        'categories',
        'authors',
        'raw_payload',
    ];

    protected $casts = [
        'source' => 'string',
        'source_paper_id' => 'string',
        'title' => 'string',
        'abstract' => 'string',
        'published_at' => 'datetime',
        'updated_at_source' => 'datetime',
        'pdf_url' => 'string',
        'abs_url' => 'string',
        'primary_category' => 'string',
        'categories' => 'array',
        'authors' => 'array',
        'raw_payload' => 'array',
    ];
}
