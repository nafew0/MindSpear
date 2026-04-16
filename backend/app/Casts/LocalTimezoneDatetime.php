<?php

namespace App\Casts;

use Illuminate\Contracts\Database\Eloquent\CastsAttributes;

class LocalTimezoneDatetime implements CastsAttributes
{
    public function get($model, string $key, $value, array $attributes)
    {
        if (is_null($value)) {
            return null;
        }

        $timezone = $model->timezone ?: config('app.timezone');

        try {
            $date = new \DateTime($value, new \DateTimeZone('UTC'));
            $date->setTimezone(new \DateTimeZone($timezone));

            return $date->format('Y-m-d H:i:s');
        } catch (\Exception $e) {
            return $value;
        }
    }

    public function set($model, string $key, $value, array $attributes)
    {
        return $value;
    }
}
