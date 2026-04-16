<?php

namespace App\Providers;

use App\Listeners\LogEmailSent;
use App\Listeners\LogLogin;
use App\Listeners\LogLogout;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use Illuminate\Mail\Events\MessageSent;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        Login::class => [LogLogin::class],
        Logout::class => [LogLogout::class],
        MessageSent::class => [LogEmailSent::class],
    ];
}
