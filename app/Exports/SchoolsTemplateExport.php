<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Cell\DataValidation;

class SchoolsTemplateExport implements FromArray, WithHeadings, WithStyles, ShouldAutoSize
{
    public function array(): array
    {
        return [
            [
                1, 'مدرسة النموذجية الإعدادية', 'إعدادي', 'بنين',
                'الدوحة', 'أحمد محمد العلي', '55512345',
                '40123248', 'school@example.com',
            ],
        ];
    }

    public function headings(): array
    {
        return [
            'مسلسل',
            'اسم المدرسة',
            'المرحلة الدراسية',
            'فئة المدرسة',
            'المنطقة الجغرافية',
            'اسم مدير المدرسة',
            'رقم الجوال',
            'رقم الهاتف',
            'البريد الإلكتروني',
        ];
    }

    public function styles(Worksheet $sheet)
    {
        $lastCol = 'I';

        $sheet->setRightToLeft(true);

        // Header style
        $sheet->getStyle("A1:{$lastCol}1")->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF'], 'size' => 11],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '7C2D12']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER, 'wrapText' => true],
        ]);

        // Example row style
        $sheet->getStyle("A2:{$lastCol}2")->applyFromArray([
            'font' => ['color' => ['rgb' => '9CA3AF'], 'italic' => true],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'FFF7ED']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ]);

        // All cells borders
        $sheet->getStyle("A1:{$lastCol}2")->applyFromArray([
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'D1D5DB']]],
        ]);

        $sheet->getRowDimension(1)->setRowHeight(35);
        $sheet->getRowDimension(2)->setRowHeight(25);

        // Data validation for فئة المدرسة (column D)
        $typeValidation = new DataValidation();
        $typeValidation->setType(DataValidation::TYPE_LIST);
        $typeValidation->setAllowBlank(false);
        $typeValidation->setFormula1('"بنين,بنات"');
        for ($i = 3; $i <= 500; $i++) {
            $sheet->getCell("D{$i}")->setDataValidation(clone $typeValidation);
        }

        // Column widths
        $sheet->getColumnDimension('B')->setWidth(35); // اسم المدرسة
        $sheet->getColumnDimension('C')->setWidth(18); // المرحلة
        $sheet->getColumnDimension('E')->setWidth(20); // المنطقة
        $sheet->getColumnDimension('F')->setWidth(25); // المدير
        $sheet->getColumnDimension('G')->setWidth(25); // الجوال
        $sheet->getColumnDimension('H')->setWidth(30); // الهاتف
        $sheet->getColumnDimension('I')->setWidth(28); // البريد

        return [];
    }
}
