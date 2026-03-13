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
        // صف مثال واحد لتوضيح التعبئة
        return [
            [
                1, 'ذكر', '28401234567', 'E12345', 'أحمد محمد علي', 'قطر',
                'داخلي', 'وزارة التعليم', 'مدرب أول', 'ماجستير', 'تقنية المعلومات',
                5, 'نعم', 'نعم', 'التدريب التقني والإداري', 'رجال ونساء',
                '', 'متعاون', '55512345', 'ahmed@example.com',
                'منتسبو المدارس الحكومية', 'نعم', 'محمد أحمد العلي', '',
            ],
        ];
    }

    public function headings(): array
    {
        return [
            'مسلسل',
            'الجنس',
            'الرقم الشخصي',
            'الرقم الوظيفي',
            'الاسم',
            'الجنسية',
            'نوع جهة العمل',
            'جهة العمل',
            'المسمى الوظيفي',
            'المستوى العلمي',
            'التخصص العلمي',
            'سنوات الخبرة في التدريب',
            'شهادة مدرب معتمد',
            'إعداد الحقائب التدريبية',
            'مجالات التدريب وإعداد الحقائب',
            'جنس التدريب',
            'تقييم المدرب',
            'حالة التعاون',
            'رقم الجوال',
            'البريد الإلكتروني',
            'الفئة الوظيفية',
            'منتسبو المدارس الحكومية',
            'المسؤول المباشر / المدير',
            'ملاحظات',
        ];
    }

    public function styles(Worksheet $sheet)
    {
        $lastCol = 'X';

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

        // Data validation for شهادة مدرب معتمد (column M)
        $yesNoValidation = new DataValidation();
        $yesNoValidation->setType(DataValidation::TYPE_LIST);
        $yesNoValidation->setAllowBlank(true);
        $yesNoValidation->setFormula1('"نعم,لا"');
        for ($i = 3; $i <= 500; $i++) {
            $sheet->getCell("M{$i}")->setDataValidation(clone $yesNoValidation);
            $sheet->getCell("N{$i}")->setDataValidation(clone $yesNoValidation);
        }

        // Data validation for الفئة الوظيفية (column U)
        $jobCategoryValidation = new DataValidation();
        $jobCategoryValidation->setType(DataValidation::TYPE_LIST);
        $jobCategoryValidation->setAllowBlank(true);
        $jobCategoryValidation->setFormula1('"منتسبو المدارس الحكومية,منتسبو وزارة التربية والتعليم,منتسبو المدارس الخاصة,منتسبو الجهات الخارجية,غير منتسب لجهة عمل,أخرى"');
        for ($i = 3; $i <= 500; $i++) {
            $sheet->getCell("U{$i}")->setDataValidation(clone $jobCategoryValidation);
        }

        // Data validation for منتسبو المدارس الحكومية (column V)
        for ($i = 3; $i <= 500; $i++) {
            $sheet->getCell("V{$i}")->setDataValidation(clone $yesNoValidation);
        }

        // Data validation for جنس التدريب (column P)
        $trainingGenderValidation = new DataValidation();
        $trainingGenderValidation->setType(DataValidation::TYPE_LIST);
        $trainingGenderValidation->setAllowBlank(true);
        $trainingGenderValidation->setFormula1('"رجال,نساء,رجال ونساء"');
        for ($i = 3; $i <= 500; $i++) {
            $sheet->getCell("P{$i}")->setDataValidation(clone $trainingGenderValidation);
        }

        // Set column widths for text fields
        $sheet->getColumnDimension('O')->setWidth(35); // مجالات التدريب
        $sheet->getColumnDimension('U')->setWidth(30); // الفئة الوظيفية
        $sheet->getColumnDimension('W')->setWidth(25); // المسؤول المباشر
        $sheet->getColumnDimension('X')->setWidth(25); // ملاحظات

        return [];
    }
}
