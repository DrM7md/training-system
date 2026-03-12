<?php

namespace App\Imports;

use App\Models\Trainer;
use Carbon\Carbon;

class TrainersImport extends BaseImport
{
    protected function getModel(): string
    {
        return Trainer::class;
    }

    protected function processRow(array $row, int $rowNumber): ?array
    {
        $name = trim($row['الاسم'] ?? $row['name'] ?? '');
        if (empty($name)) {
            $this->errors[] = "صف {$rowNumber}: الاسم مطلوب";
            return null;
        }

        $genderRaw = trim($row['الجنس'] ?? $row['gender'] ?? '');
        $gender = $this->mapGender($genderRaw);

        $experienceYears = (int) ($row['سنوات_الخبرة_في_التدريب'] ?? $row['سنوات الخبرة في التدريب'] ?? 0);
        $isCertified = $this->mapCheckbox($row['شهادة_مدرب_معتمد'] ?? $row['شهادة مدرب معتمد'] ?? '');
        $canPrepare = $this->mapCheckbox($row['اعداد_الحقائب_التدريبية'] ?? $row['إعداد الحقائب التدريبية'] ?? '');

        $trainingGenderRaw = trim($row['جنس_التدريب'] ?? $row['جنس التدريب'] ?? '');
        $trainingGender = $this->mapTrainingGender($trainingGenderRaw);

        $employerType = trim($row['نوع_جهة_العمل'] ?? $row['نوع جهة العمل'] ?? '');
        $isInternal = mb_strpos($employerType, 'داخلي') !== false;

        return [
            'name' => $name,
            'gender' => $gender,
            'national_id' => trim($row['الرقم_الشخصي'] ?? $row['الرقم الشخصي'] ?? ''),
            'employee_id' => trim($row['الرقم_الوظيفي'] ?? $row['الرقم الوظيفي'] ?? ''),
            'nationality' => trim($row['الجنسية'] ?? $row['nationality'] ?? ''),
            'employer_type' => $employerType ?: null,
            'is_internal' => $isInternal,
            'employer' => trim($row['جهة_العمل'] ?? $row['جهة العمل'] ?? ''),
            'job_title' => trim($row['المسمى_الوظيفي'] ?? $row['المسمى الوظيفي'] ?? ''),
            'education_level' => trim($row['المستوى_العلمي'] ?? $row['المستوى العلمي'] ?? ''),
            'academic_specialization' => trim($row['التخصص_العلمي'] ?? $row['التخصص العلمي'] ?? ''),
            'specialization' => trim($row['التخصص_العلمي'] ?? $row['التخصص العلمي'] ?? ''),
            'training_experience_years' => $experienceYears,
            'experience_base_date' => $experienceYears > 0 ? Carbon::now()->toDateString() : null,
            'is_certified_trainer' => $isCertified,
            'can_prepare_packages' => $canPrepare,
            'training_fields' => trim($row['مجالات_التدريب_واعداد_الحقائب'] ?? $row['مجالات التدريب وإعداد الحقائب'] ?? ''),
            'training_gender' => $trainingGender,
            'trainer_evaluation' => trim($row['تقييم_المدرب'] ?? $row['تقييم المدرب'] ?? ''),
            'cooperation_status' => trim($row['حالة_التعاون'] ?? $row['حالة التعاون'] ?? ''),
            'phone' => trim($row['رقم_الجوال'] ?? $row['رقم الجوال'] ?? ''),
            'email' => trim($row['البريد_الالكتروني'] ?? $row['البريد الإلكتروني'] ?? '') ?: null,
            'notes' => trim($row['ملاحظات'] ?? $row['notes'] ?? ''),
            'is_active' => true,
        ];
    }

    private function mapGender(string $value): string
    {
        $value = mb_strtolower(trim($value));
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
