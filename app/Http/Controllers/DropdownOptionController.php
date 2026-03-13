<?php

namespace App\Http\Controllers;

use App\Models\DropdownOption;
use Illuminate\Http\Request;

class DropdownOptionController extends Controller
{
    public function index(string $category)
    {
        return DropdownOption::byCategory($category)->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category' => 'required|string|max:100',
            'value' => 'required|string|max:100',
            'label' => 'required|string|max:255',
            'rate' => 'nullable|numeric|min:0',
        ]);

        $maxOrder = DropdownOption::where('category', $validated['category'])->max('sort_order') ?? 0;
        $validated['sort_order'] = $maxOrder + 1;

        DropdownOption::create($validated);

        return back()->with('success', 'تم إضافة الخيار بنجاح');
    }

    public function update(Request $request, DropdownOption $dropdownOption)
    {
        $validated = $request->validate([
            'label' => 'required|string|max:255',
            'value' => 'required|string|max:100',
            'rate' => 'nullable|numeric|min:0',
            'is_active' => 'boolean',
        ]);

        $dropdownOption->update($validated);

        return back()->with('success', 'تم تحديث الخيار بنجاح');
    }

    public function destroy(DropdownOption $dropdownOption)
    {
        $dropdownOption->delete();
        return back()->with('success', 'تم حذف الخيار بنجاح');
    }

    public function reorder(Request $request)
    {
        $request->validate([
            'items' => 'required|array',
            'items.*.id' => 'required|exists:dropdown_options,id',
            'items.*.sort_order' => 'required|integer',
        ]);

        foreach ($request->items as $item) {
            DropdownOption::where('id', $item['id'])->update(['sort_order' => $item['sort_order']]);
        }

        return back()->with('success', 'تم إعادة الترتيب بنجاح');
    }
}
