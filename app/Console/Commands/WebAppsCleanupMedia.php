<?php

namespace App\Console\Commands;

use App\Http\Controllers\BlocksController;
use App\Http\Controllers\MediaController;
use App\Models\Media;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use RobTrehy\LaravelApplicationSettings\ApplicationSettings;

class WebAppsCleanupMedia extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'webapps:cleanup-media';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Remove unused Media elements form local storage.';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $unusedMedia = [];

        // Get a list of Media that is used by Blocks
        $blockMedia = (new BlocksController())->getBlockMedia();

        // Get all known Media from database
        $dataMedia = Media::all();

        // Get all file media
        $fileMedia = Storage::disk('public')->allFiles();

        foreach ($dataMedia as $media) {
            foreach ($fileMedia as $i => $file) {
                if ($file === str_replace('/storage/', '', $media['URL'])) {
                    unset($fileMedia[$i]);
                }
            }

            if (in_array($media['URL'], array_column($blockMedia, 'src'))) {
                continue;
            }
            if (in_array($media['id'], array_column($blockMedia, 'media_id'))) {
                continue;
            }

            $unusedMedia[] = $media;
        }

        foreach ($fileMedia as $media) {
            if ($media !== '.gitignore') {
                $unusedMedia[] = [
                    'filename' => $media
                ];
            }
        }

        $matches = count($unusedMedia);

        foreach ($unusedMedia as $media) {
            if (gettype($media) === 'object') {
                $this->line($media->filename .' is unused...Deleting!');
                (new MediaController())->delete($media);
            } else {
                $this->line($media['filename'] .' is unused...Deleting!');
                Storage::disk('public')->delete($media['filename']);
            }
        }

        ApplicationSettings::set('tasks.cleanUpMedia.lastRun', new \DateTime());
        ApplicationSettings::set('tasks.cleanUpMedia.lastQty', $matches);

        return 0;
    }
}
