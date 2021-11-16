<?php

namespace App\Http\Controllers;

use App\Models\Media;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

class MediaController extends Controller
{
    public function store(Request $request)
    {
        $file = $request->file('file');
        $storageName = Auth::user()->username . "_" . date("Y-m-d_H-i-s") . "_" . $file->getClientOriginalName();
        Storage::disk('public')->put($storageName, File::get($file));

        $media = Media::create([
            'filename' => $storageName,
            'original_filename' => $file->getClientOriginalName(),
            'mime' => $file->getMimeType(),
            'size' => $file->getSize(),
            'user_id' => Auth::user()->id
        ]);

        return response()->json(['media' => $media], 201);
    }
}
