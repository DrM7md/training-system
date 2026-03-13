<?php

namespace App\Http\Controllers;

use App\Models\Assignment;
use App\Models\DropdownOption;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PaymentController extends Controller
{
    public function index(Request $request)
    {
        // Get payment period settings
        $paymentMonths = [
            (int) Setting::get('payment_month_1', 12),
            (int) Setting::get('payment_month_2', 3),
            (int) Setting::get('payment_month_3', 6),
        ];

        // Get assignment type rates
        $assignmentTypeRates = DropdownOption::where('category', 'assignment_types')
            ->pluck('rate', 'value')
            ->toArray();

        // Build query
        $query = Assignment::with(['trainer', 'program', 'package', 'groups']);

        if ($request->date_from) {
            $query->where('start_date', '>=', $request->date_from);
        }
        if ($request->date_to) {
            $query->where(function ($q) use ($request) {
                $q->where('end_date', '<=', $request->date_to)
                  ->orWhereNull('end_date');
            });
        }
        if ($request->assignment_type) {
            $query->where('assignment_type', $request->assignment_type);
        }

        $assignments = $query->latest()->get();

        // Calculate payments grouped by trainer
        $paymentData = [];
        foreach ($assignments as $assignment) {
            $trainerId = $assignment->trainer_id;
            $rate = $assignmentTypeRates[$assignment->assignment_type] ?? 0;
            $hours = $assignment->package->hours ?? 0;
            $groupCount = $assignment->groups->count();
            $totalPayment = $hours * $rate * $groupCount;

            if (!isset($paymentData[$trainerId])) {
                $paymentData[$trainerId] = [
                    'trainer' => $assignment->trainer,
                    'assignments' => [],
                    'total_payment' => 0,
                ];
            }

            $paymentData[$trainerId]['assignments'][] = [
                'id' => $assignment->id,
                'program_name' => $assignment->program->name,
                'package_name' => $assignment->package->name,
                'assignment_type' => $assignment->assignment_type,
                'hours' => $hours,
                'rate' => $rate,
                'group_count' => $groupCount,
                'group_names' => $assignment->groups->pluck('name')->toArray(),
                'payment' => $totalPayment,
                'start_date' => $assignment->start_date,
                'end_date' => $assignment->end_date,
            ];

            $paymentData[$trainerId]['total_payment'] += $totalPayment;
        }

        $assignmentTypes = DropdownOption::getOptions('assignment_types');

        return Inertia::render('Payments/Index', [
            'payments' => array_values($paymentData),
            'assignmentTypes' => $assignmentTypes,
            'assignmentTypeRates' => $assignmentTypeRates,
            'paymentMonths' => $paymentMonths,
            'filters' => $request->only(['date_from', 'date_to', 'assignment_type', 'payment_date']),
            'grandTotal' => collect($paymentData)->sum('total_payment'),
        ]);
    }
}
