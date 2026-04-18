<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class () extends Migration {
    public function up(): void
    {
        $this->replaceLegacyIndex('quest_participants');
        $this->replaceLegacyIndex('quiz_participants');
    }

    public function down(): void
    {
        // Keep participant tokens unique even when this safety migration is rolled back.
        // The original token migrations own removing the columns and their indexes.
    }

    private function replaceLegacyIndex(string $table): void
    {
        DB::statement("DROP INDEX IF EXISTS {$table}_participant_token_hash_index");
        DB::statement("CREATE UNIQUE INDEX IF NOT EXISTS {$table}_participant_token_hash_unique ON {$table} (participant_token_hash)");
    }
};
