<?php

namespace App\Http\Controllers\Install;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    /**
     * Display the Admin Creation page
     */
    public function administrator()
    {
        if (User::role('Administrators')->count() <> 0) {
            return response()->json([
                'exists' => true,
            ], 200);
        }

        return response()->json([
            'username' => 'administrator',
            'password' => ''
        ], 200);
    }

    /**
     * Create the administrator account
     */
    public function createAdministrator(Request $input)
    {
        $rules = [
            'username' => 'required|string|max:50',
            'password' => 'required|confirmed|min:6'
        ];
        $messages = [
            'required' => 'This field is required'
        ];

        $validatedData = $input->validate($rules, $messages);

        DB::table('users')->insert([
            'name' => 'Administrator',
            'username' => $validatedData['username'],
            'password' => Hash::make($validatedData['password'])
        ]);

        return response(null, 204);
    }
}
