<?php

namespace App\Http\Requests\Auth;

use App\Application\Auth\Dto\LoginInputData;
use App\Domain\Auth\ValueObject\Email;
use App\Domain\Auth\ValueObject\Password;
use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'email' => ['required', 'email'],
            'password' => [
                'required',
                'string',
                'min:8',
                'max:128',
                'regex:/[A-Z]/',
                'regex:/[a-z]/',
                'regex:/[^a-zA-Z0-9]/',
            ],
        ];
    }

    public function toInputData(): LoginInputData
    {
        return new LoginInputData(
            email: Email::fromString((string) $this->validated('email')),
            password: Password::fromString((string) $this->validated('password')),
        );
    }

    public function remember(): bool
    {
        return $this->boolean('remember');
    }
}
