<?php

namespace App\Http\Requests\Auth;

use App\Application\Auth\Dto\LoginInputData;
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
            'password' => ['required', 'string'],
        ];
    }

    public function toInputData(): LoginInputData
    {
        return new LoginInputData(
            email: (string) $this->validated('email'),
            password: (string) $this->validated('password'),
        );
    }

    public function remember(): bool
    {
        return $this->boolean('remember');
    }
}
