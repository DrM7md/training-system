<?php

namespace App\Http\Controllers;

use App\Imports\TrainersImport;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;

class ImportController extends Controller
{
    public function trainers(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls,csv|max:10240',
        ]);

        $import = new TrainersImport();
        Excel::import($import, $request->file('file'));

        $summary = $import->getSummary();

        $message = "تم استيراد {$summary['imported']} مدرب بنجاح";
        if ($summary['skipped'] > 0) {
            $message .= " وتم تخطي {$summary['skipped']} صف";
        }

        if (!empty($summary['errors'])) {
            return back()->with('warning', $message)->with('import_errors', $summary['errors']);
        }

        return back()->with('success', $message);
    }
}
