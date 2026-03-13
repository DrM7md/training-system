<?php

namespace App\Http\Controllers;

use App\Imports\TrainersImport;
use App\Imports\SchoolsImport;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;

class ImportController extends Controller
{
    public function trainers(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls,csv|max:10240',
            'mode' => 'required|in:skip,update',
        ]);

        $import = new TrainersImport($request->input('mode', 'skip'));
        Excel::import($import, $request->file('file'));

        $summary = $import->getSummary();

        $parts = [];
        if ($summary['imported'] > 0) {
            $parts[] = "تم إضافة {$summary['imported']} مدرب جديد";
        }
        if ($summary['updated'] > 0) {
            $parts[] = "تم تحديث {$summary['updated']} مدرب";
        }
        if ($summary['skipped'] > 0) {
            $parts[] = "تم تخطي {$summary['skipped']} صف";
        }

        $message = implode('، ', $parts) ?: 'لم يتم استيراد أي بيانات';

        if (!empty($summary['errors'])) {
            return back()->with('warning', $message)->with('import_errors', $summary['errors']);
        }

        return back()->with('success', $message);
    }

    public function schools(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls,csv|max:10240',
            'mode' => 'required|in:skip,update',
        ]);

        $import = new SchoolsImport($request->input('mode', 'skip'));
        Excel::import($import, $request->file('file'));

        $summary = $import->getSummary();

        $parts = [];
        if ($summary['imported'] > 0) {
            $parts[] = "تم إضافة {$summary['imported']} مدرسة جديدة";
        }
        if ($summary['updated'] > 0) {
            $parts[] = "تم تحديث {$summary['updated']} مدرسة";
        }
        if ($summary['skipped'] > 0) {
            $parts[] = "تم تخطي {$summary['skipped']} صف";
        }

        $message = implode('، ', $parts) ?: 'لم يتم استيراد أي بيانات';

        if (!empty($summary['errors'])) {
            return back()->with('warning', $message)->with('import_errors', $summary['errors']);
        }

        return back()->with('success', $message);
    }
}
