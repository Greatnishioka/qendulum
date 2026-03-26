<?php

namespace App\Http\Resources\Auth;

use App\Domain\Auth\Entity\UserAuthEntity;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin UserAuthEntity
 */
class LoginResource extends JsonResource
{
    /**
     * @return array<string, int|string>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id(),
            'user_id' => $this->userId(),
            'email' => $this->email()->value(),
        ];
    }
}
