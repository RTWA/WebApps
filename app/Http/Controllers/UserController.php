<?php

namespace App\Http\Controllers;

use App\Http\Requests\AdminResetPasswordRequest;
use App\Http\Requests\ChangeGroupRequest;
use App\Http\Requests\ChangePasswordRequest;
use App\Http\Requests\CreateUserRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use LasseRafn\InitialAvatarGenerator\InitialAvatar;
use RobTrehy\LaravelUserPreferences\UserPreferences;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    /**
     * Retrieve all Users, including associated Groups (Roles)
     *
     * @return json array
     */
    public function allUsersWithGroups()
    {
        return response()->json([
            'success' => true,
            'users' => User::where('active', true)->with('roles')->orderBy('username', 'ASC')->get()
        ], 200);
    }

    /**
     * Retrieve all Users, including associated Groups (Roles)
     *
     * @return json array
     */
    public function allUsersWithGroupsAndDisabled()
    {
        return response()->json([
            'success' => true,
            'users' => User::with('roles')->orderBy('username', 'ASC')->get()
        ], 200);
    }

    /**
     * Retrieve only disabled Users, including associated Groups (Roles)
     *
     * @return json array
     */
    public function onlyDisabledUsersWithGroups()
    {
        return response()->json([
            'success' => true,
            'users' => User::where('active', false)
                ->with('roles')
                ->where('active', '=', false)
                ->orderBy('username', 'ASC')
                ->get()
        ], 200);
    }

    /**
     * Create a new user record
     *
     * @return json array
     */
    public function create(CreateUserRequest $request)
    {
        $user = User::create([
            'name' => $request->input('name'),
            'username' => $request->input('username'),
            'name' => $request->input('username'),
            'email' => $request->input('email'),
            'password' => Hash::make($request->input('password'))
        ]);
        $user->assignRole(Role::where('id', '=', $request->input('group'))->first());

        return response()->json([
            'success' => true,
            'message' => 'User created successfully',
            'user' => $user
        ], 200);
    }

    /**
     * Change the group (role) a user resides in
     *
     * @return json array
     */
    public function changeGroup(ChangeGroupRequest $request)
    {
        $user = User::where('username', '=', $request->input('username'))->first();
        $user->syncRoles([Role::where('id', '=', $request->input('group_id'))->first()]);

        return response()->json(['success' => true, 'message' => 'Group updated'], 200);
    }

    /**
     * Soft delete a User by setting active to false
     *
     * @return User
     */
    public function softDelete(User $user)
    {
        if ($user->azure_id === null && $user->hasRole('Administrators')) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot disable an internal administrator account'
            ], 405);
        }

        $user->active = false;
        $user->save();

        return response()->json(['success' => true, 'user' => $user], 200);
    }

    /**
     * Enable a soft deleted User
     *
     * @return User
     */
    public function undoDelete(User $user)
    {
        $user->active = true;
        $user->save();

        return response()->json(['success' => true, 'user' => $user], 200);
    }

    /**
     * Hard delete a User from the database
     */
    public function delete(User $user)
    {
        if ($user->azure_id === null && $user->hasRole('Administrators')) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot delete an internal administrator account'
            ], 405);
        }

        $user->delete();

        return response()->json(['success' => true], 200);
    }

    public function setPreference(Request $request)
    {
        UserPreferences::set($request->input('preference'), $request->input('value'));
    }

    public function getPhoto(User $user)
    {
        // @codeCoverageIgnoreStart
        if ($user->azure_id) {
            $photo = (new MSGraphController())->getUserPhoto($user->azure_id);

            if ($photo) {
                return response(base64_decode($photo))->header('Content-Type', 'image/png');
            }
        }
        // @codeCoverageIgnoreEnd

        return response(
            (new InitialAvatar())->name($user->name)->generate()->stream('png', 100)
        )->header('Content-Type', 'image/png');
    }

    public function changePassword(ChangePasswordRequest $request)
    {
        Auth::user()->password = Hash::make($request->input('password'));
        return response()->json(['success' => true], 200);
    }

    public function adminResetPassword(AdminResetPasswordRequest $request)
    {
        User::find($request->input('user_id'))->password = Hash::make($request->input('password'));
        return response()->json(['success' => true], 200);
    }
}
