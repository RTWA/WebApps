<?php

namespace App\Exceptions\MSGraph;

use App\Models\ErrorLog;
use Exception;

class CouldNotGetToken extends Exception
{
    public static function serviceRespondedWithError(string $code, string $message, string $line, string $file)
    {
        ErrorLog::create([
            'file' => $file,
            'line' => $line,
            'message' => $message,
            'trace' => "",
            'tags' => json_encode(['MS Graph API']),
        ]);
        return new static('Microsoft Identity platform responded with code ' . $code . ': ' . $message);
    }
}
