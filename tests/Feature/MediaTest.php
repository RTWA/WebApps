<?php

namespace Tests\Feature;

use App\Models\Media;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class MediaTest extends TestCase
{
    use RefreshDatabase;
    
    public function testCanUploadAnImage()
    {
        $this->seed();

        Sanctum::actingAs(
            $user = User::find(1),
            ['*']
        );

        Storage::fake('public');
        $file = UploadedFile::fake()->image('image.jpg');

        $response = $this->postJson('/api/media/upload', [
            'file' => $file
        ]);

        $response->assertStatus(201);
        $response->assertJsonFragment([
            'original_filename' => 'image.jpg',
            'user_id' => 1
        ]);
    }
    
    public function testCanGetUserFromUploadedImage()
    {
        $this->seed();

        Sanctum::actingAs(
            $user = User::find(1),
            ['*']
        );

        Storage::fake('public');
        $file = UploadedFile::fake()->image('fakeImage.jpg');

        $response = $this->postJson('/api/media/upload', [
            'file' => $file
        ]);

        $response->assertStatus(201);
        $response->assertJsonFragment([
            'original_filename' => 'fakeImage.jpg',
            'user_id' => 1
        ]);

        $media = Media::where('original_filename', 'fakeImage.jpg')->first();
        $this->assertTrue($media->user->id === 1);
    }
    
    public function testCanGetAUsersMediaObjects()
    {
        $this->seed();

        Sanctum::actingAs(
            $user = User::find(1),
            ['*']
        );

        Storage::fake('public');
        $file = UploadedFile::fake()->image('fakeImage.jpg');

        $response = $this->postJson('/api/media/upload', [
            'file' => $file
        ]);

        $response->assertStatus(201);
        $response->assertJsonFragment([
            'original_filename' => 'fakeImage.jpg',
            'user_id' => 1
        ]);

        $user = User::find(1);
        $this->assertTrue($user->media->count() === 1);
    }
}
