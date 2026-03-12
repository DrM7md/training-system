<?php

namespace App\Exports;

use App\Models\AcademicYear;
use App\Models\Program;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Border;

class ProgramsExport implements FromCollection, WithHeadings, WithStyles, ShouldAutoSize
{
    public function collection()
    {
        $currentYear = AcademicYear::current();

        return Program::with(['supervisor', 'academicYear'])
            ->withCount('packages')
            ->when($currentYear, fn($q) => $q->where('academic_year_id', $currentYear->id))
            ->orderBy('name')
            ->get()
            ->map(fn($p, $i) => [
                'num' => $i + 1,
                'name' => $p->name,
                'type' => match($p->type) {
                    'qualification' => 'تأهيل',
                    'licensing' => 'ترخيص',
                    'development' => 'تطوير',
                    default => $p->type ?? '-',
                },
                'status' => match($p->status) {
                    'new' => 'جديد',
                    'existing' => 'قائم',
                    default => $p->status ?? '-',
                },
                'hours' => $p->hours ?? 0,
                'target_audience' => $p->target_audience ?? '-',
                'target_count' => $p->target_count ?? 0,
                'male_count' => $p->male_count ?? 0,
                'female_count' => $p->female_count ?? 0,
                'supervisor' => $p->supervisor?->name ?? '-',
                'packages_count' => $p->packages_count,
                'approved' => $p->is_approved ? 'نعم' : 'لا',
                'academic_year' => $p->academicYear?->name ?? '-',
            ]);
    }

    public function headings(): array
    {
        return ['#', 'اسم البرنامج', 'النوع', 'الحالة', 'الساعات', 'الفئة المستهدفة', 'العدد المستهدف', 'ذكور', 'إناث', 'المشرف', 'عدد الحقائب', 'معتمد', 'العام الدراسي'];
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
