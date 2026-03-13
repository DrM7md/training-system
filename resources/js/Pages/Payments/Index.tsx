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
    is_government_employee: boolean;
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

    const thStyle: React.CSSProperties = {
        backgroundColor: 'rgb(26, 54, 93)',
        color: 'white',
        padding: '10px 14px',
        fontSize: '12px',
        fontWeight: 'bold',
        textAlign: 'right',
        border: '1px solid rgb(26, 54, 93)',
        whiteSpace: 'nowrap',
    };

    const tdStyle: React.CSSProperties = {
        padding: '9px 14px',
        fontSize: '12px',
        border: '1px solid #d1d5db',
        textAlign: 'right',
    };

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
                        margin: 12mm 10mm 12mm 10mm;
                    }
                    .print-header {
                        display: block !important;
                    }
                    .screen-table { display: none !important; }
                    .print-table-container { display: block !important; }
                    table { page-break-inside: auto; }
                    tr { page-break-inside: avoid; }
                    thead { display: table-header-group; }
                }
                @media not print {
                    .print-area .print-header { display: none; }
                    .print-table-container { display: none; }
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

            {/* Printable Area */}
            <div className="print-area">
                {/* Print Header */}
                <div className="print-header" style={{ direction: 'rtl', fontFamily: 'Arial, sans-serif' }}>
                    {/* Logo + Title */}
                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                        {organizationLogo && (
                            <img src={organizationLogo} alt="" style={{ height: '65px', objectFit: 'contain', margin: '0 auto 8px' }} />
                        )}
                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'rgb(26, 54, 93)', marginBottom: '2px' }}>
                            كشف صرف المستحقات المالية للمدربين
                        </div>
                        <div style={{ fontSize: '13px', color: '#4a5568' }}>{organizationName}</div>
                    </div>

                    {/* Date Range Bar */}
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px' }}>
                        <tbody>
                            <tr>
                                <td style={{ backgroundColor: 'rgb(26, 54, 93)', color: 'white', padding: '7px 16px', fontSize: '12px', fontWeight: 'bold', border: '1px solid rgb(26, 54, 93)', width: '14%', textAlign: 'center' }}>من</td>
                                <td style={{ padding: '7px 16px', fontSize: '12px', border: '1px solid #d1d5db', width: '19%', textAlign: 'center', backgroundColor: '#f8fafc' }}>{dateFrom || '-'}</td>
                                <td style={{ backgroundColor: 'rgb(26, 54, 93)', color: 'white', padding: '7px 16px', fontSize: '12px', fontWeight: 'bold', border: '1px solid rgb(26, 54, 93)', width: '14%', textAlign: 'center' }}>إلى</td>
                                <td style={{ padding: '7px 16px', fontSize: '12px', border: '1px solid #d1d5db', width: '19%', textAlign: 'center', backgroundColor: '#f8fafc' }}>{dateTo || '-'}</td>
                                <td style={{ backgroundColor: 'rgb(26, 54, 93)', color: 'white', padding: '7px 16px', fontSize: '12px', fontWeight: 'bold', border: '1px solid rgb(26, 54, 93)', width: '14%', textAlign: 'center' }}>التاريخ المتوقع للصرف</td>
                                <td style={{ padding: '7px 16px', fontSize: '12px', border: '1px solid #d1d5db', width: '20%', textAlign: 'center', backgroundColor: '#f8fafc' }}>{selectedPaymentMonth || '-'}</td>
                            </tr>
                        </tbody>
                    </table>

                    {/* Print Table */}
                    {payments.length > 0 && (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    <th style={thStyle}>م</th>
                                    <th style={thStyle}>اسم المكلف</th>
                                    <th style={thStyle}>الرقم الشخصي</th>
                                    <th style={thStyle}>الرقم الوظيفي</th>
                                    <th style={thStyle}>جهة العمل</th>
                                    <th style={thStyle}>الفئة</th>
                                    <th style={thStyle}>إجمالي المستحقات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.map((row, i) => (
                                    <tr key={row.trainer.id} style={{ backgroundColor: i % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                                        <td style={{ ...tdStyle, textAlign: 'center', width: '4%' }}>{i + 1}</td>
                                        <td style={{ ...tdStyle, fontWeight: '600' }}>{row.trainer.name}</td>
                                        <td style={{ ...tdStyle, textAlign: 'center', fontFamily: 'monospace', fontSize: '11px' }}>{row.trainer.national_id || '-'}</td>
                                        <td style={{ ...tdStyle, textAlign: 'center', fontFamily: 'monospace', fontSize: '11px' }}>{row.trainer.employee_id || '-'}</td>
                                        <td style={tdStyle}>{row.trainer.employer || '-'}</td>
                                        <td style={{ ...tdStyle, fontSize: '11px' }}>{row.trainer.is_government_employee ? 'منتسبو المدارس الحكومية' : '-'}</td>
                                        <td style={{ ...tdStyle, fontWeight: 'bold', color: 'rgb(26, 54, 93)', textAlign: 'center' }}>{formatNumber(row.total_payment)} ر.ق</td>
                                    </tr>
                                ))}
                                <tr style={{ backgroundColor: '#edf2f7' }}>
                                    <td colSpan={6} style={{ ...tdStyle, fontWeight: 'bold', textAlign: 'left', fontSize: '13px', backgroundColor: '#edf2f7' }}>الإجمالي الكلي</td>
                                    <td style={{ ...tdStyle, fontWeight: 'bold', fontSize: '14px', color: 'rgb(26, 54, 93)', textAlign: 'center', backgroundColor: '#edf2f7' }}>{formatNumber(grandTotal)} ر.ق</td>
                                </tr>
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Screen Table */}
                <div className="screen-table">
                    <Card>
                        {payments.length === 0 ? (
                            <div className="text-center py-12 text-slate-500 no-print">
                                <Banknote className="h-14 w-14 mx-auto text-slate-300 mb-3" />
                                <p className="font-medium">لا توجد مستحقات</p>
                                <p className="text-sm text-slate-400 mt-1">حدد الفترة الزمنية واضغط "عرض الكشف"</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm" style={{ direction: 'rtl' }}>
                                    <thead>
                                        <tr className="border-b border-slate-200 bg-slate-50/50">
                                            <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-600 uppercase tracking-wide">م</th>
                                            <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-600 uppercase tracking-wide">اسم المكلف</th>
                                            <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-600 uppercase tracking-wide">الرقم الشخصي</th>
                                            <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-600 uppercase tracking-wide">الرقم الوظيفي</th>
                                            <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-600 uppercase tracking-wide">جهة العمل</th>
                                            <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-600 uppercase tracking-wide">الفئة</th>
                                            <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-600 uppercase tracking-wide">إجمالي المستحقات</th>
                                            <th className="px-4 py-3.5 text-center text-xs font-bold text-slate-600 uppercase tracking-wide">التفاصيل</th>
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
                                                    <td className="px-4 py-3 text-xs">
                                                        {row.trainer.is_government_employee
                                                            ? <Badge variant="info">منتسبو المدارس الحكومية</Badge>
                                                            : <span className="text-slate-400">-</span>
                                                        }
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className="font-bold text-teal-600">{formatNumber(row.total_payment)} ر.ق</span>
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
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
                                                    <tr key={`detail-${row.trainer.id}`}>
                                                        <td colSpan={8} className="px-6 py-3 bg-slate-50/80">
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
                                            <td colSpan={6} className="px-4 py-3 text-left font-bold text-slate-700">الإجمالي الكلي</td>
                                            <td className="px-4 py-3">
                                                <span className="font-bold text-lg text-teal-700">{formatNumber(grandTotal)} ر.ق</span>
                                            </td>
                                            <td></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
