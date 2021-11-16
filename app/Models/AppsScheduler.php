<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AppsScheduler extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $table = 'apps_scheduler';

    protected $fillable = [
        'app',
        'command',
        'last_run',
        'schedule'
    ];
}
