<?php

namespace App\Mail;

use App\Models\Block;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\URL;

class BlockSharedMail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     *
     * @return void
     */
    public function __construct(User $user, Block $block)
    {
        $this->user = $user;
        $this->block = $block;
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        return $this->view('emails.shared-block')
            ->with([
                'user' => $this->user,
                'block' => $this->block,
                'Block_Edit_URL' => URL::to('/blocks/edit/' . $this->block->publicId),
            ]);
    }
}
