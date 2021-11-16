<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Media extends Model
{
    protected $fillable = [
        'filename',
        'original_filename',
        'mime',
        'size',
        'user_id',
    ];

    protected $appends = [
        'filesize',
        'URL',
    ];

    public function getFileSizeAttribute()
    {
        $i = floor(log($this->size, 1024));
        return round($this->size / pow(1024, $i), [0,0,2,2,3][$i]).['B','KB','MB','GB','TB'][$i];
    }

    public function getURLAttribute()
    {
        return '/storage/'.$this->filename;
    }

    public function user()
    {
        return $this->belongsTo('App\Models\User', 'user_id', 'id');
    }
}
