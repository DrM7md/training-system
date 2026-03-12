<?php

namespace App\Imports;

use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithStartRow;
use Maatwebsite\Excel\Concerns\WithChunkReading;
use Maatwebsite\Excel\Concerns\SkipsEmptyRows;
use Illuminate\Support\Collection;

abstract class BaseImport implements ToCollection, WithStartRow, WithChunkReading, SkipsEmptyRows
{
    protected array $errors = [];
    protected int $importedCount = 0;
    protected int $skippedCount = 0;

    abstract protected function processRow(array $row, int $rowNumber): ?array;
    abstract protected function getModel(): string;

    public function startRow(): int
    {
        return 2; // تخطي صف العناوين
    }

    public function collection(Collection $rows)
    {
        $model = $this->getModel();

        foreach ($rows as $index => $row) {
            $rowNumber = $index + 2;
            $rowData = $row->toArray();

            if (empty(array_filter($rowData, fn($v) => $v !== null && $v !== ''))) {
                continue;
            }

            try {
                $processed = $this->processRow($rowData, $rowNumber);
                if ($processed) {
                    $model::create($processed);
                    $this->importedCount++;
                } else {
                    $this->skippedCount++;
                }
            } catch (\Exception $e) {
                $this->errors[] = "صف {$rowNumber}: " . $e->getMessage();
                $this->skippedCount++;
            }
        }
    }

    public function chunkSize(): int
    {
        return 500;
    }

    public function getErrors(): array
    {
        return $this->errors;
    }

    public function getImportedCount(): int
    {
        return $this->importedCount;
    }

    public function getSkippedCount(): int
    {
        return $this->skippedCount;
    }

    public function getSummary(): array
    {
        return [
            'imported' => $this->importedCount,
            'skipped' => $this->skippedCount,
            'errors' => $this->errors,
        ];
    }
}
