<?php

namespace App\Http\Controllers;

use App\Models\Block;
use App\Models\BlockViews;
use App\Models\User;
use App\Models\Plugin;
use App\Services\BlocksService;
use DateTime;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Auth;
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

        if (($username <> null) &&
            (!$_user->hasPermissionTo('blocks.view.others') && $user->username !== $_user->username)
        ) {
            abort(403, 'You do not have permission to access this page.');
        }
        if ($username === null && !$user->hasPermissionTo('blocks.view')) {
            abort(403, 'You do not have permission to access this page.');
        }

        $blocksService = new BlocksService();
        $blocks = $blocksService->filteredBlocks($filter, $user->id, $offset, $limit, $sort);

        if ($sort === 'views') {
            $sorted = array_values(Arr::sort($blocks, function ($value) {
                return $value['views'];
            }));
            $blocks = array_reverse($sorted);
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
            $block = Block::findByPublicId($publicId)->first();

            if ($block === null) {
                abort(406, "View ($publicId) not found. Please check and try again.");
            }
            if ($block->owner != Auth::user()->id && !Auth::user()->hasRole('Administrators')) {
                abort(403, 'You do not have permission to edit this block.');
            }

            $p = Plugin::find($block['plugin']);
            if ($p === null) {
                return response()->json([
                    'block' => 'Not available',
                    'styles' => ''
                ], 200);
            }
            try {
                $block = Plugin::createFromSlug($p['slug'])->prepare($block->toArray());
            } catch (HttpException $e) {
                if ($e->getMessage() === "Unable to load Plugin: " . $p['slug']) {
                    $block = null;
                }
            }
        }

        if ($block) {
            $block = $blocksService->buildBlockForEdit($p, $block, isset($_GET['edit']));
            $styles = $blocksService->buildBlockStyles($styles, $block, $p);
        } else {
            $block = $blocksService->notAvailable([]);
            $styles = [];
        }

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
        if ((Auth::user()->id <> $blockData['owner'] || Auth::user()->hasRole('Administrators'))
            && !Auth::user()->hasPermissionTo('blocks.create')
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
            'styles' => $styles
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
}
