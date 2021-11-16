<?php

namespace Tests\Feature\Auth;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use RobTrehy\LaravelApplicationSettings\ApplicationSettings;

class LoginTest extends TestCase
{
    use RefreshDatabase;

    public function setUp(): void
    {
        parent::setUp();

        if (!file_exists(storage_path('webapps/installed.json'))) {
            file_put_contents(
                storage_path('webapps/installed.json'),
                json_encode([
                    'version' => 'testing',
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

    public function testUserCanViewLoginPage()
    {
        ApplicationSettings::set('auth.login.default_method', 'internal');

        $response = $this->get('/login');

        $response->assertSuccessful();
        $response->assertViewIs('auth.login');
    }

    public function testUserCannotViewLoginPageWhenAuthenticated()
    {
        $user = User::factory()->make();

        $response = $this->actingAs($user)->get('/login');

        $response->assertRedirect('/');
    }

    public function testUserCanLoginWithCorrectCredentials()
    {
        $user = User::factory()->create([
            'password' => Hash::make($password = 'webapps_test-user'),
            'active' => true
        ]);

        $response = $this->post('/login', [
            'username' => $user->username,
            'password' => $password
        ]);

        $response->assertRedirect('/');
        $this->assertAuthenticatedAs($user);
    }

    public function testUserCannotLoginWithCorrectCredentialsButADisabledAccount()
    {
        $user = User::factory()->create([
            'password' => Hash::make('webapps_test-user')
        ]);
        $user->active = 0;
        $user->save();

        $response = $this->from('/login')->post('/login', [
            'username' => $user->username,
            'password' => 'incorrect-password'
        ]);

        $response->assertRedirect('/login');
        $response->assertSessionHasErrors('username');
        $this->assertTrue(session()->hasOldInput('username'));
        $this->assertFalse(session()->hasOldInput('password'));
        $this->assertGuest();
    }

    public function testUserCannotLoginWithIncorrectCredentials()
    {
        $user = User::factory()->create([
            'password' => Hash::make('webapps_test-user')
        ]);

        $response = $this->from('/login')->post('/login', [
            'username' => $user->username,
            'password' => 'incorrect-password'
        ]);

        $response->assertRedirect('/login');
        $response->assertSessionHasErrors('username');
        $this->assertTrue(session()->hasOldInput('username'));
        $this->assertFalse(session()->hasOldInput('password'));
        $this->assertGuest();
    }

    public function testAuthenticatedUserCanLogout()
    {
        $user = User::factory()->create([
            'password' => Hash::make($password = 'webapps_test-user'),
            'active' => true
        ]);

        $response = $this->post('/login', [
            'username' => $user->username,
            'password' => $password
        ]);

        $response->assertRedirect('/');
        $this->assertAuthenticatedAs($user);
        
        $response = $this->post('/api/logout');

        $response->assertRedirect('/');
        $this->assertGuest();
    }
}
