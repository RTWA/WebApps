<?php

namespace Tests\Feature\Auth;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use RobTrehy\LaravelApplicationSettings\ApplicationSettings;

class RegisterTest extends TestCase
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

    public function testUserCanViewRegistrationsPage()
    {
        ApplicationSettings::set('auth.internal.registrations', "true");

        $response = $this->get('/register');

        $response->assertSuccessful();
        $response->assertViewIs('auth.register');
    }

    public function testUserCannotViewRegisterPageWhenAuthenticated()
    {
        $user = User::factory()->make();

        $response = $this->actingAs($user)->get('/register');

        $response->assertRedirect('/');
    }

    public function testUserCannotViewRegisterPageWhenRegistrationsAreDisabled()
    {
        ApplicationSettings::set('auth.internal.registrations', "false");

        $response = $this->get('/register');

        $response->assertRedirect('/login');
    }

    public function testUserCanRegisterWithValidData()
    {
        $this->seed();

        ApplicationSettings::set('auth.internal.default_group', "Standard Users");

        $response = $this->from('/register')->post('/register', [
            'name' => 'A Test User',
            'email' => 'test@getwebapps.uk',
            'username' => 'test_username',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $response->assertRedirect('/');
        $this->assertAuthenticated();
    }

    public function testUserCannotRegisterWithInvalidData()
    {
        $user = User::factory()->create([
            'password' => Hash::make('webapps_test-user')
        ]);
        $user->active = 0;
        $user->save();

        $response = $this->from('/register')->post('/register', [
            'name' => 'A Test User',
            'email' => 'test@getwebapps.uk',
            'username' => $user->username,
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $response->assertRedirect('/register');
        $response->assertSessionHasErrors('username');
        $this->assertTrue(session()->hasOldInput('username'));
        $this->assertFalse(session()->hasOldInput('password'));
        $this->assertGuest();
    }
}
