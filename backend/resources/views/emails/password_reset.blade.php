@component('mail::message')
# Password Reset Request

You requested a password reset. Click the button below to reset your password:

@component('mail::button', ['url' => frontend_url('/auth/reset-password/') . 'token=' . $token])
Reset Password
@endcomponent

If you did not request this, please ignore this email.

Thanks,<br>
{{ config('app.name') }}
@endcomponent
