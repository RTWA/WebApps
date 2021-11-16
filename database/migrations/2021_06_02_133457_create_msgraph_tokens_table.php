<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateMsgraphTokensTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('msgraph_tokens', function (Blueprint $table) {
            $table->id();
            $table->integer('user_id')->nullable();
            $table->string('email')->nullable();
            $table->text('access_token');
            $table->text('refresh_token')->nullable();
            $table->string('expires');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('msgraph_tokens');
    }
}
