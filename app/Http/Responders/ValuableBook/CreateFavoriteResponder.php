<?php

declare(strict_types=1);

namespace App\Http\Responders\ValuableBook;

use Illuminate\Http\RedirectResponse;

class CreateFavoriteResponder
{
    public function success(): RedirectResponse
    {
        return redirect()->back();
    }
}
