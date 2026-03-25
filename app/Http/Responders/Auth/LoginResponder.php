<?php

namespace App\Http\Responders\Auth;

use App\Http\Requests\Auth\LoginRequest;
use App\Http\Resources\Auth\LoginResource;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class LoginResponder
{
    public function success(LoginRequest $request, LoginResource $resource): RedirectResponse
    {
        /** @var array{id:int,user_id:int,email:string} $payload */
        $payload = $resource->resolve($request);

        Auth::guard('web')->loginUsingId($payload['id'], remember: $request->remember());
        $request->session()->regenerate();

        return redirect()->back();
    }

    public function invalidCredentials(): never
    {
        throw ValidationException::withMessages([
            'email' => 'メールアドレスまたはパスワードが正しくありません。',
        ]);
    }
}
