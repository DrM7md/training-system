<?php

namespace App\Imports;

use App\Models\Trainer;
use Carbon\Carbon;

class TrainersImport extends BaseImport
{
    protected function getMatchKeys(): array
    {
        return ['name', 'national_id'];
    }

    // ترتيب الأعمدة في القالب:
    // 0=مسلسل, 1=الجنس, 2=الرقم الشخصي, 3=الرقم الوظيفي, 4=الاسم,
    // 5=الجنسية, 6=نوع جهة العمل, 7=جهة العمل, 8=المسمى الوظيفي,
    // 9=المستوى العلمي, 10=التخصص العلمي, 11=سنوات الخبرة,
    // 12=شهادة مدرب معتمد, 13=إعداد الحقائب, 14=مجالات التدريب,
    // 15=جنس التدريب, 16=تقييم المدرب, 17=حالة التعاون,
    // 18=رقم الجوال, 19=البريد الإلكتروني,
    // 20=منتسبو المدارس الحكومية, 21=المسؤول المباشر, 22=ملاحظات

    protected function getModel(): string
    {
        return Trainer::class;
    }

    protected function processRow(array $row, int $rowNumber): ?array
    {
        $name = trim($row[4] ?? '');
        if (empty($name)) {
            $this->errors[] = "صف {$rowNumber}: الاسم مطلوب (العمود 5)";
            return null;
        }

        $gender = $this->mapGender(trim($row[1] ?? ''));
        $experienceYears = (int) ($row[11] ?? 0);
        $isCertified = $this->mapCheckbox($row[12] ?? '');
        $canPrepare = $this->mapCheckbox($row[13] ?? '');
        $trainingGender = $this->mapTrainingGender(trim($row[15] ?? ''));
        $employerType = trim($row[6] ?? '');
        $isInternal = mb_strpos($employerType, 'داخلي') !== false;
        $email = trim($row[19] ?? '');

        return [
            'name' => $name,
            'gender' => $gender,
            'national_id' => trim($row[2] ?? '') ?: null,
            'employee_id' => trim($row[3] ?? '') ?: null,
            'nationality' => trim($row[5] ?? '') ?: null,
            'employer_type' => $employerType ?: null,
            'is_internal' => $isInternal,
            'employer' => trim($row[7] ?? '') ?: null,
            'job_title' => trim($row[8] ?? '') ?: null,
            'education_level' => trim($row[9] ?? '') ?: null,
            'academic_specialization' => trim($row[10] ?? '') ?: null,
            'specialization' => trim($row[10] ?? '') ?: null,
            'training_experience_years' => $experienceYears,
            'experience_base_date' => $experienceYears > 0 ? Carbon::now()->toDateString() : null,
            'is_certified_trainer' => $isCertified,
            'can_prepare_packages' => $canPrepare,
            'training_fields' => trim($row[14] ?? '') ?: null,
            'training_gender' => $trainingGender,
            'trainer_evaluation' => trim($row[16] ?? '') ?: null,
            'cooperation_status' => trim($row[17] ?? '') ?: null,
            'phone' => trim($row[18] ?? '') ?: null,
            'email' => $email ?: null,
            'is_government_employee' => $this->mapCheckbox($row[20] ?? ''),
            'direct_manager' => trim($row[21] ?? '') ?: null,
            'notes' => trim($row[22] ?? '') ?: null,
            'is_active' => true,
        ];
    }

    private function mapGender(string $value): string
    {
        $value = trim($value);
        if (in_array($value, ['ذكر', 'male', 'م', 'رجل'])) {
            return 'male';
        }
        if (in_array($value, ['أنثى', 'انثى', 'female', 'ف', 'امرأة'])) {
            return 'female';
        }
        return 'male';
    }

    private function mapTrainingGender(string $value): ?string
    {
        $value = trim($value);
        if (empty($value)) {
            return null;
        }
        if (mb_strpos($value, 'رجال ونساء') !== false || mb_strpos($value, 'الجنسين') !== false) {
            return 'both';
        }
        if (mb_strpos($value, 'رجال') !== false || mb_strpos($value, 'ذكور') !== false) {
            return 'male';
        }
        if (mb_strpos($value, 'نساء') !== false || mb_strpos($value, 'إناث') !== false) {
            return 'female';
        }
        return $value;
    }

    private function mapCheckbox(mixed $value): bool
    {
        if (is_bool($value)) {
            return $value;
        }
        $value = mb_strtolower(trim((string) $value));
        return in_array($value, ['نعم', 'yes', '1', 'true', '✓', '✔', 'صح']);
    }
}
