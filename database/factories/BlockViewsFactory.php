<?php

namespace Database\Factories;

use App\Models\BlockViews;
use Illuminate\Database\Eloquent\Factories\Factory;

class BlockViewsFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = BlockViews::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        return [
            'time' => $this->faker->dateTimeBetween('-3 months')->format('Y-m-d H:i:s')
        ];
    }
}
