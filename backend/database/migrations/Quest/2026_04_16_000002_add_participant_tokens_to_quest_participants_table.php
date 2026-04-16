<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class () extends Migration {
    public function up(): void
    {
        Schema::table('quest_participants', function (Blueprint $table) {
            $table->string('participant_token_hash', 64)->nullable()->after('anonymous_details');
            $table->dateTime('participant_token_expires_at')->nullable()->after('participant_token_hash');
            $table->dateTime('participant_token_revoked_at')->nullable()->after('participant_token_expires_at');
            $table->index('participant_token_hash');
        });
    }

    public function down(): void
    {
        Schema::table('quest_participants', function (Blueprint $table) {
            $table->dropIndex(['participant_token_hash']);
            $table->dropColumn([
                'participant_token_hash',
                'participant_token_expires_at',
                'participant_token_revoked_at',
            ]);
        });
    }
};
