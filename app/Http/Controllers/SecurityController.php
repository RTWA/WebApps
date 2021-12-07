<?php

namespace App\Http\Controllers;

use App\Http\Requests\ChangePermissionRequest;
use App\Http\Requests\CreateGroupRequest;
use App\Http\Requests\DeleteGroupRequest;
use App\Http\Requests\RenameGroupRequest;
use App\Models\GroupToAzureGroup;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class SecurityController extends Controller
{
    /**
     * Retrieve a list of available Groups (Roles)
     */
    public function groups()
    {
        $groups = Role::with('permissions')->get();

        foreach ($groups as $group) {
            $group->users_count = User::whereHas('roles', function (Builder $query) use ($group) {
                $query->where('name', $group->name);
            })->count();
        }

        return response()->json(['success' => true, 'groups' => $groups], 201);
    }

    /**
     * Create a new group
     */
    public function createGroup(CreateGroupRequest $request)
    {
        $group = Role::create(['name' => $request->input('name'), 'guard_name' => 'web']);

        return response()->json([
            'success' => true,
            'message' => 'Group created successfully',
            'group' => $group
        ], 200);
    }

    /**
     * Rename a group
     */
    public function renameGroup(RenameGroupRequest $request)
    {
        $group = Role::where('name', '=', $request->input('old_name'))->first();

        // Check the group isn't "Administrators"
        if ($group->name === "Administrators") {
            return response()->json([
                'errors' => [
                    'old_name' => ['You cannot rename the Administrators Group']
                ]
            ], 422);
        }

        $group->name = $request->input('new_name');
        $group->save();

        return response()->json([
            'success' => true,
            'message' => 'Group renamed successfully',
            'group' => $group
        ], 200);
    }

    /**
     * Delete a group
     */
    public function deleteGroup(DeleteGroupRequest $request)
    {
        $group = Role::where('name', '=', $request->input('name'))->first();

        // Check the group isn't "Administrators"
        if ($group->name === "Administrators") {
            return response()->json([
                'errors' => [
                    'name' => ['You cannot delete the Administrators Group']
                ]
            ], 422);
        }

        $users = User::whereHas('roles', function (Builder $query) use ($group) {
            $query->where('name', $group->name);
        })->count();
        if ($users <> 0) {
            return response()->json([
                'errors' => [
                    'name' => ['Group contains members, remove members first']
                ]
            ], 422);
        }

        $group->delete();

        return response()->json([
            'success' => true,
            'message' => 'Group deleted successfully'
        ], 200);
    }

    /**
     * Get Azure group mappings
     */
    public function getGroupMappings()
    {
        $maps = GroupToAzureGroup::all();
        $mappings = [];

        foreach ($maps as $map) {
            $mappings[$map->role_id] = $map->azure_group_id;
        }

        return response()->json([
            'mappings' => $mappings
        ], 200);
    }

    /**
     * Sets an Azure group mapping
     */
    public function setGroupMapping(Request $request)
    {
        $group = $request->input('group_id');
        $azGroup = $request->input('azure_group_id');

        $current = GroupToAzureGroup::where('role_id', $group)->first();

        if ($current && $current->azure_group_id <> $azGroup) {
            $current->azure_group_id = $azGroup;
            $current->save();
        } elseif (!$current) {
            GroupToAzureGroup::create([
                'role_id' => $group,
                'azure_group_id' => $azGroup
            ]);
        }

        return response()->json(['success' => true], 200);
    }

    /**
     * Retreive a list of available Permissions
     */
    public function permissions()
    {
        $perms  = Permission::all();
        $permissions = [
            'admin'  => [
                'name'        => 'Administrative Options',
                'permissions' => [],
            ],
            'blocks' => [
                'name'        => 'Blocks Options',
                'permissions' => [],
            ],
            'apps'   => [
                'name'        => 'Apps Options',
                'permissions' => [],
            ],
        ];

        foreach ($perms as $perm) {
            if (substr($perm['name'], 0, 6) === "admin.") {
                $permissions['admin']['permissions'][] = $perm;
            }
            if (substr($perm['name'], 0, 7) === "blocks.") {
                $permissions['blocks']['permissions'][] = $perm;
            }
            if (substr($perm['name'], 0, 5) === "apps.") {
                $permissions['apps']['permissions'][] = $perm;
            }
        }

        return response()->json(['success' => true, 'permissions' => $permissions], 201);
    }

    /**
     * Update permissions for role
     */
    public function changePermission(ChangePermissionRequest $request)
    {
        $mode = $request->input('mode');
        $group = Role::where('id', '=', $request->input('group'))->first();
        $permission = Permission::where('id', '=', $request->input('perm'))->first();

        if ($mode == "add") {
            $group->givePermissionTo($permission);
        } elseif ($mode === "remove") {
            $group->revokePermissionTo($permission);
        }

        return response()->json(['success' => true], 201);
    }

    /**
     * Get a filtered list of permissions
     */
    public function searchPermissions(Request $request)
    {
        return response()->json([
            'success' => true,
            'permissions' => Permission::where('name', 'like', $request->input('permission'))->get()
        ], 200);
    }

    /**
     * Get a list of User who are permitted to 'x'
     */
    public function getPermittedUsers(Request $request)
    {
        if (!$request->input('isLike')) {
            $permissions = Permission::findByName($request->input('permission'));
        } else {
            $permissions = Permission::where('name', 'like', $request->input('permission'))->get();
        }

        return response()->json([
            'success' => true,
            'users' => User::with('permissions')->has('permissions')->permission($permissions)->get()
        ], 200);
    }

    /**
     * Toggle a User's Permission
     */
    public function toggleUserPermission(Request $request)
    {
        Auth::shouldUse('web');
        $user = User::find($request->input('user'));
        $permission = Permission::findById($request->input('permission'));

        if (!$user->hasPermissionTo($permission)) {
            $user->givePermissionTo($permission);
        } else {
            $user->revokePermissionTo($permission);
        }

        return response()->json([
            'success' => true,
            'user' => User::with('permissions')->where('id', $request->input('user'))->first()
        ], 201);
    }

    /**
     * Toggle a Group's (Role) Permission
     */
    public function toggleGroupPermission(Request $request)
    {
        Auth::shouldUse('web');
        $group = Role::findById($request->input('group'));
        $permission = Permission::findById($request->input('permission'));

        if (!$group->hasPermissionTo($permission)) {
            $group->givePermissionTo($permission);
        } else {
            $group->revokePermissionTo($permission);
        }

        return response()->json([
            'success' => true,
            'group' => Role::with('permissions')->where('id', $request->input('group'))->first()
        ], 201);
    }

    /**
     * Check the authenticated User has a Permission
     */
    public function checkUserPermission(Request $request)
    {
        return response()->json([
            'permission' => $request->input('permission'),
            'user_id' => Auth::id(),
            'has_permission' => Auth::user()->hasPermissionTo($request->input('permission'))
        ], 200);
    }
}
