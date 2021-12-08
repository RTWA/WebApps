<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use App\Models\User;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Hash;
use RobTrehy\LaravelUserPreferences\UserPreferences;
use Tests\TestCase;

class UserRoutesTest extends TestCase
{
    use RefreshDatabase;

    public function setUp(): void
    {
        parent::setUp();

        if (!file_exists(storage_path('webapps/installed.json'))) {
            file_put_contents(
                storage_path('webapps/installed.json'),
                json_encode([
                    'version' => '0.0.0',
                ])
            );
        }
    }

    public function tearDown(): void
    {
        if (file_exists(storage_path('webapps/installed.json'))) {
            unlink(storage_path('webapps/installed.json'));
        }

        parent::tearDown();
    }

    public function testCanGetUsersList()
    {
        $this->seed();

        Sanctum::actingAs(
            $user = User::find(1),
            ['*']
        );

        $response = $this->getJson('/api/users');

        $response->assertSuccessful();
        $response->assertJsonFragment(['success' => true]);
    }

    public function testCanGetUsersListWithGroupsAndDisabled()
    {
        $this->seed();

        Sanctum::actingAs(
            $user = User::find(1),
            ['*']
        );

        $response = $this->getJson('/api/users/all');

        $response->assertSuccessful();
        $response->assertJsonFragment(['success' => true]);
    }

    public function testCanGetDisabledUsersListWithGroups()
    {
        $this->seed();

        Sanctum::actingAs(
            $user = User::find(1),
            ['*']
        );

        $response = $this->getJson('/api/users/disabled');

        $response->assertSuccessful();
        $response->assertJsonFragment(['success' => true]);
    }

    public function testCanSoftDeleteAUser()
    {
        $this->seed();

        Sanctum::actingAs(
            $user = User::find(1),
            ['*']
        );

        $response = $this->deleteJson('/api/user/10');

        $response->assertSuccessful();
        $response->assertJsonFragment([
            'success' => true,
            'active' => false
        ]);
    }

    public function testCannotSoftDeleteAnAdministrator()
    {
        $this->seed();

        Sanctum::actingAs(
            $user = User::find(1),
            ['*']
        );

        $response = $this->deleteJson('/api/user/1');

        $response->assertStatus(405);
        $response->assertJsonFragment(['message' => 'You cannot disable an internal administrator account']);
    }

    public function testCanReactivateASoftDeletedUser()
    {
        $this->seed();

        Sanctum::actingAs(
            $user = User::find(1),
            ['*']
        );
        $user = User::find(10);
        $user->active = false;
        $user->save();

        $response = $this->getJson('/api/user/10/enable');

        $response->assertSuccessful();
        $response->assertJsonFragment([
            'success' => true,
            'active' => true
        ]);
    }

    public function testCanHardDeleteAUser()
    {
        $this->seed();

        Sanctum::actingAs(
            $user = User::find(1),
            ['*']
        );

        $response = $this->deleteJson('/api/user/10/hard');

        $response->assertSuccessful();
        $response->assertJsonFragment([
            'success' => true
        ]);
    }

    public function testCannotHardDeleteAnAdministrator()
    {
        $this->seed();

        Sanctum::actingAs(
            $user = User::find(1),
            ['*']
        );

        $response = $this->deleteJson('/api/user/1/hard');

        $response->assertStatus(405);
        $response->assertJsonFragment(['message' => 'You cannot delete an internal administrator account']);
    }

    public function testCanChangeUserGroup()
    {
        $this->seed();

        Sanctum::actingAs(
            $user = User::find(1),
            ['*']
        );

        // Create a test user and set as Admin role
        $group = Role::create([
            'name' => '_TEST_',
            'guard_name' => 'web'
        ]);
        $user = User::create([
            'name' => 'Unit Test User',
            'username' => 'utu',
            'password' => Hash::make('123456'),
            'email' => 'test@testing.local'
        ]);
        $user->syncRoles([Role::Where('id', '=', 9999)->first()]);

        // Change the role via API
        $response = $this->postJson('/api/user/group', [
            'username' => 'utu',
            'group_id' => $group->id
        ]);

        $response->assertSuccessful();
        $response->assertJsonFragment(['success' => true]);
        $response->assertJsonFragment(['message' => "Group updated"]);
    }

    public function testCannotChangeUserGroupWithoutPermission()
    {
        $this->seed();

        Sanctum::actingAs(
            $user = User::find(10),
            ['*']
        );

        // Create a test user and set as Admin role
        $group = Role::create([
            'name' => '_TEST_',
            'guard_name' => 'web'
        ]);
        $user = User::create([
            'name' => 'Unit Test User',
            'username' => 'utu',
            'password' => Hash::make('123456'),
            'email' => 'test@testing.local'
        ]);
        $user->syncRoles([Role::Where('id', '=', 9999)->first()]);

        // Change the role via API
        $response = $this->postJson('/api/user/group', [
            'username' => 'utu',
            'group_id' => $group->id
        ]);

        $response->assertStatus(403);
        $response->assertJsonFragment(['message' => "This action is unauthorized."]);
    }

    public function testCanCreateAUser()
    {
        $this->seed();

        Sanctum::actingAs(
            $user = User::find(1),
            ['*']
        );

        $response = $this->postJson('/api/user', [
            'name' => 'Testing User',
            'username' => 'testing',
            'email' => 'test@test.local',
            'password' => 'Password123',
            'password_confirmation' => 'Password123',
            'group' => 1
        ]);

        $response->assertSuccessful();
        $response->assertJsonFragment(['success' => true]);
    }

    public function testCannotCreateAUserWithoutPermission()
    {
        $this->seed();

        Sanctum::actingAs(
            $user = User::find(10),
            ['*']
        );

        $response = $this->postJson('/api/user', [
            'name' => 'Testing User',
            'username' => 'testing',
            'email' => 'test@test.local',
            'password' => 'Password123',
            'password_confirmation' => 'Password123',
            'group' => 1
        ]);

        $response->assertStatus(403);
        $response->assertJsonFragment(['message' => "This action is unauthorized."]);
    }

    public function testCannotCreateAUserWithAnAlreadyInUseUsername()
    {
        $this->seed();

        Sanctum::actingAs(
            $user = User::find(1),
            ['*']
        );

        $response = $this->postJson('/api/user', [
            'name' => 'Testing User',
            'username' => 'test_user',
            'email' => 'test@test.local',
            'password' => 'Password123',
            'password_confirmation' => 'Password123',
            'group' => 1
        ]);

        $response->assertStatus(422);
        $response->assertJsonFragment(["username" => ["The username has already been taken."]]);
    }

    public function testCanSetAUserPreference()
    {
        $this->seed();

        Sanctum::actingAs(
            $user = User::find(1),
            ['*']
        );

        $response = $this->putJson('/api/user/preference', [
            'preference' => 'Test Preference',
            'value' => 'test value'
        ]);

        $response->assertSuccessful();
        $this->assertTrue(
            UserPreferences::get('Test Preference') === 'test value'
        );
    }

    public function testUserCanChangeTheirPassword()
    {
        $this->seed();

        Sanctum::actingAs(
            $user = User::find(1),
            ['*']
        );

        $response = $this->postJson('/api/user/password', [
            'id' => 1,
            'current_password' => '1234',
            'password' => 'NewPassword1',
            'password_confirmation' => 'NewPassword1'
        ]);

        $response->assertSuccessful();
    }

    public function testUserCannotChangeTheirPasswordIfTheirCurrentPasswordIsIncorrect()
    {
        $this->seed();

        Sanctum::actingAs(
            $user = User::find(1),
            ['*']
        );

        $response = $this->postJson('/api/user/password', [
            'id' => 1,
            'current_password' => '12345',
            'password' => 'NewPassword1',
            'password_confirmation' => 'NewPassword1'
        ]);

        $response->assertStatus(422);
        $response->assertJson([
            'errors' => [
                'current_password' => [
                    'The current password must match your current password.'
                ]
            ]
        ]);
    }

    public function testUserCannotChangeTheirPasswordIfTheyDoNotMatch()
    {
        $this->seed();

        Sanctum::actingAs(
            $user = User::find(1),
            ['*']
        );

        $response = $this->postJson('/api/user/password', [
            'id' => 1,
            'current_password' => '1234',
            'password' => 'NewPassword1',
            'password_confirmation' => 'NewPassword1234'
        ]);

        $response->assertStatus(422);
        $response->assertJson([
            'errors' => [
                'password' => [
                    'The password confirmation does not match.'
                ]
            ]
        ]);
    }

    public function testUserCannotChangeTheirPasswordIfItIsDoesNotMeetTheRequirements()
    {
        $this->seed();

        Sanctum::actingAs(
            $user = User::find(1),
            ['*']
        );

        $response = $this->postJson('/api/user/password', [
            'id' => 1,
            'current_password' => '1234',
            'password' => 'abc',
            'password_confirmation' => 'abc'
        ]);

        $response->assertStatus(422);
        $response->assertJson([
            'errors' => [
                'password' => [
                    'The password must be at least 8 characters.'
                ]
            ]
        ]);
    }

    public function testUserCannotChangeAnotherUsersPassword()
    {
        $this->seed();

        Sanctum::actingAs(
            $user = User::find(1),
            ['*']
        );

        $response = $this->postJson('/api/user/password', [
            'id' => 10,
            'current_password' => '1234',
            'password' => 'NewPassword1',
            'password_confirmation' => 'NewPassword1'
        ]);

        $response->assertStatus(403);
        $response->assertJson([
            'message' => 'This action is unauthorized.'
        ]);
    }

    public function testAdminUserCanResetAPassword()
    {
        $this->seed();

        Sanctum::actingAs(
            $user = User::find(1),
            ['*']
        );

        $response = $this->postJson('/api/admin/user.password/reset', [
            'user_id' => 10,
            'password' => 'NewPassword1',
            'password_confirmation' => 'NewPassword1'
        ]);
        $response->assertSuccessful();
    }

    public function testAdminUserCannotResetTheirOwnPassword()
    {
        $this->seed();

        Sanctum::actingAs(
            $user = User::find(1),
            ['*']
        );

        $response = $this->postJson('/api/admin/user.password/reset', [
            'user_id' => 1,
            'password' => 'NewPassword1',
            'password_confirmation' => 'NewPassword1'
        ]);

        $response->assertStatus(403);
        $response->assertJson([
            'message' => 'This action is unauthorized.'
        ]);
    }

    public function testNonAdminUserCannotResetAUsersPassword()
    {
        $this->seed();

        Sanctum::actingAs(
            $user = User::find(10),
            ['*']
        );

        $response = $this->postJson('/api/admin/user.password/reset', [
            'user_id' => 100,
            'password' => 'NewPassword1',
            'password_confirmation' => 'NewPassword1'
        ]);

        $response->assertStatus(403);
        $response->assertJson([
            'message' => 'This action is unauthorized.'
        ]);
    }

    public function testAdminUserCannotResetAPasswordIfTheyDoNotMatch()
    {
        $this->seed();

        Sanctum::actingAs(
            $user = User::find(1),
            ['*']
        );

        $response = $this->postJson('/api/admin/user.password/reset', [
            'user_id' => 10,
            'password' => 'NewPassword1',
            'password_confirmation' => 'NewPassword1234'
        ]);

        $response->assertStatus(422);
        $response->assertJson([
            'errors' => [
                'password' => [
                    'The password confirmation does not match.'
                ]
            ]
        ]);
    }

    public function testAdminUserCannotResetAPasswordIfItIsDoesNotMeetTheRequirements()
    {
        $this->seed();

        Sanctum::actingAs(
            $user = User::find(1),
            ['*']
        );

        $response = $this->postJson('/api/admin/user.password/reset', [
            'user_id' => 10,
            'password' => 'abc',
            'password_confirmation' => 'abc'
        ]);

        $response->assertStatus(422);
        $response->assertJson([
            'errors' => [
                'password' => [
                    'The password must be at least 8 characters.'
                ]
            ]
        ]);
    }

    public function testGetCanGetAUsersPhoto()
    {
        $this->seed();

        Sanctum::actingAs(
            $user = User::find(1),
            ['*']
        );

        $response = $this->get('/user/1/photo');

        $response->assertSuccessful();
        $response->assertHeader('content-type', 'image/png');
    }

    public function testGetCanGetAGroupsPhoto()
    {
        $this->seed();

        Sanctum::actingAs(
            $user = User::find(1),
            ['*']
        );

        $response = $this->get('/group/Group Name/photo');

        $response->assertSuccessful();
        $response->assertHeader('content-type', 'image/png');
    }
}
