<?php

declare(strict_types=1);

namespace App\Infrastructure\ValuableBook;

use App\Domain\ValuableBook\Entity\ValuableBookEntity;
use App\Domain\ValuableBook\Repository\ValuableBookRepository;
use App\Models\ValuableBook\ValuableBook;

class DbValuableBookRepository implements ValuableBookRepository
{
    public function save(ValuableBookEntity $valuableBook): ValuableBookEntity
    {
        $model = ValuableBook::query()->updateOrCreate(
            [
                'source' => $valuableBook->source()->value(),
                'source_paper_id' => $valuableBook->sourcePaperId()->value(),
            ],
            [
                'title' => $valuableBook->title()->value(),
                'abstract' => $valuableBook->abstract(),
                'published_at' => $valuableBook->publishedAt(),
                'updated_at_source' => $valuableBook->updatedAtSource(),
                'pdf_url' => $valuableBook->pdfUrl(),
                'abs_url' => $valuableBook->absUrl(),
                'primary_category' => $valuableBook->primaryCategory(),
                'categories' => $valuableBook->categories(),
                'authors' => $valuableBook->authors(),
                'raw_payload' => $valuableBook->rawPayload(),
            ],
        );

        return $valuableBook->withId((int) $model->id);
    }
}
