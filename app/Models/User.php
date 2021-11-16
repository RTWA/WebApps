<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, HasRoles, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'username',
        'email',
        'name',
        'password',
        'preferences',
        'azure_id',
        'active',
    ];

    /**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [
        'password',
    ];

    /**
     * These attributes should be included.
     *
     * @var array
     */
    protected $appends = ['number_of_blocks'];

    /**
     * Get the users Block objects
     */
    public function blocks()
    {
        return $this->hasMany('App\Models\Block', 'owner');
    }

    /**
     * Get the number of Blocks a user has
     */
    public function getNumberOfBlocksAttribute()
    {
        return $this->hasMany('App\Models\Block', 'owner')->count();
    }

    /**
     * Get the users Media objects
     */
    public function media()
    {
        return $this->hasMany('App\Models\Media', 'user_id');
    }
}
