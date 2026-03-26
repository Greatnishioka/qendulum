<?php

declare(strict_types=1);

namespace App\Domain\ValuableBook\Repository;

use App\Domain\ValuableBook\Entity\ValuableBookEntity;

interface ValuableBookRepository
{
    public function save(ValuableBookEntity $valuableBook): ValuableBookEntity;
}
