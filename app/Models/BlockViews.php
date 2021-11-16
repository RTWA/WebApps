<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BlockViews extends Model
{
    use HasFactory;
    
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'block_id',
        'time'
    ];

    /**
     * Declare that timestamps are not in use.
     *
     * @var boolean
     */
    public $timestamps = false;

    /**
     * Get the Block that this View links to
     */
    public function block()
    {
        return $this->belongsTo('App\Models\Block');
    }
}
