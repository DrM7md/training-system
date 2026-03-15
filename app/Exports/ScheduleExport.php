<?php

namespace App\Exports;

use App\Models\TrainingSession;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Border;

class ScheduleExport implements FromCollection, WithHeadings, WithStyles, ShouldAutoSize, WithTitle
{
    public function collection()
    {
        $statusLabels = [
            'scheduled' => 'مجدول',
            'completed' => 'مكتمل',
            'cancelled' => 'ملغي',
            'postponed' => 'مؤجل',
        ];

        $genderLabels = [
            'male' => 'ذكور',
            'female' => 'إناث',
            'mixed' => 'مختلط',
        ];

        $dayNames = [
            'Sunday' => 'الأحد',
            'Monday' => 'الاثنين',
            'Tuesday' => 'الثلاثاء',
            'Wednesday' => 'الأربعاء',
            'Thursday' => 'الخميس',
            'Friday' => 'الجمعة',
            'Saturday' => 'السبت',
        ];

        return TrainingSession::with([
            'programGroup.package.program',
            'programGroup.package.supervisor',
            'programGroup.trainer',
            'programGroup.trainees',
            'trainingHall',
        ])
            ->orderBy('date')
            ->orderBy('training_hall_id')
            ->get()
            ->map(function ($s, $i) use ($statusLabels, $genderLabels, $dayNames) {
                $dayName = $dayNames[$s->date->format('l')] ?? $s->date->format('l');

                return [
                    'num' => $i + 1,
                    'date' => $s->date->format('Y-m-d'),
                    'day_name' => $dayName,
                    'day_number' => $s->day_number,
                    'program' => $s->programGroup?->package?->program?->name ?? '-',
                    'package' => $s->programGroup?->package?->name ?? '-',
                    'group' => $s->programGroup?->name ?? '-',
                    'gender' => $genderLabels[$s->programGroup?->gender] ?? '-',
                    'trainees_count' => $s->programGroup?->trainees?->count() ?? 0,
                    'trainer' => $s->programGroup?->trainer?->name ?? '-',
                    'supervisor' => $s->programGroup?->package?->supervisor?->name ?? '-',
                    'hall' => $s->trainingHall?->name ?? '-',
                    'hall_capacity' => $s->trainingHall?->capacity ?? '-',
                    'status' => $statusLabels[$s->status] ?? $s->status,
                    'notes' => $s->notes ?? '-',
                ];
            });
    }

    public function headings(): array
    {
        return [
            '#',
            'التاريخ',
            'اليوم',
            'رقم اليوم',
            'البرنامج',
            'الحقيبة',
            'المجموعة',
            'الجنس',
            'عدد المتدربين',
            'المدرب',
            'المشرف',
            'القاعة',
            'سعة القاعة',
            'الحالة',
            'ملاحظات',
        ];
    }

    public function title(): string
    {
        return 'جدول القاعات';
    }

    public function styles(Worksheet $sheet)
    {
        $lastRow = $sheet->getHighestRow();
        $lastCol = 'O';

        $sheet->setRightToLeft(true);

        // Header style
        $sheet->getStyle("A1:{$lastCol}1")->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF'], 'size' => 12],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '0F766E']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ]);

        // All cells
        $sheet->getStyle("A1:{$lastCol}{$lastRow}")->applyFromArray([
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'D1D5DB']]],
        ]);

        // Alternating rows
        for ($i = 2; $i <= $lastRow; $i++) {
            if ($i % 2 === 0) {
                $sheet->getStyle("A{$i}:{$lastCol}{$i}")->applyFromArray([
                    'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'F0FDFA']],
                ]);
            }
        }

        // Header height
        $sheet->getRowDimension(1)->setRowHeight(30);

        return [];
    }
}
