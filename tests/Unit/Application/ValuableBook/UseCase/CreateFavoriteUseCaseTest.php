<?php

namespace Tests\Unit\Application\ValuableBook\UseCase;

use App\Application\Shared\Transaction\TransactionManager;
use App\Application\ValuableBook\Dto\CreateFavoriteInputData;
use App\Application\ValuableBook\Port\FavoriteStore;
use App\Application\ValuableBook\Port\UserIdResolver;
use App\Application\ValuableBook\UseCase\CreateFavoriteUseCase;
use App\Domain\User\ValueObject\UserId;
use App\Domain\User\ValueObject\UserPublicUuid;
use App\Domain\ValuableBook\Entity\ValuableBookEntity;
use App\Domain\ValuableBook\Factory\ValuableBookFactory;
use App\Domain\ValuableBook\Repository\ValuableBookRepository;
use App\Domain\ValuableBook\ValueObject\SourcePaperId;
use App\Domain\ValuableBook\ValueObject\ValuableBookIdentity;
use App\Domain\ValuableBook\ValueObject\ValuableBookSource;
use PHPUnit\Framework\TestCase;

class CreateFavoriteUseCaseTest extends TestCase
{
    public function test_it_persists_book_and_registers_favorite_by_identity(): void
    {
        $valuableBookRepository = new SpyValuableBookRepository();
        $favoriteStore = new SpyFavoriteStore();

        $useCase = new CreateFavoriteUseCase(
            new ValuableBookFactory(),
            $valuableBookRepository,
            new FixedUserIdResolver(UserId::fromInt(42)),
            $favoriteStore,
            new ImmediateTransactionManager(),
        );

        $useCase->__invoke(new CreateFavoriteInputData(
            userPublicUuid: ' user-uuid ',
            source: ' arxiv ',
            sourcePaperId: ' paper-id ',
            title: ' Sample Title ',
            abstract: 'Summary',
            publishedAt: null,
            updatedAtSource: null,
            pdfUrl: null,
            absUrl: null,
            primaryCategory: 'cs.AI',
            authors: ['Alice'],
            categories: ['cs.AI'],
            rawPayload: ['id' => 'paper-id'],
        ));

        $this->assertNotNull($valuableBookRepository->savedBook);
        $this->assertSame('arxiv', $valuableBookRepository->savedBook->source()->value());
        $this->assertSame('paper-id', $valuableBookRepository->savedBook->sourcePaperId()->value());
        $this->assertSame(42, $favoriteStore->storedUserId?->value());
        $this->assertNotNull($favoriteStore->storedIdentity);
        $this->assertTrue($favoriteStore->storedIdentity->equals(
            new ValuableBookIdentity(
                ValuableBookSource::fromString('arxiv'),
                SourcePaperId::fromString('paper-id'),
            ),
        ));
    }
}

class SpyValuableBookRepository implements ValuableBookRepository
{
    public ?ValuableBookEntity $savedBook = null;

    public function upsert(ValuableBookEntity $valuableBook): ValuableBookEntity
    {
        $this->savedBook = $valuableBook;

        return $valuableBook->withId(1);
    }
}

class FixedUserIdResolver implements UserIdResolver
{
    public function __construct(
        private readonly UserId $userId,
    ) {
    }

    public function resolve(UserPublicUuid $userPublicUuid): UserId
    {
        return $this->userId;
    }
}

class SpyFavoriteStore implements FavoriteStore
{
    public ?UserId $storedUserId = null;

    public ?ValuableBookIdentity $storedIdentity = null;

    public function store(UserId $userId, ValuableBookIdentity $valuableBookIdentity): void
    {
        $this->storedUserId = $userId;
        $this->storedIdentity = $valuableBookIdentity;
    }
}

class ImmediateTransactionManager implements TransactionManager
{
    public function run(callable $callback): mixed
    {
        return $callback();
    }
}
