import AuthenticatedLayout from '@/Components/Layout/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Banknote, Search, Printer, ChevronDown, ChevronUp } from 'lucide-react';
import Card from '@/Components/UI/Card';
import Button from '@/Components/UI/Button';
import Badge from '@/Components/UI/Badge';
import PageHeader from '@/Components/UI/PageHeader';

interface Trainer {
    id: number;
    name: string;
    national_id: string | null;
    employee_id: string | null;
    employer: string | null;
}

interface AssignmentDetail {
    id: number;
    program_name: string;
    package_name: string;
    assignment_type: string;
    hours: number;
    rate: number;
    group_count: number;
    group_names: string[];
    payment: number;
    start_date: string | null;
    end_date: string | null;
}

interface PaymentRow {
    trainer: Trainer;
    assignments: AssignmentDetail[];
    total_payment: number;
}

interface DropdownOption {
    value: string;
    label: string;
    rate: number | null;
}

interface Props {
    payments: PaymentRow[];
    assignmentTypes: DropdownOption[];
    paymentMonths: number[];
    filters: {
        date_from?: string;
        date_to?: string;
        assignment_type?: string;
        payment_date?: string;
    };
    grandTotal: number;
    organizationName: string;
    organizationLogo: string;
}

const monthNames: Record<number, string> = {
    1: 'يناير', 2: 'فبراير', 3: 'مارس', 4: 'أبريل',
    5: 'مايو', 6: 'يونيو', 7: 'يوليو', 8: 'أغسطس',
    9: 'سبتمبر', 10: 'أكتوبر', 11: 'نوفمبر', 12: 'ديسمبر',
};

export default function Index({ payments, assignmentTypes, paymentMonths, filters, grandTotal, organizationName, organizationLogo }: Readonly<Props>) {
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');
    const [assignmentType, setAssignmentType] = useState(filters.assignment_type || '');
    const [paymentDate, setPaymentDate] = useState(filters.payment_date || '');
    const [expandedTrainers, setExpandedTrainers] = useState<Set<number>>(new Set());

    const handleSearch = () => {
        router.get(route('payments.index'), {
            date_from: dateFrom || undefined,
            date_to: dateTo || undefined,
            assignment_type: assignmentType || undefined,
            payment_date: paymentDate || undefined,
        }, { preserveState: true, preserveScroll: true });
    };

    const toggleExpand = (trainerId: number) => {
        setExpandedTrainers(prev => {
            const next = new Set(prev);
            if (next.has(trainerId)) {
                next.delete(trainerId);
            } else {
                next.add(trainerId);
            }
            return next;
        });
    };

    const formatNumber = (num: number) => {
        return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const selectedPaymentMonth = paymentDate ? monthNames[Number(paymentDate)] : '';

    return (
        <AuthenticatedLayout>
            <Head title="صرف المستحقات" />

            {/* Print-only styles */}
            <style>{`
                @media print {
                    body * { visibility: hidden !important; }
                    .print-area, .print-area * { visibility: visible !important; }
                    .print-area {
                        position: absolute !important;
                        top: 0 !important;
                        left: 0 !important;
                        right: 0 !important;
                        width: 100% !important;
                        padding: 0 !important;
                        margin: 0 !important;
                    }
                    .no-print { display: none !important; }
                    @page {
                        size: A4 landscape;
                        margin: 15mm 12mm 15mm 12mm;
                    }
                    .print-header {
                        display: flex !important;
                        position: running(header);
                    }
                    table { page-break-inside: auto; }
                    tr { page-break-inside: avoid; }
                    thead { display: table-header-group; }
                }
                @media not print {
                    .print-area .print-header { display: none; }
                }
            `}</style>

            <div className="no-print">
                <PageHeader
                    title={<>كشف صرف المستحقات المالية <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-teal-100 text-teal-700 mr-2">{payments.length}</span></>}
                    description="كشف صرف المستحقات المالية للمدربين"
                    action={
                        payments.length > 0 ? (
                            <Button
                                icon={<Printer className="h-4 w-4" />}
                                variant="secondary"
                                onClick={() => window.print()}
                            >
                                طباعة الكشف
                            </Button>
                        ) : undefined
                    }
                />

                {/* Filters */}
                <Card className="mb-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">من تاريخ</label>
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">إلى تاريخ</label>
                            <input
                                type="date"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">التاريخ المتوقع للصرف</label>
                            <select
                                value={paymentDate}
                                onChange={(e) => setPaymentDate(e.target.value)}
                                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                            >
                                <option value="">-- اختر --</option>
                                {paymentMonths.map(month => (
                                    <option key={month} value={month}>{monthNames[month] || month}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">نوع التكليف</label>
                            <select
                                value={assignmentType}
                                onChange={(e) => setAssignmentType(e.target.value)}
                                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                            >
                                <option value="">الكل</option>
                                {assignmentTypes.map(t => (
                                    <option key={t.value} value={t.value}>{t.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <Button
                                type="button"
                                icon={<Search className="h-4 w-4" />}
                                onClick={handleSearch}
                                className="w-full"
                            >
                                عرض الكشف
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Summary Cards */}
                {payments.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                        <Card>
                            <div className="text-center">
                                <p className="text-xs text-slate-500 mb-1">عدد المدربين</p>
                                <p className="text-2xl font-bold text-slate-800">{payments.length}</p>
                            </div>
                        </Card>
                        <Card>
                            <div className="text-center">
                                <p className="text-xs text-slate-500 mb-1">عدد التكليفات</p>
                                <p className="text-2xl font-bold text-slate-800">
                                    {payments.reduce((sum, p) => sum + p.assignments.length, 0)}
                                </p>
                            </div>
                        </Card>
                        <Card>
                            <div className="text-center">
                                <p className="text-xs text-slate-500 mb-1">إجمالي المستحقات</p>
                                <p className="text-2xl font-bold text-teal-600">{formatNumber(grandTotal)} ر.ق</p>
                            </div>
                        </Card>
                    </div>
                )}
            </div>

            {/* Printable Area + Screen Table */}
            <div className="print-area">
                {/* Print Header */}
                <div className="print-header" style={{ direction: 'rtl', marginBottom: '16px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <tbody>
                            <tr>
                                <td style={{ width: '20%', textAlign: 'right', verticalAlign: 'middle' }}>
                                    {organizationLogo && (
                                        <img src={organizationLogo} alt="" style={{ height: '70px', objectFit: 'contain' }} />
                                    )}
                                </td>
                                <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1a365d', marginBottom: '4px' }}>
                                        كشف صرف المستحقات المالية للمدربين
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#4a5568' }}>{organizationName}</div>
                                </td>
                                <td style={{ width: '20%', textAlign: 'left', verticalAlign: 'middle' }}>
                                    {organizationLogo && (
                                        <img src={organizationLogo} alt="" style={{ height: '70px', objectFit: 'contain' }} />
                                    )}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    {/* Date Range Info */}
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px', border: '1px solid #cbd5e0' }}>
                        <tbody>
                            <tr style={{ backgroundColor: '#1a365d', color: 'white' }}>
                                <td colSpan={6} style={{ textAlign: 'center', padding: '6px', fontSize: '13px', fontWeight: 'bold' }}>
                                    الإطار الزمني للكشف
                                </td>
                            </tr>
                            <tr style={{ fontSize: '12px' }}>
                                <td style={{ padding: '6px 12px', fontWeight: 'bold', backgroundColor: '#f7fafc', border: '1px solid #cbd5e0' }}>من</td>
                                <td style={{ padding: '6px 12px', border: '1px solid #cbd5e0' }}>{dateFrom || '-'}</td>
                                <td style={{ padding: '6px 12px', fontWeight: 'bold', backgroundColor: '#f7fafc', border: '1px solid #cbd5e0' }}>إلى</td>
                                <td style={{ padding: '6px 12px', border: '1px solid #cbd5e0' }}>{dateTo || '-'}</td>
                                <td style={{ padding: '6px 12px', fontWeight: 'bold', backgroundColor: '#f7fafc', border: '1px solid #cbd5e0' }}>التاريخ المتوقع للصرف</td>
                                <td style={{ padding: '6px 12px', border: '1px solid #cbd5e0' }}>{selectedPaymentMonth || '-'}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <Card className="no-print-card">
                    {payments.length === 0 ? (
                        <div className="text-center py-12 text-slate-500 no-print">
                            <Banknote className="h-14 w-14 mx-auto text-slate-300 mb-3" />
                            <p className="font-medium">لا توجد مستحقات</p>
                            <p className="text-sm text-slate-400 mt-1">حدد الفترة الزمنية واضغط "عرض الكشف"</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm print-table" style={{ direction: 'rtl' }}>
                                <thead>
                                    <tr className="border-b border-slate-200 bg-slate-50/50">
                                        <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-600 uppercase tracking-wide">م</th>
                                        <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-600 uppercase tracking-wide">اسم المكلف</th>
                                        <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-600 uppercase tracking-wide">الرقم الشخصي</th>
                                        <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-600 uppercase tracking-wide">الرقم الوظيفي</th>
                                        <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-600 uppercase tracking-wide">جهة العمل</th>
                                        <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-600 uppercase tracking-wide">إجمالي المستحقات</th>
                                        <th className="px-4 py-3.5 text-center text-xs font-bold text-slate-600 uppercase tracking-wide no-print">التفاصيل</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {payments.map((row, i) => (
                                        <>
                                            <tr key={row.trainer.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-4 py-3 text-slate-500">{i + 1}</td>
                                                <td className="px-4 py-3 font-medium text-slate-800">{row.trainer.name}</td>
                                                <td className="px-4 py-3 text-slate-600 font-mono text-xs">{row.trainer.national_id || '-'}</td>
                                                <td className="px-4 py-3 text-slate-600 font-mono text-xs">{row.trainer.employee_id || '-'}</td>
                                                <td className="px-4 py-3 text-slate-600 text-xs">{row.trainer.employer || '-'}</td>
                                                <td className="px-4 py-3">
                                                    <span className="font-bold text-teal-600">{formatNumber(row.total_payment)} ر.ق</span>
                                                </td>
                                                <td className="px-4 py-3 text-center no-print">
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleExpand(row.trainer.id)}
                                                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
                                                    >
                                                        {expandedTrainers.has(row.trainer.id)
                                                            ? <ChevronUp className="h-4 w-4" />
                                                            : <ChevronDown className="h-4 w-4" />
                                                        }
                                                    </button>
                                                </td>
                                            </tr>
                                            {expandedTrainers.has(row.trainer.id) && (
                                                <tr key={`detail-${row.trainer.id}`} className="no-print">
                                                    <td colSpan={7} className="px-6 py-3 bg-slate-50/80">
                                                        <table className="w-full text-xs">
                                                            <thead>
                                                                <tr className="text-slate-500">
                                                                    <th className="px-3 py-2 text-right font-medium">البرنامج</th>
                                                                    <th className="px-3 py-2 text-right font-medium">الحقيبة</th>
                                                                    <th className="px-3 py-2 text-right font-medium">نوع التكليف</th>
                                                                    <th className="px-3 py-2 text-right font-medium">الساعات</th>
                                                                    <th className="px-3 py-2 text-right font-medium">قيمة الساعة</th>
                                                                    <th className="px-3 py-2 text-right font-medium">المجموعات</th>
                                                                    <th className="px-3 py-2 text-right font-medium">المكافأة</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-slate-100">
                                                                {row.assignments.map(a => (
                                                                    <tr key={a.id} className="text-slate-600">
                                                                        <td className="px-3 py-2">{a.program_name}</td>
                                                                        <td className="px-3 py-2">{a.package_name}</td>
                                                                        <td className="px-3 py-2">
                                                                            <Badge variant="primary">{a.assignment_type}</Badge>
                                                                        </td>
                                                                        <td className="px-3 py-2">{a.hours}</td>
                                                                        <td className="px-3 py-2">{formatNumber(a.rate)}</td>
                                                                        <td className="px-3 py-2">
                                                                            <span className="font-medium">{a.group_count}</span>
                                                                            <span className="text-slate-400 mr-1">({a.group_names.join('، ')})</span>
                                                                        </td>
                                                                        <td className="px-3 py-2 font-bold text-teal-600">{formatNumber(a.payment)}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </td>
                                                </tr>
                                            )}
                                        </>
                                    ))}
                                    {/* Grand Total Row */}
                                    <tr className="bg-teal-50/50 border-t-2 border-teal-200">
                                        <td colSpan={5} className="px-4 py-3 text-left font-bold text-slate-700">الإجمالي الكلي</td>
                                        <td className="px-4 py-3">
                                            <span className="font-bold text-lg text-teal-700">{formatNumber(grandTotal)} ر.ق</span>
                                        </td>
                                        <td className="no-print"></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>
            </div>

            {/* Pagination placeholder */}
            {payments.length > 0 && (
                <div className="mt-6 no-print" />
            )}
        </AuthenticatedLayout>
    );
}
