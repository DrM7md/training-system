<?php

namespace App\Imports;

use App\Models\School;
use App\Models\AcademicYear;

class SchoolsImport extends BaseImport
{
    protected ?int $academicYearId;

    public function __construct(string $mode = 'skip')
    {
        parent::__construct($mode);
        $this->academicYearId = AcademicYear::current()?->id;
    }

    protected function getMatchKeys(): array
    {
        return ['name', 'academic_year_id'];
    }

    // ترتيب الأعمدة في القالب:
    // 0=مسلسل, 1=اسم المدرسة, 2=المرحلة الدراسية, 3=فئة المدرسة,
    // 4=المنطقة الجغرافية, 5=اسم مدير المدرسة, 6=رقم الجوال,
    // 7=رقم الهاتف, 8=البريد الإلكتروني

    protected function getModel(): string
    {
        return School::class;
    }

    protected function processRow(array $row, int $rowNumber): ?array
    {
        $name = trim($row[1] ?? '');
        if (empty($name)) {
            $this->errors[] = "صف {$rowNumber}: اسم المدرسة مطلوب (العمود 2)";
            return null;
        }

        $type = $this->mapType(trim($row[3] ?? ''));
        $email = trim($row[8] ?? '');

        return [
            'name' => $name,
            'education_level' => trim($row[2] ?? '') ?: null,
            'type' => $type,
            'district' => trim($row[4] ?? '') ?: null,
            'principal_name' => trim($row[5] ?? '') ?: null,
            'phone' => trim($row[6] ?? '') ?: null,
            'landline' => trim($row[7] ?? '') ?: null,
            'email' => $email ?: null,
            'is_active' => true,
            'academic_year_id' => $this->academicYearId,
        ];
    }

    private function mapType(string $value): string
    {
        $value = trim($value);
        if (in_array($value, ['بنين', 'male', 'ذكور'])) {
            return 'male';
        }
        if (in_array($value, ['بنات', 'female', 'إناث'])) {
            return 'female';
        }
        return 'male';
    }
}
