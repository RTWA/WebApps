<?php

namespace App\Http\Requests;

use App\Models\User;
use App\Rules\MatchOldPassword;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;

class ChangePasswordRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize(Request $request)
    {
        if (Auth::id() != User::find($request->input('id'))->id) {
            return false;
        }

        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        return [
            'current_password' => ['required', new MatchOldPassword],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ];
    }
}
