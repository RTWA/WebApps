<?php

namespace App\Exceptions\MSGraph;

use App\Models\ErrorLog;
use Exception;

class CouldNotReachService extends Exception
{
    public static function networkError($exception)
    {
        ErrorLog::create([
            'file' => $exception->getFile(),
            'line' => $exception->getLine(),
            'message' => $exception->getMessage(),
            'trace' => $exception->getTraceAsString(),
            'tag' => json_encode(['Email', 'MS Graph API']),
        ]);
        return new static('The server couldn\'t be reached');
    }

    public static function unknownError($exception)
    {
        ErrorLog::create([
            'file' => $exception->getFile(),
            'line' => $exception->getLine(),
            'message' => $exception->getMessage(),
            'trace' => $exception->getTraceAsString(),
            'tag' => json_encode(['Email', 'MS Graph API']),
        ]);
        return new static('An unknown error occured');
    }
}
