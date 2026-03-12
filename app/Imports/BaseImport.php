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
    protected int $updatedCount = 0;
    protected int $skippedCount = 0;
    protected string $mode = 'skip'; // skip | update

    public function __construct(string $mode = 'skip')
    {
        $this->mode = $mode;
    }

    abstract protected function processRow(array $row, int $rowNumber): ?array;
    abstract protected function getModel(): string;
    abstract protected function getMatchKeys(): array;

    public function startRow(): int
    {
        return 2;
    }

    public function collection(Collection $rows)
    {
        $model = $this->getModel();
        $matchKeys = $this->getMatchKeys();

        foreach ($rows as $index => $row) {
            $rowNumber = $index + 2;
            $rowData = $row->toArray();

            if (empty(array_filter($rowData, fn($v) => $v !== null && $v !== ''))) {
                continue;
            }

            try {
                $processed = $this->processRow($rowData, $rowNumber);
                if (!$processed) {
                    $this->skippedCount++;
                    continue;
                }

                // بحث عن سجل موجود بنفس المفاتيح
                $matchConditions = [];
                foreach ($matchKeys as $key) {
                    if (!empty($processed[$key])) {
                        $matchConditions[$key] = $processed[$key];
                    }
                }

                $existing = null;
                if (!empty($matchConditions)) {
                    $query = $model::query();
                    foreach ($matchConditions as $key => $value) {
                        $query->where($key, $value);
                    }
                    $existing = $query->first();
                }

                if ($existing) {
                    if ($this->mode === 'update') {
                        $existing->update($processed);
                        $this->updatedCount++;
                    } else {
                        $this->skippedCount++;
                    }
                } else {
                    $model::create($processed);
                    $this->importedCount++;
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

    public function getSummary(): array
    {
        return [
            'imported' => $this->importedCount,
            'updated' => $this->updatedCount,
            'skipped' => $this->skippedCount,
            'errors' => $this->errors,
        ];
    }
}
