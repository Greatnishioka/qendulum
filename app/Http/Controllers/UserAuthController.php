<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use Inertia\Inertia;
use Inertia\Response;

// models
use App\Models\User\UserAuth;

class UserAuthController extends Controller
{

    private UserAuth $userAuth;
    public function __construct(
        UserAuth $userAuth
    ) {
        $this->userAuth = $userAuth;
    }

    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request)
    {
        $validated = $request->validate([
            'email' => ['nullable', 'string', 'max:255'],
            'password' => ['nullable', 'string', 'max:255'],
        ]);



    }
}
