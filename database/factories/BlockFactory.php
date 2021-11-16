<?php

namespace Database\Factories;

use App\Models\Block;
use App\Models\Plugin;
use Illuminate\Database\Eloquent\Factories\Factory;

class BlockFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Block::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        return [
            'owner' => $this->faker->numberBetween(1, 101),
            'plugin' => Plugin::where('slug', '=', 'Sample')->first()->id,
            'settings' => json_encode([
                'message' => $this->faker->sentence(3)
            ]),
            'publicId' => Plugin::generatePublicId(),
            'title' => $this->faker->word(),
            'notes' => $this->faker->paragraph(),
            'created_at' => $this->faker->dateTime()->format('c')
        ];
    }
}
