<?php

namespace App\Exports;

use App\Models\DropdownOption;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Cell\DataValidation;

class ProgramsTemplateExport implements FromArray, WithHeadings, WithStyles, ShouldAutoSize
{
    public function array(): array
    {
        return [
            [
                1, 'تأهيل', 'المعلمين', 'برنامج التأهيل التربوي',
                30, 'حقيبة التأهيل الأساسية', 15, 5,
                20, 10, 'أحمد محمد', 'سارة علي', 'ممتاز',
            ],
        ];
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
        $lastCol = 'M';

        $sheet->setRightToLeft(true);

        // Header style - teal theme
        $sheet->getStyle("A1:{$lastCol}1")->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF'], 'size' => 11],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '0D9488']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER, 'wrapText' => true],
        ]);

        // Example row style
        $sheet->getStyle("A2:{$lastCol}2")->applyFromArray([
            'font' => ['color' => ['rgb' => '9CA3AF'], 'italic' => true],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'F0FDFA']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ]);

        // Borders
        $sheet->getStyle("A1:{$lastCol}2")->applyFromArray([
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'D1D5DB']]],
        ]);

        $sheet->getRowDimension(1)->setRowHeight(35);
        $sheet->getRowDimension(2)->setRowHeight(25);

        // Data validation for نوع البرنامج (column B)
        $programTypes = DropdownOption::getOptions('program_types')->pluck('label')->implode(',');
        if ($programTypes) {
            $typeValidation = new DataValidation();
            $typeValidation->setType(DataValidation::TYPE_LIST);
            $typeValidation->setAllowBlank(true);
            $typeValidation->setFormula1('"' . $programTypes . '"');
            for ($i = 3; $i <= 500; $i++) {
                $sheet->getCell("B{$i}")->setDataValidation(clone $typeValidation);
            }
        }

        // Column widths
        $sheet->getColumnDimension('A')->setWidth(8);
        $sheet->getColumnDimension('B')->setWidth(18);  // نوع البرنامج
        $sheet->getColumnDimension('C')->setWidth(20);  // الفئة المستهدفة
        $sheet->getColumnDimension('D')->setWidth(35);  // اسم البرنامج
        $sheet->getColumnDimension('E')->setWidth(18);  // ساعات البرنامج
        $sheet->getColumnDimension('F')->setWidth(35);  // اسم الحقيبة
        $sheet->getColumnDimension('G')->setWidth(18);  // ساعات الحقيبة
        $sheet->getColumnDimension('H')->setWidth(12);  // الأيام
        $sheet->getColumnDimension('I')->setWidth(12);  // ذكور
        $sheet->getColumnDimension('J')->setWidth(12);  // إناث
        $sheet->getColumnDimension('K')->setWidth(22);  // المشرف
        $sheet->getColumnDimension('L')->setWidth(28);  // مسؤول الجودة
        $sheet->getColumnDimension('M')->setWidth(30);  // التقييم

        return [];
    }
}
