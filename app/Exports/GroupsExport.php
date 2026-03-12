<?php

namespace App\Exports;

use App\Models\AcademicYear;
use App\Models\ProgramGroup;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Border;

class GroupsExport implements FromCollection, WithHeadings, WithStyles, ShouldAutoSize
{
    public function collection()
    {
        $currentYear = AcademicYear::current();

        return ProgramGroup::with(['package.program', 'trainer', 'trainingHall', 'trainingSessions'])
            ->withCount('trainees')
            ->when($currentYear, fn($q) => $q->whereHas('package.program', fn($q2) => $q2->where('academic_year_id', $currentYear->id)))
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($g, $i) {
                $genderLabels = ['male' => 'ذكور', 'female' => 'إناث', 'mixed' => 'مختلط'];
                $statusLabels = ['scheduled' => 'مجدول', 'in_progress' => 'قيد التنفيذ', 'completed' => 'مكتمل', 'cancelled' => 'ملغي', 'postponed' => 'مؤجل'];

                $sessions = $g->trainingSessions->sortBy('date');
                $firstDate = $sessions->first()?->date?->format('Y-m-d') ?? '-';
                $lastDate = $sessions->last()?->date?->format('Y-m-d') ?? '-';

                return [
                    'num' => $i + 1,
                    'name' => $g->name,
                    'program' => $g->package?->program?->name ?? '-',
                    'package' => $g->package?->name ?? '-',
                    'gender' => $genderLabels[$g->gender] ?? $g->gender,
                    'trainer' => $g->trainer?->name ?? '-',
                    'hall' => $g->trainingHall?->name ?? '-',
                    'trainees_count' => $g->trainees_count,
                    'sessions_count' => $sessions->count(),
                    'total_days' => $g->package?->days ?? 0,
                    'start_date' => $firstDate,
                    'end_date' => $lastDate,
                    'status' => $statusLabels[$g->status] ?? $g->status,
                    'notes' => $g->notes ?? '-',
                ];
            });
    }

    public function headings(): array
    {
        return ['#', 'اسم المجموعة', 'البرنامج', 'الحقيبة', 'الجنس', 'المدرب', 'القاعة', 'عدد المتدربين', 'الجلسات المنفذة', 'إجمالي الأيام', 'تاريخ البداية', 'تاريخ النهاية', 'الحالة', 'ملاحظات'];
    }

    public function styles(Worksheet $sheet)
    {
        $lastRow = $sheet->getHighestRow();
        $lastCol = 'N';

        $sheet->setRightToLeft(true);

        $sheet->getStyle("A1:{$lastCol}1")->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF'], 'size' => 12],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '7C3AED']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ]);

        $sheet->getStyle("A1:{$lastCol}{$lastRow}")->applyFromArray([
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'D1D5DB']]],
        ]);

        for ($i = 2; $i <= $lastRow; $i++) {
            if ($i % 2 === 0) {
                $sheet->getStyle("A{$i}:{$lastCol}{$i}")->applyFromArray([
                    'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'F5F3FF']],
                ]);
            }
        }

        $sheet->getRowDimension(1)->setRowHeight(30);

        return [];
    }
}
