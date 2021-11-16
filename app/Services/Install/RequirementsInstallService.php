<?php

namespace App\Services\Install;

class RequirementsInstallService
{
    /**
     * Check fo rthe server requirements
     *
     * @param array $requirements
     * @return array
     */
    public function check(array $requirements)
    {
        $results = ['requirements' => [], 'errors' => false];

        foreach ($requirements as $type => $requirement) {
            switch ($type) {
                    // Check PHP Requirements
                case 'php':
                    foreach ($requirements[$type] as $requirement) {
                        $results['requirements'][$type][$requirement] = true;

                        if (!extension_loaded($requirement)) {
                            // @codeCoverageIgnoreStart
                            $results['requirements'][$type][$requirement] = false;
                            $results['errors'] = true;
                            // @codeCoverageIgnoreEnd
                        }
                    }
                    break;
                    // Check Apache Requirements
                case 'apache':
                    foreach ($requirements[$type] as $requirement) {
                        if (function_exists('apache_get_modules')) {
                            // @codeCoverageIgnoreStart
                            $results['requirements'][$type][$requirement] = true;

                            if (!in_array($requirement, apache_get_modules())) {
                                $results['requirements'][$type][$requirement] = false;
                                $results['errors'] = true;
                            }
                            // @codeCoverageIgnoreEnd
                        }
                    }
                    break;
            }
        }
        return $results;
    }

    /**
     * Check PHP Version Requirements
     *
     * @param string $minPhpVersion
     * @return array
     */
    public function checkPHPVersion(string $minPhpVersion)
    {
        $currentPhpVersion = $this->getPhpVersionInfo();
        $supported = false;

        if (version_compare($currentPhpVersion['version'], $minPhpVersion) >= 0) {
            $supported = true;
        }

        return [
            'full' => $currentPhpVersion['full'],
            'current' => $currentPhpVersion['version'],
            'minimum' => $minPhpVersion,
            'supported' => $supported
        ];
    }

    /**
     * Get current PHP Version information
     *
     * @return array
     */
    private static function getPhpVersionInfo()
    {
        $currentVersionFull = PHP_VERSION;
        preg_match('#^\d+(\.\d+)*#', $currentVersionFull, $filtered);
        $currentVersion = $filtered[0];

        return [
            'full' => $currentVersionFull,
            'version' => $currentVersion
        ];
    }
}
