<?php

namespace App\Exports;

use App\Models\AcademicYear;
use App\Models\Package;
use App\Models\Program;
use App\Models\DropdownOption;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Border;

class ProgramsExport implements FromCollection, WithHeadings, WithStyles, ShouldAutoSize
{
    protected array $typeLabels = [];

    public function __construct()
    {
        $programTypes = DropdownOption::getOptions('program_types');
        foreach ($programTypes as $type) {
            $this->typeLabels[$type->value] = $type->label;
        }
    }

    public function collection()
    {
        $currentYear = AcademicYear::current();
        $counter = 0;

        $programs = Program::with(['supervisor', 'packages.supervisor'])
            ->when($currentYear, fn($q) => $q->where('academic_year_id', $currentYear->id))
            ->where('is_archived', false)
            ->orderBy('name')
            ->get();

        $rows = collect();

        foreach ($programs as $program) {
            $typeLabel = $this->typeLabels[$program->type] ?? $program->type ?? '-';

            if ($program->packages->isEmpty()) {
                // برنامج بدون حقائب - صف واحد
                $counter++;
                $rows->push([
                    'num' => $counter,
                    'type' => $typeLabel,
                    'target_audience' => $program->target_audience ?? '-',
                    'program_name' => $program->name,
                    'program_hours' => $program->hours ?? 0,
                    'package_name' => '-',
                    'package_hours' => '-',
                    'days' => '-',
                    'male_count' => $program->male_count ?? 0,
                    'female_count' => $program->female_count ?? 0,
                    'supervisor' => $program->supervisor?->name ?? '-',
                    'quality_officer' => '-',
                    'rating' => '-',
                ]);
            } else {
                // صف لكل حقيبة في البرنامج
                foreach ($program->packages as $package) {
                    $counter++;
                    $rows->push([
                        'num' => $counter,
                        'type' => $typeLabel,
                        'target_audience' => $program->target_audience ?? '-',
                        'program_name' => $program->name,
                        'program_hours' => $program->hours ?? 0,
                        'package_name' => $package->name,
                        'package_hours' => $package->hours ?? 0,
                        'days' => $package->days ?? 0,
                        'male_count' => $program->male_count ?? 0,
                        'female_count' => $program->female_count ?? 0,
                        'supervisor' => $package->supervisor?->name ?? $program->supervisor?->name ?? '-',
                        'quality_officer' => $package->quality_officer ?? '-',
                        'rating' => $package->rating ?? '-',
                    ]);
                }
            }
        }

        return $rows;
    }

    public function headings(): array
    {
        return [
            'مسلسل',
            'نوع البرنامج',
            'الفئة المستهدفة',
            'اسم البرنامج التدريبي',
            'عدد ساعات البرنامج',
            'اسم الحقيبة التدريبية',
            'عدد ساعات الحقيبة',
            'عدد الأيام',
            'عدد الذكور',
            'عدد الإناث',
            'اسم المشرف',
            'مسؤول ضمان جودة الحقيبة',
            'التقييم العام للحقيبة التدريبية',
        ];
    }

    public function styles(Worksheet $sheet)
    {
        $lastRow = $sheet->getHighestRow();
        $lastCol = 'M';

        $sheet->setRightToLeft(true);

        // Header style
        $sheet->getStyle("A1:{$lastCol}1")->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF'], 'size' => 12],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '0D9488']],
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

        $sheet->getRowDimension(1)->setRowHeight(30);

        return [];
    }
}
