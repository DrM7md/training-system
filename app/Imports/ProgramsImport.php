<?php

namespace App\Imports;

use App\Models\Program;
use App\Models\Package;
use App\Models\User;
use App\Models\AcademicYear;
use App\Models\DropdownOption;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithStartRow;
use Maatwebsite\Excel\Concerns\WithChunkReading;
use Maatwebsite\Excel\Concerns\SkipsEmptyRows;
use Illuminate\Support\Collection;

class ProgramsImport implements ToCollection, WithStartRow, WithChunkReading, SkipsEmptyRows
{
    protected array $errors = [];
    protected int $programsCreated = 0;
    protected int $programsUpdated = 0;
    protected int $packagesCreated = 0;
    protected int $packagesUpdated = 0;
    protected int $skippedCount = 0;
    protected string $mode;
    protected ?int $academicYearId;
    protected array $typeMap = [];

    public function __construct(string $mode = 'skip')
    {
        $this->mode = $mode;
        $this->academicYearId = AcademicYear::current()?->id;

        // بناء خريطة أنواع البرامج (من label العربي إلى value)
        $programTypes = DropdownOption::getOptions('program_types');
        foreach ($programTypes as $type) {
            $this->typeMap[mb_strtolower(trim($type->label))] = $type->value;
        }
    }

    public function startRow(): int
    {
        return 2;
    }

    public function chunkSize(): int
    {
        return 500;
    }

    public function collection(Collection $rows)
    {
        foreach ($rows as $index => $row) {
            $rowNumber = $index + 2;
            $rowData = $row->toArray();

            if (empty(array_filter($rowData, fn($v) => $v !== null && $v !== ''))) {
                continue;
            }

            try {
                $this->processRow($rowData, $rowNumber);
            } catch (\Exception $e) {
                $this->errors[] = "صف {$rowNumber}: " . $e->getMessage();
                $this->skippedCount++;
            }
        }
    }

    // ترتيب الأعمدة:
    // 0=مسلسل, 1=نوع البرنامج, 2=الفئة المستهدفة, 3=اسم البرنامج,
    // 4=عدد ساعات البرنامج, 5=اسم الحقيبة, 6=عدد ساعات الحقيبة,
    // 7=عدد الأيام, 8=عدد الذكور, 9=عدد الإناث, 10=اسم المشرف,
    // 11=مسؤول ضمان جودة الحقيبة, 12=التقييم العام

    protected function processRow(array $row, int $rowNumber): void
    {
        $programName = trim($row[3] ?? '');
        if (empty($programName)) {
            $this->errors[] = "صف {$rowNumber}: اسم البرنامج التدريبي مطلوب (العمود 4)";
            $this->skippedCount++;
            return;
        }

        $programType = $this->mapType(trim($row[1] ?? ''));
        $maleCount = (int) ($row[8] ?? 0);
        $femaleCount = (int) ($row[9] ?? 0);
        $supervisorName = trim($row[10] ?? '');
        $supervisorId = $this->findUserId($supervisorName);

        // البحث عن البرنامج أو إنشائه
        $program = Program::where('name', $programName)
            ->where('academic_year_id', $this->academicYearId)
            ->first();

        $programData = [
            'name' => $programName,
            'type' => $programType,
            'target_audience' => trim($row[2] ?? '') ?: null,
            'hours' => (int) ($row[4] ?? 0),
            'male_count' => $maleCount,
            'female_count' => $femaleCount,
            'target_count' => $maleCount + $femaleCount,
            'supervisor_id' => $supervisorId,
            'academic_year_id' => $this->academicYearId,
            'status' => 'new',
        ];

        if ($program) {
            if ($this->mode === 'update') {
                $program->update($programData);
                $this->programsUpdated++;
            }
        } else {
            $program = Program::create($programData);
            $this->programsCreated++;
        }

        // معالجة الحقيبة إذا وُجد اسمها
        $packageName = trim($row[5] ?? '');
        if (!empty($packageName)) {
            $packageData = [
                'program_id' => $program->id,
                'name' => $packageName,
                'hours' => (int) ($row[6] ?? 0),
                'days' => (int) ($row[7] ?? 0),
                'supervisor_id' => $supervisorId,
                'quality_officer' => trim($row[11] ?? '') ?: null,
                'rating' => trim($row[12] ?? '') ?: null,
            ];

            $existingPackage = Package::where('program_id', $program->id)
                ->where('name', $packageName)
                ->first();

            if ($existingPackage) {
                if ($this->mode === 'update') {
                    $existingPackage->update($packageData);
                    $this->packagesUpdated++;
                }
            } else {
                Package::create($packageData);
                $this->packagesCreated++;
            }
        }
    }

    protected function mapType(string $value): string
    {
        $lower = mb_strtolower(trim($value));

        // مطابقة مع خيارات القائمة المنسدلة
        if (isset($this->typeMap[$lower])) {
            return $this->typeMap[$lower];
        }

        // مطابقة مباشرة بالقيم الإنجليزية
        if (in_array($lower, ['qualification', 'licensing', 'development', 'other'])) {
            return $lower;
        }

        // محاولة مطابقة جزئية
        foreach ($this->typeMap as $label => $val) {
            if (str_contains($lower, $label) || str_contains($label, $lower)) {
                return $val;
            }
        }

        return $value ?: 'other';
    }

    protected function findUserId(?string $name): ?int
    {
        if (empty($name)) {
            return null;
        }
        return User::where('name', $name)->value('id');
    }

    public function getSummary(): array
    {
        return [
            'programs_created' => $this->programsCreated,
            'programs_updated' => $this->programsUpdated,
            'packages_created' => $this->packagesCreated,
            'packages_updated' => $this->packagesUpdated,
            'skipped' => $this->skippedCount,
            'errors' => $this->errors,
        ];
    }
}
