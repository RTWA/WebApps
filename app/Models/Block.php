<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Block extends Model
{
    use HasFactory;
    
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'owner',
        'plugin',
        'settings',
        'publicId',
        'title',
        'notes'
    ];

    /**
     * These attributes should be included.
     *
     * @var array
     */
    protected $appends = ['views'];

    /**
     * The "booted" method of the model.
     */
    protected static function booted()
    {
        static::addGlobalScope('created_desc', function (Builder $builder) {
            $builder->orderBy('created_at', 'DESC');
        });
    }

    /**
     * Get the User that owns this Block
     */
    public function user()
    {
        return $this->belongsTo('App\Models\User', 'owner', 'id');
    }

    /**
     * Get the BlockViews
     */
    public function viewsData()
    {
        return $this->hasMany('App\Models\BlockViews');
    }

    /**
     * Allows finding by public ID
     */
    public function scopeFindByPublicId($query, $publicId)
    {
        return $query->where('publicId', '=', $publicId)->with('user');
    }

    public function getViewsAttribute()
    {
        return $this->viewsData()->count();
    }
}
