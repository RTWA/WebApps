<?php

namespace App\Exceptions\MSGraph;

use Exception;

class CouldNotSendMail extends Exception
{
    public static function serviceRespondedWithError(?string $code, ?string $message)
    {
        return new static('Microsoft Graph API responded with code ' . $code . ': ' . $message);
    }

    public static function fromAddressIsNotValid()
    {
        return new static('From Email Address is not valid');
    }
}
