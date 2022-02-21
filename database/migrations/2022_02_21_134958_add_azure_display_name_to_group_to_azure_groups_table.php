<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddAzureDisplayNameToGroupToAzureGroupsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('group_to_azure_groups', function (Blueprint $table) {
            $table->string('azure_display_name')->after('azure_group_id')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('group_to_azure_groups', function (Blueprint $table) {
            $table->dropColumn('azure_display_name');
        });
    }
}
