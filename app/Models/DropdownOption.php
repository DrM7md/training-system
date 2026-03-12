<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DropdownOption extends Model
{
    protected $fillable = ['category', 'value', 'label', 'sort_order', 'is_active'];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByCategory($query, string $category)
    {
        return $query->where('category', $category)->orderBy('sort_order');
    }

    public static function getOptions(string $category): \Illuminate\Database\Eloquent\Collection
    {
        return self::active()->byCategory($category)->get();
    }
}
