<?php

namespace App\Services\Install;

use Illuminate\Support\Collection;

class EnvironmentInstallService
{
    /**
     * Path to the .env file
     *
     * @var string
     */
    protected $path;

    /**
     * EnvironmentInstallService constructor
     */
    public function __construct()
    {
        $this->path = base_path('.env');

        // @codeCoverageIgnoreStart
        if (!file_exists($this->path)) {
            file_put_contents($this->path, '');
        }
        // @codeCoverageIgnoreEnd
    }

    /**
     * Get and entry from the .env file by key.
     *
     * @codeCoverageIgnore
     *
     * @param string $key
     * @return string
     */
    public function get($key)
    {
        $result = $this->parseFile()->filter(function (Collection $value) use ($key) {
            return $value->first() == $key;
        })->first();

        return $result instanceof Collection ? $result->get(1) : $result;
    }

    /**
     * Set the value of the given key to the value supplied
     *
     * @codeCoverageIgnore
     *
     * @param string $key
     * @param string $value
     * @param bool $linebreak
     * @return EnvironmentInstallService
     */
    public function set($key, $value, $linebreak = false)
    {
        if (config('app.env') <> 'testing') {
            $oldValue = $this->get($key);

            // test if string contains whitespace
            if (preg_match('/^\S.*\s.*\S$/', $value)) {
                $newValue = $linebreak ? "\n$key=\"$value\"" : "$key=\"$value\"";
            } else {
                $newValue = $linebreak ? "\n$key=$value" : "$key=$value";
            }

            if (!is_null($oldValue)) {
                return $this->replaceInFile("$key=$oldValue", $newValue);
            }

            file_put_contents($this->getPath(), "\n$newValue", FILE_APPEND);
        }

        return $this;
    }

    /**
     * Parse the .env file contents for easier handling
     *
     * @codeCoverageIgnore
     *
     * @return Collection
     */
    private function parseFile()
    {
        $contents = file_get_contents($this->getPath());
        $lines = new Collection(explode("\n", $contents));
        $result = new Collection();
        $lines->filter(function ($value) {
            return $value;
        })->each(function ($value) use ($result) {
            preg_match('/([a-zA-Z_-]+)\=(.*)/', $value, $regexResult);
            array_shift($regexResult);
            $result->push(new Collection($regexResult));
        });
        return $result;
    }

    /**
     * Replace a part of the .env file
     *
     * @codeCoverageIgnore
     *
     * @param string $old
     * @param string $new
     * @param int $append
     * @return EnvironmentInstallService
     */
    public function replaceInFile($old, $new, $append = 0)
    {
        $contents = file_get_contents($this->getPath());
        $replaceWith = preg_replace("~$old\n?~", "$new\n", $contents);
        file_put_contents($this->getPath(), $replaceWith, $append);
        return $this;
    }

    /**
     * Get the full path to the .env file
     *
     * @codeCoverageIgnore
     *
     * @return string
     */
    public function getPath()
    {
        return $this->path;
    }
}
