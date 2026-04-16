<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        $this->call([
            UsersTableSeeder::class,
            PasswordResetTokensTableSeeder::class,
            PreferencesTableSeeder::class,
            SuperAdminSeeder::class,
        ]);

        $seederRoot = database_path('seeders');

        // Scan all subfolders inside database/seeders
//        foreach (File::directories($seederRoot) as $folder) {
//            $this->seedFolder($folder);
//        }
    }

    protected function seedFolder(string $folder)
    {
        // Determine namespace from folder name
        $namespace = 'Database\\Seeders\\' . basename($folder);

        foreach (File::files($folder) as $file) {
            $className = $namespace . '\\' . $file->getFilenameWithoutExtension();

            if (class_exists($className)) {
                $this->call($className);
            }
        }
    }
}
