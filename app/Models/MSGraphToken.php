<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MSGraphToken extends Model
{
    use HasFactory;

    protected $table = 'msgraph_tokens';

    protected $fillable = [
        'access_token',
        'expires'
    ];
}
