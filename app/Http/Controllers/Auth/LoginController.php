<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Foundation\Auth\AuthenticatesUsers;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Validation\ValidationException;
use RobTrehy\LaravelApplicationSettings\ApplicationSettings;

class LoginController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Login Controller
    |--------------------------------------------------------------------------
    |
    | This controller handles authenticating users for the application and
    | redirecting them to your home screen. The controller uses a trait
    | to conveniently provide its functionality to your applications.
    |
    */

    use AuthenticatesUsers;

    /**
     * Where to redirect users after login.
     *
     * @var string
     */
    protected $redirectTo = '/';

    /**
     * Defines using username over email
     *
     * @return string
     */
    public function username()
    {
        return 'username';
    }

    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('guest')->except('logout');
    }

    /**
     * Logout the user from Laravel and if required, Single-Sign-On
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout()
    {
        Auth::logout();
        return response()->json(['success' => true], 201);
    }

    /**
     * Render Login Page
     */
    public function loginPage()
    {
        // @codeCoverageIgnoreStart
        if (ApplicationSettings::get('azure.graph.default_login') === "true" && !isset($_GET['logout'])) {
            return Redirect::to('/login/oauth2/azure');
        }
        // @codeCoverageIgnoreEnd

        return view('auth.login', [
            'azure' => ApplicationSettings::get('azure.graph.login_enabled', false),
            'registration' => ApplicationSettings::get('auth.internal.registrations')
        ]);
    }

    /**
     * Handle a login request to the application.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse|\Illuminate\Http\Response|\Illuminate\Http\JsonResponse
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function login(Request $request)
    {
        $this->validateLogin($request);

        // If the class is using the ThrottlesLogins trait, we can automatically throttle
        // the login attempts for this application. We'll key this by the username and
        // the IP address of the client making these requests into this application.
        if (method_exists($this, 'hasTooManyLoginAttempts') &&
            $this->hasTooManyLoginAttempts($request)
        ) {
            // @codeCoverageIgnoreStart
            $this->fireLockoutEvent($request);

            return $this->sendLockoutResponse($request);
            // @codeCoverageIgnoreEnd
        }

        if ($this->guard()->validate($this->credentials($request))) {
            $user = $this->guard()->getLastAttempted();

            if ($user->active && $this->attemptLogin($request)) {
                return $this->sendLoginResponse($request);
            } else {
                // @codeCoverageIgnoreStart

                // Increment the failed login attempts and redirect back to the
                // login form with an error message.
                $this->incrementLoginAttempts($request);

                throw ValidationException::withMessages([
                    'username' => ["Your account has been disabled. Please contact your System Administrator."],
                ]);
                // @codeCoverageIgnoreEnd
            }
        }

        // If the login attempt was unsuccessful we will increment the number of attempts
        // to login and redirect the user back to the login form. Of course, when this
        // user surpasses their maximum number of attempts they will get locked out.
        $this->incrementLoginAttempts($request);

        return $this->sendFailedLoginResponse($request);
    }
}
