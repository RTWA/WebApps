<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Foundation\Auth\AuthenticatesUsers;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Crypt;
use Laravel\Socialite\Facades\Socialite;
use RobTrehy\LaravelApplicationSettings\ApplicationSettings;

class OAuth2Controller extends Controller
{
    use AuthenticatesUsers;

    /**
     * Performs an automatic Single-Sign-On login via the specified OAuth2 Provider
     *
     * @param $driver
     *
     * @return \Illuminate\Http\RedirectResponse
     */
    public function redirectToProvider()
    {
        if (ApplicationSettings::get('auth.oauth2.azure.enabled') === "false") {
            return Redirect::to('/login');
        }

        return $this->makeDriver()->redirect();
    }


    /**
     * Handles callback from OAuth2 Provider
     *
     * @param $driver
     */
    public function handleProviderCallback()
    {
        // $this->getRedirect();
        $OAuth2User = $this->makeDriver()->stateless()->user();

        $user = User::where('email', $OAuth2User->email)->where('azure_id', $OAuth2User->id)->first();

        if ($user === null) {
            dd("User authenticated from Azure, but not found in WebApps");
            // TODO: Not authorised?
            // OLD: $user = $this->createUserFromOAuth2($driver, $OAuth2User);
        }

        Auth::login($user);
        return redirect()->to('/');
    }


    /**
     * Creates handler for OAuth2 Authentication
     *
     * @return mixed
     */
    private function makeDriver()
    {
        $clientId = ApplicationSettings::get('azure.graph.client_id');
        $clientSecret = Crypt::decryptString(ApplicationSettings::get('azure.graph.client_secret'));
        $tenant = ApplicationSettings::get('azure.graph.tenant');
        $redirect = URL::to('/').'/login/oauth2/azure/callback';

        $config = new \SocialiteProviders\Manager\Config($clientId, $clientSecret, $redirect, ['tenant' => $tenant]);
        return Socialite::driver('azure')->setConfig($config);
    }
}
