<?php

namespace App\Http\Controllers;

use App\Models\Assignment;
use App\Models\CertificateLog;
use App\Models\CertificateTemplate;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use PhpOffice\PhpWord\TemplateProcessor;

class CertificateController extends Controller
{
    public function index(Request $request)
    {
        $templates = CertificateTemplate::with('creator:id,name')
            ->latest()->get();

        $logs = CertificateLog::with([
            'template:id,name',
            'trainer:id,name',
            'assignment.program:id,name',
            'assignment.package:id,name,hours,program_id',
            'generatedBy:id,name',
        ])
            ->when($request->search, function ($q, $s) {
                $q->whereHas('trainer', fn($q2) => $q2->where('name', 'like', "%{$s}%"));
            })
            ->latest()
            ->paginate(20)
            ->withQueryString();

        $assignments = Assignment::with(['trainer:id,name,employer', 'program:id,name', 'package:id,name,hours,days,program_id'])
            ->latest()->get();

        $currentYear = \App\Models\AcademicYear::where('is_current', true)->first();

        return Inertia::render('Certificates/Index', [
            'templates' => $templates,
            'logs' => $logs,
            'assignments' => $assignments,
            'filters' => $request->only(['search']),
            'currentYear' => $currentYear ? $currentYear->name : '',
        ]);
    }

    public function storeTemplate(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'file' => 'required|file|mimes:docx|max:10240',
        ]);

        $file = $request->file('file');
        $path = $file->store('certificates/templates', 'public');

        // Try to detect placeholders from the docx
        $placeholders = $this->detectPlaceholders(Storage::disk('public')->path($path));

        CertificateTemplate::create([
            'name' => $request->name,
            'description' => $request->description,
            'file_path' => $path,
            'original_filename' => $file->getClientOriginalName(),
            'placeholders' => $placeholders,
            'created_by' => $request->user()->id,
        ]);

        return back()->with('success', 'تم رفع القالب بنجاح');
    }

    public function updateTemplate(Request $request, CertificateTemplate $template)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'file' => 'nullable|file|mimes:docx|max:10240',
        ]);

        $data = [
            'name' => $request->name,
            'description' => $request->description,
        ];

        if ($request->hasFile('file')) {
            Storage::disk('public')->delete($template->file_path);
            $file = $request->file('file');
            $data['file_path'] = $file->store('certificates/templates', 'public');
            $data['original_filename'] = $file->getClientOriginalName();
            $data['placeholders'] = $this->detectPlaceholders(Storage::disk('public')->path($data['file_path']));
        }

        $template->update($data);

        return back()->with('success', 'تم تحديث القالب بنجاح');
    }

    public function destroyTemplate(CertificateTemplate $template)
    {
        Storage::disk('public')->delete($template->file_path);
        $template->delete();

        return back()->with('success', 'تم حذف القالب بنجاح');
    }

    public function generate(Request $request)
    {
        $validated = $request->validate([
            'template_id' => 'required|exists:certificate_templates,id',
            'assignment_id' => 'required|exists:assignments,id',
        ]);

        $template = CertificateTemplate::findOrFail($validated['template_id']);
        $assignment = Assignment::with(['trainer', 'program', 'package', 'groups'])->findOrFail($validated['assignment_id']);

        $currentYear = \App\Models\AcademicYear::where('is_current', true)->first();

        // Build placeholder data
        $data = [
            'trainer_name' => $assignment->trainer->name ?? '',
            'employee_name' => $assignment->trainer->name ?? '',
            'national_id' => $assignment->trainer->national_id ?? '',
            'employee_id' => $assignment->trainer->employee_id ?? '',
            'employer' => $assignment->trainer->employer ?? '',
            'program_name' => $assignment->program->name ?? '',
            'package_name' => $assignment->package->name ?? '',
            'hours' => (string) ($assignment->package->hours ?? ''),
            'days' => (string) ($assignment->package->days ?? ''),
            'start_date' => $assignment->start_date?->format('Y-m-d') ?? '',
            'end_date' => $assignment->end_date?->format('Y-m-d') ?? '',
            'assignment_type' => $assignment->assignment_type ?? '',
            'group_names' => $assignment->groups->pluck('name')->join('، '),
            'academic_year' => $currentYear->name ?? '',
            'date' => now()->format('Y-m-d'),
            'organization_name' => Setting::get('organization_name', ''),
        ];

        // Process template
        $templatePath = Storage::disk('public')->path($template->file_path);
        $processor = new TemplateProcessor($templatePath);

        foreach ($data as $key => $value) {
            $processor->setValue($key, $value);
        }

        // Save generated file
        $outputFilename = "certificate_{$assignment->trainer_id}_{$assignment->id}_" . time() . '.docx';
        $outputPath = "certificates/generated/{$outputFilename}";
        Storage::disk('public')->makeDirectory('certificates/generated');
        $processor->saveAs(Storage::disk('public')->path($outputPath));

        // Log
        CertificateLog::create([
            'certificate_template_id' => $template->id,
            'assignment_id' => $assignment->id,
            'trainer_id' => $assignment->trainer_id,
            'generated_by' => $request->user()->id,
            'file_path' => $outputPath,
            'placeholder_data' => $data,
        ]);

        $downloadName = "شهادة_{$assignment->trainer->name}_{$assignment->program->name}.docx";

        return response()->download(Storage::disk('public')->path($outputPath), $downloadName);
    }

    public function download(CertificateLog $log)
    {
        if (!$log->file_path || !Storage::disk('public')->exists($log->file_path)) {
            return back()->with('error', 'الملف غير موجود');
        }

        $trainerName = $log->trainer?->name ?? 'شهادة';
        return response()->download(Storage::disk('public')->path($log->file_path), "شهادة_{$trainerName}.docx");
    }

    private function detectPlaceholders(string $filePath): array
    {
        try {
            $processor = new TemplateProcessor($filePath);
            return $processor->getVariables();
        } catch (\Exception $e) {
            return [];
        }
    }
}
