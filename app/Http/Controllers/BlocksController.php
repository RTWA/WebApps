<?php

namespace App\Http\Controllers;

use App\Mail\BlockSharedMail;
use App\Models\Block;
use App\Models\BlockViews;
use App\Models\Media;
use App\Models\User;
use App\Models\Plugin;
use App\Services\BlocksService;
use DateTime;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use RobTrehy\LaravelApplicationSettings\ApplicationSettings;
use Symfony\Component\HttpKernel\Exception\HttpException;

class BlocksController extends Controller
{
    /**
     * Retrieve a list of a Users Blocks
     * This can be filtered by component id
     * This can be filtered by searching title/notes
     *
     * Required Permission: blocks.view or blocks.view.others
     *
     * @param String $username
     */
    public function index($username = null)
    {
        if ($username <> null) {
            $_user = Auth::user();
            $user = User::where('username', '=', $username)->first();
        } else {
            $user = Auth::user();
        }

        $limit = request('limit', 10);
        $offset = request('offset', 0);
        $filter = (request('filter') === "null") ? null : request('filter', null);
        $sort = request('sort', null);
        $styles = [];
        $blocks = [];

        if (!$sort) {
            $sort = ['order' => 'ASC', 'by' => 'Created'];
        } else {
            $sort = json_decode($sort, true);
        }

        if (($username <> null) &&
            (!$_user->hasPermissionTo('blocks.view.others') && $user->username !== $_user->username)
        ) {
            abort(403, 'You do not have permission to access this page.');
        }
        if ($username === null && !$user->hasPermissionTo('blocks.view')) {
            abort(403, 'You do not have permission to access this page.');
        }

        $blocksService = new BlocksService();
        $blocks = $blocksService->filteredBlocks($filter, $user->id, $offset, $limit);

        if ($sort['by'] === 'Popularity') {
            $sorted = array_values(Arr::sort($blocks, function ($value) {
                return $value['views'];
            }));
            if ($sort['order'] === 'ASC') {
                $blocks = array_reverse($sorted);
            } elseif ($sort['order'] === 'DESC') {
                $blocks = $sorted;
            }
        }

        if ($sort['by'] === 'Created') {
            $sorted = array_values(Arr::sort($blocks, function ($value) {
                return $value['created_at'];
            }));
            if ($sort['order'] === 'ASC') {
                $blocks = array_reverse($sorted);
            } elseif ($sort['order'] === 'DESC') {
                $blocks = $sorted;
            }
        }

        if ($blocks <> [] || $blocks <> null) {
            foreach ($blocks as $i => $block) {
                $blocks[$i] = $blocksService->buildBlock($block);
                if (isset($blocks[$i]['plugin'])) {
                    $styles = $blocksService->buildBlockStyles($styles, $blocks[$i], $blocks[$i]['plugin']);
                }
            }
        }

        if (count($blocks) === 0 && $filter === null) {
            return response()->json([
                'message' => "No blocks found."
            ], 200);
        } else {
            return response()->json([
                'blocks' => $blocks,
                'styles' => $styles,
                'total' => $blocksService->getTotal($filter, $user)
            ], 200);
        }
    }

    /**
     * Retrieve a list of Blocks with a User
     * This can be filtered by component id
     * This can be filtered by searching title/notes
     *
     * Required Permission: blocks.view or blocks.view.others
     *
     * @param String $username
     */
    public function shared($username = null)
    {
        if ($username <> null) {
            $_user = Auth::user();
            $user = User::where('username', '=', $username)->first();
        } else {
            $user = Auth::user();
        }

        $limit = request('limit', 10);
        $offset = request('offset', 0);
        $filter = (request('filter') === "null") ? null : request('filter', null);
        $sort = request('sort', null);
        $styles = [];
        $blocks = [];

        if (!$sort) {
            $sort = ['order' => 'ASC', 'by' => 'Created'];
        } else {
            $sort = json_decode($sort, true);
        }

        if (($username <> null) &&
            (!$_user->hasPermissionTo('blocks.view.others') && $user->username !== $_user->username)
        ) {
            abort(403, 'You do not have permission to access this page.');
        }
        if ($username === null && !$user->hasPermissionTo('blocks.view')) {
            abort(403, 'You do not have permission to access this page.');
        }

        $blocksService = new BlocksService();
        $blocks = $blocksService->filteredSharedBlocks($filter, $user->id, $offset, $limit);

        if ($sort['by'] === 'Popularity') {
            $sorted = array_values(Arr::sort($blocks, function ($value) {
                return $value['views'];
            }));
            if ($sort['order'] === 'ASC') {
                $blocks = array_reverse($sorted);
            } elseif ($sort['order'] === 'DESC') {
                $blocks = $sorted;
            }
        }

        if ($sort['by'] === 'Created') {
            $sorted = array_values(Arr::sort($blocks, function ($value) {
                return $value['created_at'];
            }));
            if ($sort['order'] === 'ASC') {
                $blocks = array_reverse($sorted);
            } elseif ($sort['order'] === 'DESC') {
                $blocks = $sorted;
            }
        }

        if ($blocks <> [] || $blocks <> null) {
            foreach ($blocks as $i => $block) {
                $blocks[$i] = $blocksService->buildBlock($block);
                if (isset($blocks[$i]['plugin'])) {
                    $styles = $blocksService->buildBlockStyles($styles, $blocks[$i], $blocks[$i]['plugin']);
                }
            }
        }

        if (count($blocks) === 0 && $filter === null) {
            return response()->json([
                'message' => "No blocks found."
            ], 200);
        } else {
            return response()->json([
                'blocks' => $blocks,
                'styles' => $styles,
                'total' => $blocksService->getSharedTotal($filter, $user->id)
            ], 200);
        }
    }

    /**
     * Retrieve the data required to view, edit and preview a Block
     * If $publicId is the name of Plugin slug, a new Block will be returned
     *
     * Required Permission: blocks.create (Block owner or Administrators)
     *
     * @param $publicId string - The publicID of the block
     */
    public function show($publicId)
    {
        $styles = [];

        if (!Auth::user()->hasPermissionTo('blocks.create')) {
            abort(403, 'You do not have permission to access this page.');
        }

        $blocksService = new BlocksService();

        // Check if the PublicId is actually the slug of a Plugin
        // This means the Block is new, based on this Plugin
        $p = Plugin::findBySlug($publicId)->first();
        if ($p <> null) {
            // Block is new
            $block = $blocksService->buildNewBlock($p, Auth::user());
        } else {
            // Block exists
            $block = Block::findByPublicId($publicId)->with('shares')->first();

            if ($block === null) {
                abort(406, "View ($publicId) not found. Please check and try again.");
            }
            if ($block->owner != Auth::user()->id
                && !Auth::user()->hasRole('Administrators')
                && !$blocksService->blockIsSharedWith($block, Auth::user()->id)
            ) {
                abort(403, 'You do not have permission to edit this block.');
            }

            $p = Plugin::find($block['plugin']);
            $slug = ($p) ? $p['slug'] : '';
            try {
                $block = Plugin::createFromSlug($slug)->prepare($block->toArray());
            } catch (HttpException $e) {
                if ($e->getMessage() === "Unable to load Plugin: $slug") {
                    return response()->json([
                        'block' => 'Not available',
                        'styles' => ''
                    ], 200);
                }
            }
        }

        $block = $blocksService->buildBlockForEdit($p, $block, isset($_GET['edit']));
        $styles = $blocksService->buildBlockStyles($styles, $block, $p);

        return response()->json([
            'block' => $block,
            'styles' => $styles
        ], 200);
    }

    /**
     * Save changes made to a Block
     *
     * Required Permission: blocks.create (Block owner or Administrators)
     */
    public function update(Request $request)
    {
        $blockData = json_decode($request->input('block'), true);
        $blockData['settings'] = json_encode($blockData['settings']);

        // Verify the logged in User is the Block owner, or an Admin
        if ((Auth::user()->id <> $blockData['owner']
                && !Auth::user()->hasRole('Administrators')
                && !(new BlocksService())->blockIsSharedWith(Block::find($blockData['id']), Auth::user()->id))
            || !Auth::user()->hasPermissionTo('blocks.create')
        ) {
            abort(403, 'You do not have permission to edit this block.');
        }

        // Save the Block data
        if (isset($blockData['id'])) {
            $block = Block::find($blockData['id']);
        } else {
            $block = new Block();
            $block->owner = $blockData['owner'];
            $block->plugin = $blockData['plugin']['id'];
            $block->publicId = $blockData['publicId'];
        }
        $block->settings = $blockData['settings'];
        $block->notes = isset($blockData['notes']) ? $blockData['notes'] : '';
        $block->title = isset($blockData['title']) ? $blockData['title'] : '';
        $block->touch();
        $block->save();

        return response()->json([
            'message' => 'Block saved successfully'
        ], 201);
    }

    /**
     * Returns the embed view of a Block
     *
     * @param $publicId string - The publicID of the block
     */
    public function embed($publicId)
    {
        $block = Block::findByPublicId($publicId)->firstOrFail();
        $plugin = Plugin::find($block->plugin);

        BlockViews::create([
            'block_id' => $block->id,
            'time' => new DateTime()
        ]);

        if ($plugin === null || !file_exists(Plugin::path() . $plugin->slug . '/Plugin.php')) {
            return view('not-available');
        }

        $blocksService = new BlocksService();

        $block = $blocksService->buildBlock($block);
        $styles = $blocksService->buildBlockStyles([], $block, $plugin);

        return view('embed', [
            'block' => $block,
            'styles' => $styles,
            'button' => [
                'icon' => ApplicationSettings::get('blocks.button.icon', 'cube'),
                'location' => ApplicationSettings::get('blocks.button.location', 'bottom-0 right-0'),
                'action' => ApplicationSettings::get('blocks.button.action', 'edit'),
            ]
        ]);
    }

    /**
     * Deletes a Block
     *
     * Required Permission: blocks.create (Block owner or Administrators)
     *
     * @param $publicId string - The publicID of the block
     */
    public function delete($publicId)
    {
        $block = Block::findByPublicId($publicId)->firstOrFail();

        // Verify the logged in User is the Block owner, or an Admin
        if ((Auth::user()->id <> $block->owner || !Auth::user()->hasRole('Administrators'))
            && !Auth::user()->hasPermissionTo('blocks.create')
        ) {
            abort(403, 'You do not have permission to delete this block.');
        }

        $p = Plugin::find($block->plugin);
        $plugin = Plugin::createFromSlug($p->slug);
        $settings = json_decode($block['settings'], true);
        $images = [];
        $repeater_images = [];

        // @codeCoverageIgnoreStart
        foreach ($plugin->options as $name => $option) {
            if (strtolower($option['type']) === 'repeater') {
                // Repeater
                foreach ($option['options'] as $repeater_name => $repeater_option) {
                    if (strtolower($repeater_option['type']) === 'image') {
                        $repeater_images[] = [$name, $repeater_name];
                    }
                }
            }
            if (strtolower($option['type']) === 'image') {
                // Image
                $images[] = $name;
            }
        }

        foreach ($repeater_images as $image) {
            foreach ($settings[$image[0]] as $media) {
                if (isset($media[$image[1]]['media_id'])) {
                    (new MediaController())::delete(Media::find($media[$image[1]]['media_id']));
                }
            }
        }
        // @codeCoverageIgnoreEnd

        $block->delete();

        return response()->json(['message' => "Block deleted"], 200);
    }

    /**
     * Get the count of Blocks the authenticated User has
     *
     * Required Permission: blocks.view
     */
    public function count()
    {
        if (!Auth::user()->hasPermissionTo('blocks.view')) {
            abort(403);
        }

        return response()->json(['count' => Block::where('owner', Auth::id())->count()], 200);
    }

    /**
     * Get the total Block views the authenticated User has
     *
     * Required Permission: blocks.view
     */
    public function views()
    {
        if (!Auth::user()->hasPermissionTo('blocks.view')) {
            abort(403);
        }

        $blocks = Block::where('owner', Auth::id())->get();
        $count = 0;

        foreach ($blocks as $block) {
            $count += $block->views;
        }

        return response()->json(['views' => $count], 200);
    }

    /**
     * Change the owner of a block
     *
     * Required Permission: admin.access
     *
     * @param $publicId string - The publicID of the block
     */
    public function chown(Request $request, $publicId)
    {
        if (!Auth::user()->hasPermissionTo('admin.access')) {
            abort(403, 'You do not have permission to change a Blocks owner.');
        }

        $block = Block::findByPublicId($publicId)->firstOrFail();

        if ($block->owner <> $request->input('old_owner_id')) {
            abort(400, "Incorrect `old_owner_id`");
        }

        $block->owner = $request->input('new_owner_id');
        $block->save();

        return response()->json(['block' => $block], 200);
    }

    /**
     * Create a new Block Share
     */
    public function setShare(Request $request, $publicId)
    {
        $block = Block::findByPublicId($publicId)->with('shares')->with('user')->firstOrFail();

        if (Auth::id() != $block->owner) {
            abort(403, 'You do not have permission to share this Block.');
        }

        $block->shares()->attach($request->input('user_id'));
        $block->refresh();

        $user = User::find($request->input('user_id'));
        if ($user->email) {
            Mail::to($user->email)
                ->send(new BlockSharedMail($user, $block));
        }

        return response()->json(['shares' => $block->shares], 201);
    }

    /**
     * Remove a Block Share
     */
    public function removeShare(Request $request, $publicId)
    {
        $block = Block::findByPublicId($publicId)->with('shares')->firstOrFail();

        if (Auth::id() != $block->owner) {
            abort(403, 'You do not have permission to remove shares for this Block');
        }

        $block->shares()->detach($request->input('user_id'));
        $block->refresh();

        return response()->json(['shares' => $block->shares], 201);
    }

    /**
     * Get a list of Media that is used by Blocks
     * @codeCoverageIgnore
     */
    public function getBlockMedia()
    {
        $medias = [];
        $blocks = Block::all();

        foreach ($blocks as $block) {
            $p = Plugin::find($block->plugin);
            $plugin = Plugin::createFromSlug($p->slug);
            $settings = json_decode($block['settings'], true);
            $images = [];
            $repeater_images = [];

            foreach ($plugin->options as $name => $option) {
                if (strtolower($option['type']) === 'repeater') {
                    // Repeater
                    foreach ($option['options'] as $repeater_name => $repeater_option) {
                        if (strtolower($repeater_option['type']) === 'image') {
                            $repeater_images[] = [$name, $repeater_name];
                        }
                    }
                }
                if (strtolower($option['type']) === 'image') {
                    // Image
                    $images[] = $name;
                }
            }

            foreach ($repeater_images as $image) {
                foreach ($settings[$image[0]] as $media) {
                    $medias[] = [
                        'media_id' => isset($media[$image[1]]['media_id']) ? $media[$image[1]]['media_id'] : null,
                        'src' => $media[$image[1]]['src'],
                    ];
                }
            }
        }

        return $medias;
    }
}
