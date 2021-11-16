<?php

namespace App\Services\Install;

class PermissionInstallService
{
    /**
     * @var array
     */
    protected $results = [];

    /**
     * PermissionInstallService constructor
     */
    public function __construct()
    {
        $this->results['permissions'] = [];
        $this->results['errors'] = false;
    }

    /**
     * Check for the folders permissions
     *
     * @codeCoverageIgnore
     */
    public function check(array $folders)
    {
        foreach ($folders as $folder => $permission) {
            if (!($this->getPermission($folder) >= $permission)) {
                $this->addFile($folder, $permission, false);
                $this->results['errors'] = true;
            } else {
                $this->addFile($folder, $permission, true);
            }
        }

        return $this->results;
    }

    /**
     * Get a folders permissions
     *
     * @codeCoverageIgnore
     *
     * @param string $folder
     * @return string
     */
    private function getPermission($folder)
    {
        if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
            if (is_writable(base_path($folder))) {
                return 775;
            } elseif (is_readable(base_path($folder))) {
                return 555;
            }
        } else {
            return substr(decoct(fileperms(base_path($folder))), -3);
        }
    }

    /**
     * Add the file to the list of results
     *
     * @param string $folder
     * @param string $permission
     * @param bool $isSet
     */
    private function addFile($folder, $permission, $isSet)
    {
        array_push($this->results['permissions'], [
            'folder' => $folder,
            'permission' => $permission,
            'isSet' => $isSet
        ]);
    }
}
