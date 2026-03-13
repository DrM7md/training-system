<?php

namespace App\Exports;

use App\Models\Trainer;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Border;

class TrainersExport implements FromCollection, WithHeadings, WithStyles, ShouldAutoSize
{
    public function collection()
    {
        return Trainer::orderBy('name')->get()->map(fn($t, $i) => [
            'num' => $i + 1,
            'gender' => $t->gender === 'male' ? 'ذكر' : 'أنثى',
            'national_id' => $t->national_id ?? '-',
            'employee_id' => $t->employee_id ?? '-',
            'name' => $t->name,
            'nationality' => $t->nationality ?? '-',
            'nationality_category' => $t->nationality_category ?? '-',
            'employer_type' => $t->employer_type ?? '-',
            'employer' => $t->employer ?? '-',
            'job_title' => $t->job_title ?? '-',
            'education_level' => $t->education_level ?? '-',
            'academic_specialization' => $t->academic_specialization ?? $t->specialization ?? '-',
            'experience' => $t->current_experience_years,
            'is_certified' => $t->is_certified_trainer ? 'نعم' : 'لا',
            'can_prepare' => $t->can_prepare_packages ? 'نعم' : 'لا',
            'training_fields' => $t->training_fields ?? '-',
            'training_gender' => match($t->training_gender) {
                'male' => 'رجال',
                'female' => 'نساء',
                'both' => 'رجال ونساء',
                default => $t->training_gender ?? '-',
            },
            'evaluation' => $t->trainer_evaluation ?? '-',
            'cooperation_status' => $t->cooperation_status ?? '-',
            'phone' => $t->phone ?? '-',
            'email' => $t->email ?? '-',
            'is_government_employee' => $t->is_government_employee ? 'نعم' : 'لا',
            'direct_manager' => $t->direct_manager ?? '-',
            'notes' => $t->notes ?? '-',
        ]);
    }

    public function headings(): array
    {
        return [
            '#', 'الجنس', 'الرقم الشخصي', 'الرقم الوظيفي', 'الاسم', 'الجنسية',
            'فئة الجنسية', 'نوع جهة العمل', 'جهة العمل', 'المسمى الوظيفي',
            'المستوى العلمي', 'التخصص العلمي', 'سنوات الخبرة', 'شهادة مدرب معتمد',
            'إعداد الحقائب', 'مجالات التدريب', 'جنس التدريب', 'تقييم المدرب',
            'حالة التعاون', 'رقم الجوال', 'البريد الإلكتروني',
            'منتسبو المدارس الحكومية', 'المسؤول المباشر / المدير', 'ملاحظات',
        ];
    }

    public function styles(Worksheet $sheet)
    {
        $lastRow = $sheet->getHighestRow();
        $lastCol = 'X';

        $sheet->setRightToLeft(true);

        $sheet->getStyle("A1:{$lastCol}1")->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF'], 'size' => 12],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'DC2626']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        ]);

        $sheet->getStyle("A1:{$lastCol}{$lastRow}")->applyFromArray([
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'D1D5DB']]],
        ]);

        for ($i = 2; $i <= $lastRow; $i++) {
            if ($i % 2 === 0) {
                $sheet->getStyle("A{$i}:{$lastCol}{$i}")->applyFromArray([
                    'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'FEF2F2']],
                ]);
            }
        }

        $sheet->getRowDimension(1)->setRowHeight(30);

        return [];
    }
}
