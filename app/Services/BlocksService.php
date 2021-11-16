<?php

namespace App\Services;

use App\Models\Block;
use App\Models\Plugin;

class BlocksService
{
    /**
     * Get a filtered list of blocks for MyBlocks page
     */
    public function filteredBlocks($filter, $user_id, $offset, $limit, $sort)
    {
        if ($filter !== null && !is_numeric($filter)) {
            return Block::where('title', 'like', '%' . $filter . '%')
                    ->orWhere('notes', 'like', '%' . $filter . '%')
                    ->orWhere('settings', 'like', '%:"%' . $filter .'%"%')
                    ->where('owner', $user_id)
                    ->offset($offset)
                    ->take($limit)
                    ->get()
                    ->toArray();
        } else {
            return Block::when(
                is_numeric($filter),
                function ($query) use ($filter) {
                    return $query->where('plugin', $filter);
                }
            )
            ->where('owner', $user_id)
            ->offset($offset)
            ->take($limit)
            ->get()
            ->toArray();
        }
    }

    /**
     * Build a Block from database data
     */
    public function buildBlock($block)
    {
        $built = [];
        $p = Plugin::find($block['plugin']);
        if ($p <> null) {
            $built = Plugin::createFromSlug($p['slug'])->prepare($block);
            $built['plugin'] = $p;
            $built['scripts'] = $built->scripts();
            $built['output'] = $built->output();
            $built['options'] = $built->options;
            $built['preview'] = $built->preview;
        } else {
            $built = (!is_array($block)) ? $block->toArray() : $block;
            unset($built['plugin']);
            $built['scripts'] = '';
            $built['output'] = "<div class=\"text-red-500\">This Plugin is no longer available</div>";
            $built['options'] = [];
            $built['preview'] = '';
        }

        return $built;
    }

    /**
     * Build a Block for creation or display
     */
    public function buildNewBlock($plugin, $user)
    {
        $block = new Block();
        $block = Plugin::createFromSlug($plugin['slug'])->prepare($block);
        $block->settings = $block->new;
        $block['plugin'] = $plugin;
        $block['user'] = $user;
        $block['owner'] = $user->id;
        $block['publicId'] = Plugin::generatePublicId();

        return $block;
    }

    /**
     * Build a block for editing
     */
    public function buildBlockForEdit($plugin, $block, $edit = false)
    {
        $block['plugin'] = $plugin;
        $block['scripts'] = $block->scripts();
        $block['output'] = $block->output($edit);
        $block['options'] = $block->options;
        $block['preview'] = $block->preview;
        $block['new'] = $block->new;

        return $block;
    }

    /**
     * Build Block styles
     */
    public function buildBlockStyles($styles, $block, $plugin)
    {
        if (!isset($styles[$plugin['slug']])) {
            $styles[$plugin['slug']] = $block->style();
        }
        return $styles;
    }

    /**
     * Get the total number of available blocks based upon filter
     */
    public function getTotal($filter, $user)
    {
        if ($filter === null) {
            return $user->number_of_blocks;
        } elseif (is_numeric($filter)) {
            return Block::where('plugin', $filter)->where('owner', $user->id)->get()->count();
        } else {
            return Block::where('title', 'like', '%' . $filter . '%')
                    ->orWhere('notes', 'like', '%' . $filter . '%')
                    ->orWhere('settings', 'like', '%:"%' . $filter .'%"%')
                    ->where('owner', $user->id)
                    ->get()
                    ->count();
        }
    }
}
