<?php

namespace App\Http\Requests\Auth;

use App\Application\Auth\Dto\LoginInputData;
use App\Domain\Auth\ValueObject\Email;
use App\Domain\Auth\ValueObject\Password;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Validation\ValidationException;

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

    public function messages(): array
    {
        return [
            'email.required' => 'メールアドレスを入力してください。',
            'email.email' => 'メールアドレスの形式が正しくありません。',

            'password.required' => 'パスワードを入力してください。',
            'password.string' => 'パスワードの形式が正しくありません。',
            'password.min' => 'パスワードは8文字以上で入力してください。',
            'password.max' => 'パスワードは128文字以内で入力してください。',
            'password.regex' => 'パスワードの形式が正しくありません。大文字、小文字、記号をそれぞれ1文字以上含めてください。',
        ];
    }

    public function attributes(): array
    {
        return [
            'email' => 'メールアドレス',
            'password' => 'パスワード',
        ];
    }

    protected function failedValidation(Validator $validator): void
    {
        $firstErrorMessage = $validator->errors()->first();

        throw ValidationException::withMessages([
            'message' => $firstErrorMessage,
        ]);
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
