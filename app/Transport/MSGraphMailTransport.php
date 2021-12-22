<?php

namespace App\Transport;

use App\Exceptions\MSGraph\CouldNotReachService;
use App\Exceptions\MSGraph\CouldNotSendMail;
use App\Http\Controllers\MSGraphController;
use GuzzleHttp\Client;
use GuzzleHttp\ClientInterface;
use GuzzleHttp\Exception\BadResponseException;
use GuzzleHttp\Exception\ConnectException;
use Illuminate\Mail\Transport\Transport;
use RobTrehy\LaravelApplicationSettings\ApplicationSettings;
use Swift_Mime_Attachment;
use Swift_Mime_EmbeddedFile;
use Swift_Mime_SimpleMessage;
use Throwable;

class MSGraphMailTransport extends Transport
{
    /**
     * @var string
     */
    protected string $apiEndpoint = 'https://graph.microsoft.com/v1.0/users/{from}/sendMail';

    /**
     * @var Client|ClientInterface
     */
    protected ClientInterface $http;

    /**
     * MSGraphMailTransport constructor
     * @param ClientInterface|null $client
     */
    public function __construct(ClientInterface $client = null)
    {
        $this->http = $client ?? new Client();

        if (ApplicationSettings::get('mail.msgraph.from_address', '') === '') {
            throw CouldNotSendMail::fromAddressIsNotValid();
        }
    }

    /**
     * Send given email message
     * @param Swift_Mime_SimpleMessage $message
     * @param null $failedRecipients
     * @return int
     * @throws CouldNotSendMail
     * @throws CouldNotReachService
     */
    public function send(Swift_Mime_SimpleMessage $message, &$failedRecipients = null)
    {
        $this->beforeSendPerformed($message);
        $payload = $this->getPayload($message);
        $url = str_replace('{from}', urlencode($payload['from']['emailAddress']['address']), $this->apiEndpoint);

        try {
            $this->http->post($url, [
                'headers' => $this->getHeaders(),
                'json' => [
                    'message' => $payload
                ],
            ]);

            $this->sendPerformed($message);
            return $this->numberOfRecipients($message);
        } catch (BadResponseException $e) {
            if ($e->hasResponse()) {
                $response = json_decode((string) $e->getResponse()->getBody());
            }
            throw CouldNotSendMail::serviceRespondedWithError(
                $response->error->code ?? 'Unknown',
                $response->error->message ?? 'Unknown Error'
            );
        } catch (ConnectException $e) {
            throw CouldNotReachService::networkError();
        } catch (Throwable $e) {
            throw CouldNotReachService::unknownError();
        }
    }

    /**
     * Transforms given SwiftMailer message instance into MS Graph object
     * @param Swift_Mime_SimpleMessage $message
     * @return array
     */
    protected function getPayload(Swift_Mime_SimpleMessage $message)
    {
        $from = $message->getFrom();
        $priority = $message->getPriority();
        $attachments = $message->getChildren();

        return array_filter([
            'subject' => $message->getSubject(),
            'sender' => $this->toRecipientCollection($from)[0],
            'from' => $this->toRecipientCollection($from)[0],
            'replyTo' => $this->toRecipientCollection($message->getReplyTo()),
            'toRecipients' => $this->toRecipientCollection($message->getTo()),
            'ccRecipients' => $this->toRecipientCollection($message->getCc()),
            'bccReceipients' => $this->toRecipientCollection($message->getBcc()),
            'importance' => $priority === 3 ? 'Normal' : ($priority < 3 ? 'Low' : 'High'),
            'body' => [
                'contentType' => ($message->getContentType() === 'text/html') ? 'HTML' : 'text',
                'content' => $message->getBody(),
            ],
            'attachments' => $this->toAttachmentCollection($attachments),
        ]);
    }

    /**
     * Transform SimpleMessage recipients into MS Graph collection
     * @param array|string $recipients
     * @return array
     */
    protected function toRecipientCollection($recipients)
    {
        $collection = [];

        // If the provided list is empty, return an empty collection
        if (!$recipients) {
            return $collection;
        }

        // Some fields yield single e-mail addresses
        if (is_string($recipients)) {
            $collection[] = [
                'emailAddress' => [
                    'name' => null,
                    'address' => $recipients
                ],
            ];

            return $collection;
        }

        foreach ($recipients as $address => $name) {
            $collection[] = [
                'emailAddress' => [
                    'name' => $name,
                    'address' => $address
                ],
            ];
        }

        return $collection;
    }

    /**
     * Transform SwiftMailer children into MS Graph attachments
     * @param $attachments
     * @return array
     */
    protected function toAttachmentCollection($attachments)
    {
        $collection = [];

        foreach ($attachments as $attachment) {
            if (!$attachment instanceof Swift_Mime_Attachment) {
                continue;
            }

            $collection[] = [
                'name' => $attachment->getFilename(),
                'contentId' => $attachment->getId(),
                'contentType' => $attachment->getContentType(),
                'contentBytes' => base64_encode($attachment->getBody()),
                'size' => strlen($attachment->getBody()),
                '@odata.type' => '#microsoft.graph.fileAttachment',
                'isInline' => $attachment instanceof Swift_Mime_EmbeddedFile,
            ];
        }

        return $collection;
    }

    /**
     * Returns header collection for API request
     * @return string[]
     */
    protected function getHeaders()
    {
        return [
            'Accept' => 'application/json',
            'Authorization' => 'Bearer ' .
                json_decode((new MSGraphController())->getAccessToken()->content(), true)['token']['access_token'],
        ];
    }
}
