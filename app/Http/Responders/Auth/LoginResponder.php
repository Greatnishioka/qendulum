<?php

declare(strict_types=1);

namespace App\Http\Responders\Auth;

use App\Application\Auth\Dto\AuthenticatedUser;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;

class LoginResponder
{
    public function success(LoginRequest $request, AuthenticatedUser $authenticatedUser): RedirectResponse
    {
        Auth::guard('web')->loginUsingId($authenticatedUser->authId, remember: $request->remember());
        $request->session()->regenerate();

        return redirect()->back();
    }
}
