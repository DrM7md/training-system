<?php

namespace App\Exports;

use App\Models\School;
use App\Models\AcademicYear;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Border;

class SchoolsExport implements FromCollection, WithHeadings, WithStyles, ShouldAutoSize
{
    public function collection()
    {
        $currentYear = AcademicYear::current();

        return School::where('academic_year_id', $currentYear?->id)
            ->orderBy('name')
            ->get()
            ->map(fn($s, $i) => [
                'num' => $i + 1,
                'name' => $s->name,
                'education_level' => $s->education_level ?? '-',
                'type' => match($s->type) {
                    'male' => 'بنين',
                    'female' => 'بنات',
                    default => $s->type ?? '-',
                },
                'district' => $s->district ?? '-',
                'principal_name' => $s->principal_name ?? '-',
                'phone' => $s->phone ?? '-',
                'landline' => $s->landline ?? '-',
                'email' => $s->email ?? '-',
            ]);
    }

    public function headings(): array
    {
        return [
            '#', 'اسم المدرسة', 'المرحلة الدراسية', 'فئة المدرسة',
            'المنطقة الجغرافية', 'اسم مدير المدرسة', 'رقم الجوال',
            'رقم الهاتف', 'البريد الإلكتروني',
        ];
    }

    public function styles(Worksheet $sheet)
    {
        $lastRow = $sheet->getHighestRow();
        $lastCol = 'I';

        $sheet->setRightToLeft(true);

        $sheet->getStyle("A1:{$lastCol}1")->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF'], 'size' => 12],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '7C2D12']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ]);

        $sheet->getStyle("A1:{$lastCol}{$lastRow}")->applyFromArray([
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'D1D5DB']]],
        ]);

        for ($i = 2; $i <= $lastRow; $i++) {
            if ($i % 2 === 0) {
                $sheet->getStyle("A{$i}:{$lastCol}{$i}")->applyFromArray([
                    'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'FFF7ED']],
                ]);
            }
        }

        $sheet->getRowDimension(1)->setRowHeight(30);

        return [];
    }
}
