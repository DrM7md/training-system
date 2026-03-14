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

class TrainersTemplateExport implements FromArray, WithHeadings, WithStyles, ShouldAutoSize
{
    public function array(): array
    {
        return [
            [
                1, 'ذكر', '28401234567', 'E12345', 'أحمد محمد علي', 'قطر',
                'داخلي', 'وزارة التعليم', 'مدرب أول', 'منتسبو المدارس الحكومية',
                'ماجستير', 'تقنية المعلومات',
                5, 'نعم', 'نعم', 'التدريب التقني والإداري', 'رجال ونساء',
                '', 'متعاون', '55512345', 'ahmed@example.com',
                'محمد أحمد العلي', '',
            ],
        ];
    }

    public function headings(): array
    {
        return [
            'مسلسل',           // A
            'الجنس',           // B
            'الرقم الشخصي',    // C
            'الرقم الوظيفي',   // D
            'الاسم',           // E
            'الجنسية',         // F
            'نوع جهة العمل',   // G
            'جهة العمل',       // H
            'المسمى الوظيفي',  // I
            'الفئة الوظيفية',  // J (moved here)
            'المستوى العلمي',  // K
            'التخصص العلمي',   // L
            'سنوات الخبرة في التدريب', // M
            'شهادة مدرب معتمد', // N
            'إعداد الحقائب التدريبية', // O
            'مجالات التدريب وإعداد الحقائب', // P
            'جنس التدريب',     // Q
            'تقييم المدرب',    // R
            'حالة التعاون',    // S
            'رقم الجوال',      // T
            'البريد الإلكتروني', // U
            'المسؤول المباشر / المدير', // V
            'ملاحظات',         // W
        ];
    }

    public function styles(Worksheet $sheet)
    {
        $lastCol = 'W';

        $sheet->setRightToLeft(true);

        // Header style
        $sheet->getStyle("A1:{$lastCol}1")->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF'], 'size' => 11],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '7C3AED']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER, 'wrapText' => true],
        ]);

        // Example row style
        $sheet->getStyle("A2:{$lastCol}2")->applyFromArray([
            'font' => ['color' => ['rgb' => '9CA3AF'], 'italic' => true],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'F5F3FF']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ]);

        // All cells borders
        $sheet->getStyle("A1:{$lastCol}2")->applyFromArray([
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'D1D5DB']]],
        ]);

        $sheet->getRowDimension(1)->setRowHeight(35);
        $sheet->getRowDimension(2)->setRowHeight(25);

        // Data validation for الجنس (column B)
        $genderValidation = new DataValidation();
        $genderValidation->setType(DataValidation::TYPE_LIST);
        $genderValidation->setAllowBlank(false);
        $genderValidation->setFormula1('"ذكر,أنثى"');
        for ($i = 3; $i <= 500; $i++) {
            $sheet->getCell("B{$i}")->setDataValidation(clone $genderValidation);
        }

        // Data validation for نوع جهة العمل (column G)
        $employerTypeValidation = new DataValidation();
        $employerTypeValidation->setType(DataValidation::TYPE_LIST);
        $employerTypeValidation->setAllowBlank(true);
        $employerTypeValidation->setFormula1('"داخلي,خارجي"');
        for ($i = 3; $i <= 500; $i++) {
            $sheet->getCell("G{$i}")->setDataValidation(clone $employerTypeValidation);
        }

        // Data validation for الفئة الوظيفية (column J)
        $jobCategoryValidation = new DataValidation();
        $jobCategoryValidation->setType(DataValidation::TYPE_LIST);
        $jobCategoryValidation->setAllowBlank(true);
        $jobCategoryValidation->setFormula1('"منتسبو المدارس الحكومية,منتسبو وزارة التربية والتعليم,منتسبو المدارس الخاصة,منتسبو الجهات الخارجية,غير منتسب لجهة عمل,أخرى"');
        for ($i = 3; $i <= 500; $i++) {
            $sheet->getCell("J{$i}")->setDataValidation(clone $jobCategoryValidation);
        }

        // Data validation for شهادة مدرب معتمد (column N) and إعداد الحقائب (column O)
        $yesNoValidation = new DataValidation();
        $yesNoValidation->setType(DataValidation::TYPE_LIST);
        $yesNoValidation->setAllowBlank(true);
        $yesNoValidation->setFormula1('"نعم,لا"');
        for ($i = 3; $i <= 500; $i++) {
            $sheet->getCell("N{$i}")->setDataValidation(clone $yesNoValidation);
            $sheet->getCell("O{$i}")->setDataValidation(clone $yesNoValidation);
        }

        // Data validation for جنس التدريب (column Q)
        $trainingGenderValidation = new DataValidation();
        $trainingGenderValidation->setType(DataValidation::TYPE_LIST);
        $trainingGenderValidation->setAllowBlank(true);
        $trainingGenderValidation->setFormula1('"رجال,نساء,رجال ونساء"');
        for ($i = 3; $i <= 500; $i++) {
            $sheet->getCell("Q{$i}")->setDataValidation(clone $trainingGenderValidation);
        }

        // Set column widths for text fields
        $sheet->getColumnDimension('J')->setWidth(30);  // الفئة الوظيفية
        $sheet->getColumnDimension('P')->setWidth(35);  // مجالات التدريب
        $sheet->getColumnDimension('V')->setWidth(25);  // المسؤول المباشر
        $sheet->getColumnDimension('W')->setWidth(25);  // ملاحظات

        return [];
    }
}
