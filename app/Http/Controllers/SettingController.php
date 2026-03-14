<?php

namespace App\Http\Controllers;

use App\Models\DropdownOption;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class SettingController extends Controller
{
    public function index()
    {
        $settings = Setting::all()->groupBy('group');
        $dropdownCategories = DropdownOption::orderBy('category')
            ->orderBy('sort_order')
            ->get()
            ->groupBy('category');

        return Inertia::render('Settings/Index', [
            'settings' => $settings,
            'dropdownCategories' => $dropdownCategories,
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'settings' => 'required|array',
            'settings.*.key' => 'required|string',
            'settings.*.value' => 'nullable|string',
            'logo' => 'nullable|image|max:2048',
        ]);

        foreach ($validated['settings'] as $setting) {
            Setting::where('key', $setting['key'])->update(['value' => $setting['value']]);
        }

        if ($request->hasFile('logo')) {
            $oldLogo = Setting::where('key', 'organization_logo')->value('value');
            if ($oldLogo) {
                $oldPath = str_replace('/storage/', '', $oldLogo);
                Storage::disk('public')->delete($oldPath);
            }

            $path = $request->file('logo')->store('logos', 'public');
            Setting::where('key', 'organization_logo')->update(['value' => '/storage/' . $path]);
        }

        return back()->with('success', 'تم حفظ الإعدادات بنجاح');
    }
}
