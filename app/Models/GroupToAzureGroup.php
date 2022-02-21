<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GroupToAzureGroup extends Model
{
    use HasFactory;

    protected $fillable = [
        'role_id',
        'azure_group_id',
        'azure_display_name',
    ];
}
