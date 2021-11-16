<?php

namespace App\Http\Controllers\Install;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Routing\Redirector;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    /**
     * Display the Admin Creation page
     */
    public function administrator()
    {
        if (User::role('Administrators')->count() <> 0) {
            return view('install.adminexists');
        }

        $fields = [
            'username' => 'administrator',
            'password' => ''
        ];

        return view('install.admin', compact('fields'));
    }

    /**
     * Create the administrator account
     */
    public function createAdministrator(Request $input, Redirector $redirect)
    {
        $rules = [
            'username' => 'required|string|max:50',
            'password' => 'required|confirmed|min:6'
        ];
        $messages = [
            'required' => 'This field is required'
        ];

        $fields = $input->all();
        $validator = Validator::make($fields, $rules, $messages);

        if ($validator->fails()) {
            $errors = $validator->errors();
            return view('install.admin', compact('errors', 'fields'));
        }

        DB::table('users')->insert([
            'name' => 'Administrator',
            'username' => $fields['username'],
            'password' => Hash::make($fields['password'])
        ]);

        return $redirect->route('Install::final');
    }
}
