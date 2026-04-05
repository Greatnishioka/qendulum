<?php

declare(strict_types=1);

namespace App\Domain\ValuableBook\ValueObject;

class ValuableBookIdentity
{
    public function __construct(
        private readonly ValuableBookSource $source,
        private readonly SourcePaperId $sourcePaperId,
    ) {
    }

    public function source(): ValuableBookSource
    {
        return $this->source;
    }

    public function sourcePaperId(): SourcePaperId
    {
        return $this->sourcePaperId;
    }

    public function equals(self $other): bool
    {
        return $this->source->value() === $other->source->value()
            && $this->sourcePaperId->value() === $other->sourcePaperId->value();
    }
}
