<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Plugin extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name',
        'slug',
        'icon',
        'version',
        'author',
        'state'
    ];

    /**
     * Declare that timestamps are not in use.
     *
     * @var boolean
     */
    public $timestamps = false;

    /**
     * These attributes should be included.
     *
     * @var array
     */
    protected $appends = array('number_of_blocks');

    /**
     * Get the number of Blocks using this Plugin
     */
    public function getNumberOfBlocksAttribute()
    {
        return $this->hasMany('App\Models\Block', 'plugin')->count();
    }

    /**
     * Allows finding by slug
     */
    public function scopeFindBySlug($query, $slug)
    {
        return $query->where('slug', '=', $slug);
    }

    /**
     * Get the absolute path to the Plugins directory
     *
     * @return string
     */
    public static function path()
    {
        return storage_path('webapps/plugins/');
    }

    /**
     * Create a new Plugin object
     *
     * @var string Plugin Slug
     *
     * @return object
     */
    public static function createFromSlug($slug)
    {
        if (!file_exists(self::path() . $slug . '/Plugin.php')) {
            abort(500, 'Unable to load Plugin: ' . $slug);
        }
        
        require_once self::path() . $slug . '/Plugin.php';
        $class = 'WebApps\Plugin\\' . $slug . '_Plugin';
        return new $class();
    }

    /**
     * Generates a publicID string
     *
     * @param int $length (Default: 10)
     *
     * @return mixed
     */
    public static function generatePublicId($length = 10)
    {
        $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $charactersLength = strlen($characters);
        $randomString = '';
        for ($i = 0; $i < $length; $i++) {
            $randomString .= $characters[rand(0, $charactersLength - 1)];
        }
        return Plugin::idUnique($randomString);
    }

    /**
     * Expand the Blocks data ready for use
     *
     * @param $data String | JSON string of settings array
     *
     * @return $this Object
     */
    public function prepare($data)
    {
        $data['settings'] = !is_array($data['settings']) ? json_decode($data['settings'], true) : $data['settings'];
        foreach ($data as $key => $value) {
            $this->$key = $value;
        }

        // @codeCoverageIgnoreStart
        if (method_exists($this, 'post_plugin_prepare')) {
            $this->post_plugin_prepare();
        }
        // @codeCoverageIgnoreEnd

        return $this;
    }

    /**
     * Checks if the generated ID is unique
     *
     * @param string $id
     *
     * @return mixed Generates a new ID, or returns the ID
     */
    public static function idUnique($id)
    {
        $ids = Block::where('publicId', '=', $id)->get();
        if (count($ids) <> 0) {
            return Plugin::generatePublicId();
        }
        return $id;
    }
}
