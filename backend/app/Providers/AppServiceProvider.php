<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Observers\PersonalAccessTokenObserver;
use Laravel\Sanctum\PersonalAccessToken;
use App\Observers\ActivityLoggerObserver;
use App\Models\User;
use App\Models\Institution;
use App\Models\Survey\Survey;
use App\Models\Quiz\Quiz;
use App\Models\Quest\Quest;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Load migrations from default path
        $this->loadMigrationsFrom([
            database_path('migrations'),
            database_path('migrations/Quiz'),
            database_path('migrations/Survey'),
            database_path('migrations/Quest'),
        ]);

        // Observe Sanctum token creations for login logs
        PersonalAccessToken::observe(PersonalAccessTokenObserver::class);

        // Observe core models for activity logs
        User::observe(ActivityLoggerObserver::class);
        Institution::observe(ActivityLoggerObserver::class);
        Survey::observe(ActivityLoggerObserver::class);
        Quiz::observe(ActivityLoggerObserver::class);
        Quest::observe(ActivityLoggerObserver::class);
    }
}
