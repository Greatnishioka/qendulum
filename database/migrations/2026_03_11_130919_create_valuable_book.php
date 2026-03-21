<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // このテーブルは全ての論文を保存とかではなく、ユーザーがお気に入り登録をした場合や、ユーザーがブックマークした時に保存するためのもの
        // arxivのAPIからお気に入りの一括取得などは難しそうだったので、qendulumの方で管理するようにする。
        Schema::create('valuable_book', function (Blueprint $table) {
            $table->id();
            $table->string('source', 32);
            $table->string('source_paper_id');
            $table->string('title');
            $table->text('abstract')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->timestamp('updated_at_source')->nullable();
            $table->string('pdf_url')->nullable();
            $table->string('abs_url')->nullable();
            $table->string('primary_category')->nullable();
            $table->json('categories')->nullable();
            $table->json('authors')->nullable();
            $table->json('raw_payload')->nullable();
            $table->timestamps();

            $table->unique(['source', 'source_paper_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('valuable_book');
    }
};
