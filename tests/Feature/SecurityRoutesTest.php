<?php

namespace Tests\Feature;

use App\Models\GroupToAzureGroup;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class SecurityRoutesTest extends TestCase
{
    use RefreshDatabase;

    public function testCanGetGroups()
    {
        $this->seed();

        Sanctum::actingAs(
            $user = User::find(1),
            ['*']
        );

        $response = $this->getJson('/api/groups');

        $response->assertSuccessful();
        $response->assertJsonFragment([
            'id' => 1,
            'name' => 'Administrators'
        ]);
    }

    public function testCanCreateANewGroup()
    {
        $this->seed();

        Sanctum::actingAs(
            $user = User::find(1),
            ['*']
        );

        $response = $this->postJson('/api/group', [
            'name' => 'Test New Group'
        ]);

        $response->assertSuccessful();
        $response->assertJsonFragment([
            'name' => 'Test New Group'
        ]);
    }

    public function testCannotCreateANewGroupWithoutPermission()
    {
        $this->seed();

        Sanctum::actingAs(
            $user = User::find(10),
            ['*']
        );

        $response = $this->postJson('/api/group', [
            'name' => 'Test New Group'
        ]);

        $response->assertStatus(403);
        $response->assertJsonFragment(['message' => "This action is unauthorized."]);
    }

    public function testCannotCreateANewGroupIfTheNameIsInUse()
    {
        $this->seed();

        Sanctum::actingAs(
            $user = User::find(1),
            ['*']
        );

        $response = $this->postJson('/api/group', [
            'name' => 'Administrators'
        ]);

        $response->assertStatus(422);
        $response->assertJsonFragment([
            "name" => ["The name has already been taken."]
        ]);
    }

    public function testCanRenameAGroup()
    {
        $this->seed();

        Sanctum::actingAs(
            $user = User::find(1),
            ['*']
        );

        Role::create([
            'name' => 'rename_me',
            'guard_name' => 'web'
        ]);

        $response = $this->patchJson('/api/group', [
            'old_name' => 'rename_me',
            'new_name' => 'This is the new name'
        ]);

        $response->assertSuccessful();
        $response->assertJsonFragment([
            'name' => 'This is the new name'
        ]);
    }

    public function testCannotRenameAGroupWithoutPermission()
    {
        $this->seed();

        Sanctum::actingAs(
            $user = User::find(10),
            ['*']
        );

        Role::create([
            'name' => 'rename_me',
            'guard_name' => 'web'
        ]);

        $response = $this->patchJson('/api/group', [
            'old_name' => 'rename_me',
            'new_name' => 'This is the new name'
        ]);

        $response->assertStatus(403);
        $response->assertJsonFragment(['message' => "This action is unauthorized."]);
    }

    public function testCannotRenameAGroupIfTheOldNameIsWrong()
    {
        $this->seed();

        Sanctum::actingAs(
            $user = User::find(1),
            ['*']
        );

        Role::create([
            'name' => 'rename_me',
            'guard_name' => 'web'
        ]);

        $response = $this->patchJson('/api/group', [
            'old_name' => 'wrong_name',
            'new_name' => 'This is the new name'
        ]);

        $response->assertStatus(422);
        $response->assertJsonFragment([
            'old_name' => ['Group not found']
        ]);
    }

    public function testCannotRenameTheAdministratorsGroup()
    {
        $this->seed();

        Sanctum::actingAs(
            $user = User::find(1),
            ['*']
        );

        $response = $this->patchJson('/api/group', [
            'old_name' => 'Administrators',
            'new_name' => 'This is the new name'
        ]);

        $response->assertStatus(422);
        $response->assertJsonFragment([
            'old_name' => ['You cannot rename the Administrators Group']
        ]);
    }

    public function testCanDeleteAGroup()
    {
        $this->seed();

        Sanctum::actingAs(
            $user = User::find(1),
            ['*']
        );

        Role::create([
            'name' => 'to_delete',
            'guard_name' => 'web'
        ]);

        $response = $this->deleteJson('/api/group', [
            'name' => 'to_delete'
        ]);

        $response->assertSuccessful();
        $response->assertJsonMissing([
            'name' => 'to_delete'
        ]);
    }

    public function testCannotDeleteAGroupWithoutPermission()
    {
        $this->seed();

        Sanctum::actingAs(
            $user = User::find(10),
            ['*']
        );

        Role::create([
            'name' => 'to_delete',
            'guard_name' => 'web'
        ]);

        $response = $this->deleteJson('/api/group', [
            'name' => 'to_delete'
        ]);

        $response->assertStatus(403);
        $response->assertJsonFragment(['message' => "This action is unauthorized."]);
    }

    public function testCannotDeleteTheAdministratorsGroup()
    {
        $this->seed();

        Sanctum::actingAs(
            $user = User::find(1),
            ['*']
        );

        $response = $this->deleteJson('/api/group', [
            'name' => 'Administrators'
        ]);

        $response->assertStatus(422);
        $response->assertJsonFragment([
            'name' => ['You cannot delete the Administrators Group']
        ]);
    }

    public function testCannotDeleteAGroupThatContainsMembers()
    {
        $this->seed();

        Sanctum::actingAs(
            $user = User::find(1),
            ['*']
        );

        // Change User to have group
        $user = User::find(10);
        $user->assignRole('Standard Users');

        $response = $this->deleteJson('/api/group', [
            'name' => 'Standard Users'
        ]);

        $response->assertStatus(422);
        $response->assertJsonFragment([
            'name' => ['Group contains members, remove members first']
        ]);
    }

    public function testCannotDeleteAGroupThatDoesNotExist()
    {
        $this->seed();

        Sanctum::actingAs(
            $user = User::find(1),
            ['*']
        );

        $response = $this->deleteJson('/api/group', [
            'name' => 'NotThere'
        ]);

        $response->assertStatus(422);
        $response->assertJsonFragment([
            'name' => ['Group not found']
        ]);
    }

    public function testCanGetPermissions()
    {
        $this->seed();

        Sanctum::actingAs(
            $user = User::find(1),
            ['*']
        );

        $response = $this->getJson('/api/permissions');

        $response->assertSuccessful();
        $response->assertJsonFragment([
            'id' => 1,
            'name' => 'admin.access'
        ]);
    }

    public function testCanGiveGroupPermission()
    {
        $this->seed();

        Sanctum::actingAs(
            $user = User::find(1),
            ['*']
        );

        $response = $this->postJson('/api/permissions', [
            'mode' => 'add',
            'group' => 1,
            'perm' => 2
        ]);

        $response->assertSuccessful();
        $response->assertJsonFragment(['success' => true]);
    }

    public function testCannotGiveGroupPermissionWithPermission()
    {
        $this->seed();

        Sanctum::actingAs(
            $user = User::find(10),
            ['*']
        );

        $response = $this->postJson('/api/permissions', [
            'mode' => 'add',
            'group' => 1,
            'perm' => 2
        ]);

        $response->assertStatus(403);
        $response->assertJsonFragment(['message' => "This action is unauthorized."]);
    }

    public function testCanRevokeGroupPermission()
    {
        $this->seed();

        Sanctum::actingAs(
            $user = User::find(1),
            ['*']
        );

        $response = $this->postJson('/api/permissions', [
            'mode' => 'remove',
            'group' => 1,
            'perm' => 2
        ]);

        $response->assertSuccessful();
        $response->assertJsonFragment(['success' => true]);
    }

    public function testCannotRevokeGroupPermissionWithoutPermission()
    {
        $this->seed();

        Sanctum::actingAs(
            $user = User::find(10),
            ['*']
        );

        $response = $this->postJson('/api/permissions', [
            'mode' => 'remove',
            'group' => 1,
            'perm' => 2
        ]);

        $response->assertStatus(403);
        $response->assertJsonFragment(['message' => "This action is unauthorized."]);
    }

    public function testCanSearchForAPermission()
    {
        $this->seed();

        Sanctum::actingAs(
            $user = User::find(1),
            ['*']
        );

        $response = $this->postJson('/api/permissions/search', [
            'permission' => 'test'
        ]);

        $response->assertSuccessful();
        $response->assertJsonFragment([
            'success' => true,
            'permissions' => []
        ]);
    }

    public function testCanGetAListOfUsersWhoArePermittedTo()
    {
        $this->seed();

        Sanctum::actingAs(
            $user = User::find(1),
            ['*']
        );

        Permission::create([
            'name' => 'test',
            'title' => 'PHPUnitTest',
            'guard_name' => 'sanctum'
        ]);

        $response = $this->postJson('/api/permitted', [
            'permission' => 'test'
        ]);

        $response->assertSuccessful();
        $response->assertJsonFragment([
            'success' => true,
            'users' => []
        ]);
    }

    public function testCanGetAListOfUsersWhoArePermittedToIsLike()
    {
        $this->seed();

        Sanctum::actingAs(
            $user = User::find(1),
            ['*']
        );
        Auth::shouldUse('web');

        Permission::create([
            'name' => 'test',
            'title' => 'PHPUnitTest',
            'guard_name' => 'web'
        ]);

        $response = $this->postJson('/api/permitted', [
            'permission' => 'te%',
            'isLike' => true
        ]);

        $response->assertSuccessful();
        $response->assertJsonFragment([
            'success' => true,
            'users' => []
        ]);
    }

    public function testCanSetAUserPermission()
    {
        $this->seed();

        Sanctum::actingAs(
            $user = User::find(1),
            ['*']
        );
        Auth::shouldUse('web');

        $permission = Permission::create([
            'name' => 'test',
            'title' => 'PHPUnitTest',
            'guard_name' => 'web'
        ]);

        $response = $this->postJson('/api/permissions/user', [
            'permission' => $permission->id,
            'user' => 1
        ]);

        $response->assertSuccessful();
        $response->assertJsonFragment([
            'success' => true
        ]);
        $this->assertTrue(
            User::find(1)->hasPermissionTo('test')
        );
    }

    public function testCanRemoveAUserPermission()
    {
        $this->seed();
        Sanctum::actingAs(
            $user = User::find(1),
            ['*']
        );
        Auth::shouldUse('web');


        $permission = Permission::create([
            'name' => 'test',
            'title' => 'PHPUnitTest',
            'guard_name' => 'web'
        ]);

        User::find(1)->givePermissionTo('test');

        $response = $this->postJson('/api/permissions/user', [
            'permission' => $permission->id,
            'user' => 1
        ]);

        $response->assertSuccessful();
        $response->assertJsonFragment([
            'success' => true
        ]);
        $this->assertTrue(
            !User::find(1)->hasPermissionTo('test')
        );
    }

    public function testCanSetAGroupPermission()
    {
        $this->seed();

        Sanctum::actingAs(
            $user = User::find(1),
            ['*']
        );
        Auth::shouldUse('web');

        $permission = Permission::create([
            'name' => 'test',
            'title' => 'PHPUnitTest',
            'guard_name' => 'web'
        ]);

        $response = $this->postJson('/api/permissions/group', [
            'permission' => $permission->id,
            'group' => 1
        ]);

        $response->assertSuccessful();
        $response->assertJsonFragment([
            'success' => true
        ]);
        $this->assertTrue(
            Role::findById(1)->hasPermissionTo('test')
        );
    }

    public function testCanRemoveAGroupPermission()
    {
        $this->seed();

        Sanctum::actingAs(
            $user = User::find(1),
            ['*']
        );
        Auth::shouldUse('web');

        $permission = Permission::create([
            'name' => 'test',
            'title' => 'PHPUnitTest',
            'guard_name' => 'web'
        ]);

        $role = Role::create([
            'name' => 'PHPUnit_Role'
        ]);

        $role->givePermissionTo($permission);

        $response = $this->postJson('/api/permissions/group', [
            'permission' => $permission->id,
            'group' => $role->id
        ]);

        $response->assertSuccessful();
        $response->assertJsonFragment([
            'success' => true,
            'permissions' => []
        ]);
    }

    public function testCanGetAzureGroupMappings()
    {
        $this->seed();

        Sanctum::actingAs(
            $user = User::find(1),
            ['*']
        );

        $role_id = Role::where('name', 'Standard Users')->where('guard_name', 'web')->first()->id;

        GroupToAzureGroup::create([
            'role_id' => $role_id,
            'azure_group_id' => 'PHPUnit_Test_Group'
        ]);

        $response = $this->getJson('/api/group/mappings');

        $response->assertSuccessful();
        $response->assertJsonFragment([
            'mappings' => [
                $role_id => "PHPUnit_Test_Group"
            ]
        ]);
    }

    public function testCanSetAnAzureGroupMapping()
    {
        $this->seed();

        Sanctum::actingAs(
            $user = User::find(1),
            ['*']
        );

        $role_id = Role::where('name', 'Standard Users')->where('guard_name', 'web')->first()->id;

        GroupToAzureGroup::create([
            'role_id' => $role_id,
            'azure_group_id' => 'PHPUnit_Test_Group'
        ]);

        $response = $this->postJson('/api/group/mapping', [
            'group_id' => $role_id,
            'azure_group_id' => 'PHPUnit_Second_Test_Group'
        ]);

        $response->assertSuccessful();
        $response->assertJsonFragment([
            'success' => true
        ]);
    }

    public function testCanSetANewAzureGroupMapping()
    {
        $this->seed();

        Sanctum::actingAs(
            $user = User::find(1),
            ['*']
        );

        $role_id = Role::where('name', 'Standard Users')->where('guard_name', 'web')->first()->id;

        $response = $this->postJson('/api/group/mapping', [
            'group_id' => $role_id,
            'azure_group_id' => 'PHPUnit_Second_Test_Group'
        ]);

        $response->assertSuccessful();
        $response->assertJsonFragment([
            'success' => true
        ]);
    }

    public function testCanCheckAUserHasPermissionTo()
    {
        $this->seed();

        Sanctum::actingAs(
            $user = User::find(1),
            ['*']
        );

        $response = $this->postJson('/api/permission/check', [
            'permission' => 'admin.access'
        ]);

        $response->assertSuccessful();
        $response->assertJsonFragment([
            'user_id' => 1,
            'has_permission' => true
        ]);
    }

    public function testCanCheckAUserDoesntHavePermissionTo()
    {
        $this->seed();

        Sanctum::actingAs(
            $user = User::find(5),
            ['*']
        );

        $response = $this->postJson('/api/permission/check', [
            'permission' => 'admin.access'
        ]);

        $response->assertSuccessful();
        $response->assertJsonFragment([
            'user_id' => 5,
            'has_permission' => false
        ]);
    }

    public function testCanCheckAUserIsInGroup()
    {
        $this->seed();

        Sanctum::actingAs(
            $user = User::find(1),
            ['*']
        );

        $response = $this->postJson('/api/group/check', [
            'group' => 'Administrators'
        ]);

        $response->assertSuccessful();
        $response->assertJsonFragment([
            'user_id' => 1,
            'in_group' => true
        ]);
    }

    public function testCanCheckAUserIsntInAGroup()
    {
        $this->seed();

        Sanctum::actingAs(
            $user = User::find(5),
            ['*']
        );

        $response = $this->postJson('/api/group/check', [
            'permission' => 'Administrators'
        ]);

        $response->assertSuccessful();
        $response->assertJsonFragment([
            'user_id' => 5,
            'in_group' => false
        ]);
    }
}
