<?php

namespace App\Exports;

use App\Models\AcademicYear;
use App\Models\Package;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Border;

class PackagesExport implements FromCollection, WithHeadings, WithStyles, ShouldAutoSize
{
    public function collection()
    {
        $currentYear = AcademicYear::current();

        return Package::with(['program', 'supervisor'])
            ->withCount('programGroups')
            ->when($currentYear, fn($q) => $q->whereHas('program', fn($q2) => $q2->where('academic_year_id', $currentYear->id)))
            ->orderBy('name')
            ->get()
            ->map(fn($p, $i) => [
                'num' => $i + 1,
                'name' => $p->name,
                'program' => $p->program?->name ?? '-',
                'hours' => $p->hours ?? 0,
                'days' => $p->days ?? 0,
                'supervisor' => $p->supervisor?->name ?? '-',
                'groups_count' => $p->program_groups_count,
                'description' => $p->description ?? '-',
            ]);
    }

    public function headings(): array
    {
        return ['#', 'اسم الحقيبة', 'البرنامج', 'الساعات', 'الأيام', 'المشرف', 'عدد المجموعات', 'الوصف'];
    }

    public function styles(Worksheet $sheet)
    {
        $lastRow = $sheet->getHighestRow();
        $lastCol = 'H';

        $sheet->setRightToLeft(true);

        $sheet->getStyle("A1:{$lastCol}1")->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF'], 'size' => 12],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '3B82F6']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ]);

        $sheet->getStyle("A1:{$lastCol}{$lastRow}")->applyFromArray([
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'D1D5DB']]],
        ]);

        for ($i = 2; $i <= $lastRow; $i++) {
            if ($i % 2 === 0) {
                $sheet->getStyle("A{$i}:{$lastCol}{$i}")->applyFromArray([
                    'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'EFF6FF']],
                ]);
            }
        }

        $sheet->getRowDimension(1)->setRowHeight(30);

        return [];
    }
}
