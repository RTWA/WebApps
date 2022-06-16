<?php

namespace App\Exceptions\MSGraph;

use App\Models\ErrorLog;
use Exception;

class CouldNotSendMail extends Exception
{
    public static function serviceRespondedWithError($exception, ?string $code, ?string $message)
    {
        ErrorLog::create([
            'file' => $exception->getFile(),
            'line' => $exception->getLine(),
            'message' => $exception->getMessage(),
            'trace' => $exception->getTraceAsString(),
            'tags' => json_encode(['Email', 'MS Graph API']),
        ]);
        return new static('Microsoft Graph API responded with code ' . $code . ': ' . $message);
    }

    public static function fromAddressIsNotValid(string $dir, string $line)
    {
        ErrorLog::create([
            'file' => $dir.DIRECTORY_SEPARATOR.'MSGraphMailTransport.php',
            'line' => $line,
            'message' => 'From Email Address is not valid',
            'trace' => '',
            'tags' => json_encode(['Email', 'MS Graph API']),
        ]);
        return new static('From Email Address is not valid');
    }
}
