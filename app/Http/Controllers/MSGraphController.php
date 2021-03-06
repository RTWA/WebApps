<?php

namespace App\Http\Controllers;

use App\Exceptions\MSGraph\CouldNotGetToken;
use App\Models\MSGraphToken;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Hash;
use RobTrehy\LaravelApplicationSettings\ApplicationSettings;
use Spatie\Permission\Models\Role;

class MSGraphController extends Controller
{
    public function handleRegister(Request $request)
    {
        if ($request->input('admin_consent') === 'True') {
            ApplicationSettings::set('azure.graph.tenant', $request->input('tenant'));
        }

        return redirect('/settings/azure');
    }

    public function getAccessToken()
    {
        // Check Azure Tenant ID is set
        $tenant = ApplicationSettings::get('azure.graph.tenant');
        if (!$tenant) {
            throw CouldNotGetToken::serviceRespondedWithError(
                '500',
                'Azure Tenant ID is not set!',
                '29',
                __DIR__.DIRECTORY_SEPARATOR.'MSGraphController.php'
            );
        }

        // Get any tokens that have at least 5 minutes left before they expire
        $tokens = MSGraphToken::where('expires', '>', strtotime("-5 minutes"))->get();
        if (count($tokens) > 0) {
            return response()->json(['token' => $tokens[0]]);
        }

        $client_id = ApplicationSettings::get('azure.graph.client_id');
        $client_secret = Crypt::decryptString(ApplicationSettings::get('azure.graph.client_secret'));
        if (!$client_id || !$client_secret) {
            throw CouldNotGetToken::serviceRespondedWithError(
                '500',
                'App Registration Information Missing!',
                '46',
                __DIR__.DIRECTORY_SEPARATOR.'MSGraphController.php'
            );
        }

        // Get a new token from Microsoft
        $secret = urlencode($client_secret);
        $scope = urlencode('https://graph.microsoft.com/.default');

        $curl = curl_init();
        curl_setopt_array($curl, [
            CURLOPT_URL =>
            "https://login.microsoftonline.com/" .
                ApplicationSettings::get('azure.graph.tenant') . "/oauth2/v2.0/token",
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_SSL_VERIFYHOST => false,
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_ENCODING => "",
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 30,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => "POST",
            CURLOPT_POSTFIELDS =>
            "grant_type=client_credentials&client_id=" . $client_id . "&client_secret=" . $secret . "&scope=" . $scope,
            CURLOPT_HTTPHEADER => [
                "content-type: application/x-www-form-urlencoded"
            ],
        ]);
        $content = json_decode(curl_exec($curl), true);
        curl_close($curl);
        if (isset($content['error'])) {
            throw CouldNotGetToken::serviceRespondedWithError(
                '500',
                $content['error_description'],
                '80',
                __DIR__.DIRECTORY_SEPARATOR.'MSGraphController.php'
            );
        }

        $token = MSGraphToken::create([
            'access_token' => $content['access_token'],
            'expires' => (time() + $content['expires_in']),
        ]);

        return response()->json(['token' => $token]);
    }

    public function getUserPhoto($azure_id)
    {
        // Check Azure Tenant ID is set
        $tenant = ApplicationSettings::get('azure.graph.tenant');
        if (!$tenant) {
            abort(500, 'Azure Tenant ID is not set!');
        }
        $token = json_decode($this->getAccessToken()->content(), true)['token']['access_token'];

        $photo = $this->getGraphAPI('users/' . $azure_id . '/photo/$value', $token, true);

        if (!isset($photo['error'])) {
            $image = str_replace('data:image/png;base64,', '', $photo);
            $image = str_replace(' ', '+', $image);
            return $image;
        }

        return null;
    }

    public function syncUsersAndGroups()
    {
        // Check Azure Tenant ID is set
        $tenant = ApplicationSettings::get('azure.graph.tenant');
        if (!$tenant) {
            abort(500, 'Azure Tenant ID is not set!');
        }

        $token = json_decode($this->getAccessToken()->content(), true)['token']['access_token'];
        $this->syncUsers($token);
        $this->syncGroups($token);

        ApplicationSettings::set('azure.graph.last_sync', new \DateTime());
    }

    private function syncUsers($token)
    {
        $users = User::whereNotNull('azure_id')->get();

        foreach ($users as $user) {
            $azUser = $this->getGraphAPI(
                'users/' . $user['azure_id'] . '?$select=userPrincipalName,displayName,mail,accountEnabled',
                $token
            );
            if ($user->username !== $azUser['userPrincipalName']) {
                $user->username = $azUser['userPrincipalName'];
            }
            if ($user->name !== $azUser['displayName']) {
                $user->name = $azUser['displayName'];
            }
            if ($user->email !== $azUser['mail']) {
                $user->email = $azUser['mail'];
            }
            if ($user->active !== $azUser['accountEnabled']) {
                $user->active = $azUser['accountEnabled'];
            }
            $user->save();
        }
    }

    private function syncGroups($token)
    {
        $groupMappings = json_decode((new SecurityController())->getGroupMappings()->content(), true);

        foreach ($groupMappings['mappings'] as $group => $azGroup) {
            $group = Role::findById($group, 'web');
            $this->syncGroupMembers($token, $azGroup['azure_group_id'], $group);
        }
    }

    private function syncGroupMembers($token, $id, $group)
    {
        $data = $this->getGraphAPI("groups/" . $id . "/members", $token);
        $this->processGroupMembers($token, $data['value'], $group);

        if (isset($data['@odata.nextLink'])) {
            $this->syncMoreGroupMembers($token, $data['@odata.nextLink'], $group);
        }
    }

    private function syncMoreGroupMembers($token, $nextLink, $group)
    {
        $data = $this->getGraphAPI(str_replace('https://graph.microsoft.com/v1.0/', '', $nextLink), $token);
        $this->processGroupMembers($token, $data['value'], $group);

        if (isset($data['@odata.nextLink'])) {
            $this->syncMoreGroupMembers($token, $data['@odata.nextLink'], $group);
        }
    }

    private function processGroupMembers($token, $groupMembers, $group)
    {
        foreach ($groupMembers as $member) {
            if ($member['@odata.type'] === "#microsoft.graph.group") {
                $this->syncGroupMembers($token, $member['id'], $group);
            } else {
                $this->createOrUpdateMember($member, $group);
            }
        }
    }

    private function createOrUpdateMember($member, $group)
    {
        $user = User::where('azure_id', $member['id'])->orWhere('email', $member['mail'])->first();
        if (!$user) {
            // Create User
            $user = User::create([
                'username' => $member['userPrincipalName'],
                'password' => Hash::make(rand() . $member['mail'] . $member['id'] . time() . rand()),
                'email' => $member['mail'],
                'name' => $member['displayName'],
                'active' => true,
                'azure_id' => $member['id'],
            ]);
        } else {
            $user->username = $member['userPrincipalName'];
            $user->email = $member['mail'];
            $user->azure_id = $member['id'];
            $user->save();
        }

        // Set the group for the user, but don't override an Administrator!
        if (!$user->hasRole($group) && !$user->hasRole('Administrators')) {
            $user->syncRoles([$group]);
            $user->touch();
        }
    }

    public function getGraphAPI($endpoint, $token, $photo = false)
    {
        $curl = curl_init();
        curl_setopt_array($curl, [
            CURLOPT_URL => "https://graph.microsoft.com/v1.0/" . $endpoint,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_SSL_VERIFYHOST => false,
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_ENCODING => "",
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 30,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => "GET",
            CURLOPT_HTTPHEADER => [
                "Authorization: Bearer " . $token
            ],
        ]);
        $content = curl_exec($curl);
        curl_close($curl);

        if ($photo && !isset(json_decode($content, true)['error'])) {
            return base64_encode($content);
        } else {
            return json_decode($content, true);
        }
    }
}
