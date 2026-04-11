<?php

declare(strict_types=1);

namespace App\Infrastructure\Shared\Transaction;

use App\Application\Shared\Transaction\TransactionManager;
use Illuminate\Support\Facades\DB;

class DbTransactionManager implements TransactionManager
{
    public function run(callable $callback): mixed
    {
        return DB::transaction($callback);
    }
}
