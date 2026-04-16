<?php

namespace App\Models\Log;

use Illuminate\Database\Eloquent\Model;

class EmailLog extends Model
{
    protected $fillable = [
        'to', 'subject', 'mailable', 'status', 'message_id', 'sent_at',
    ];

    protected $casts = [
        'sent_at' => 'datetime',
    ];
}
