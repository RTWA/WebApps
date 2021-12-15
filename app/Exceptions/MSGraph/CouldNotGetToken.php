<?php

namespace App\Exceptions\MSGraph;

use Exception;

class CouldNotGetToken extends Exception
{
    public static function serviceRespondedWithError(string $code, string $message)
    {
        return new static('Microsoft Identity platform responded with code ' . $code . ': ' . $message);
    }
}
