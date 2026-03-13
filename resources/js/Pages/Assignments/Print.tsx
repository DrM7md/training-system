import { Head } from '@inertiajs/react';
import { useEffect } from 'react';

interface Trainer {
    id: number;
    name: string;
    national_id: string | null;
    employee_id: string | null;
    employer: string | null;
}

interface Assignment {
    id: number;
    trainer: Trainer;
    program: { id: number; name: string };
    package: { id: number; name: string; hours: number; days: number };
    groups: { id: number; name: string }[];
    assignment_type: string;
    start_date: string | null;
    end_date: string | null;
    notes: string | null;
}

interface Props {
    assignment: Assignment;
    organizationName: string;
    organizationLogo: string;
}

export default function Print({ assignment, organizationName, organizationLogo }: Readonly<Props>) {
    useEffect(() => {
        setTimeout(() => window.print(), 500);
    }, []);

    const a = assignment;
    const cellStyle = { border: '1.5px solid #94a3b8', padding: '8px 12px', fontSize: '13px', color: '#1e293b' };
    const headerCellStyle = { ...cellStyle, backgroundColor: '#f1f5f9', fontWeight: 'bold' as const, fontSize: '12px', color: '#475569' };
    const sectionHeader = (bg: string) => ({ backgroundColor: bg, color: 'white', textAlign: 'center' as const, padding: '8px', fontSize: '14px', fontWeight: 'bold' as const, border: `1.5px solid ${bg}` });

    return (
        <>
            <Head title={`استمارة تكليف - ${a.trainer.name}`} />
            <style>{`
                @media print {
                    @page { size: A4 portrait; margin: 15mm 12mm 15mm 12mm; }
                    body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                }
                body { background: #f1f5f9; }
            `}</style>

            <div style={{
                maxWidth: '210mm',
                margin: '0 auto',
                padding: '20px',
                backgroundColor: 'white',
                fontFamily: 'Arial, Tahoma, sans-serif',
                direction: 'rtl',
                lineHeight: '1.6',
            }}>
                {/* Header with logos */}
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                    <tbody>
                        <tr>
                            <td style={{ width: '25%', textAlign: 'right', verticalAlign: 'middle' }}>
                                {organizationLogo && (
                                    <img src={organizationLogo} alt="" style={{ height: '80px', objectFit: 'contain' }} />
                                )}
                            </td>
                            <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e3a5f', marginBottom: '4px' }}>
                                    استمارة التكليف بالمهام التدريبية
                                </div>
                                <div style={{ fontSize: '13px', color: '#64748b' }}>{organizationName}</div>
                            </td>
                            <td style={{ width: '25%', textAlign: 'left', verticalAlign: 'middle' }}>
                                {organizationLogo && (
                                    <img src={organizationLogo} alt="" style={{ height: '80px', objectFit: 'contain' }} />
                                )}
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* بيانات المكلف */}
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px' }}>
                    <tbody>
                        <tr>
                            <td colSpan={4} style={sectionHeader('rgb(137, 20, 60)')}>بيانات المكلف</td>
                        </tr>
                        <tr>
                            <td style={headerCellStyle}>اسم المكلف</td>
                            <td style={cellStyle}>{a.trainer.name}</td>
                            <td style={headerCellStyle}>جهة العمل</td>
                            <td style={cellStyle}>{a.trainer.employer || '-'}</td>
                        </tr>
                        <tr>
                            <td style={headerCellStyle}>الرقم الشخصي</td>
                            <td style={cellStyle}>{a.trainer.national_id || '-'}</td>
                            <td style={headerCellStyle}>الرقم الوظيفي</td>
                            <td style={cellStyle}>{a.trainer.employee_id || '-'}</td>
                        </tr>
                    </tbody>
                </table>

                {/* بيانات البرنامج التدريبي */}
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px' }}>
                    <tbody>
                        <tr>
                            <td colSpan={4} style={sectionHeader('rgb(15, 66, 96)')}>بيانات البرنامج التدريبي</td>
                        </tr>
                        <tr>
                            <td style={headerCellStyle}>عنوان البرنامج التدريبي</td>
                            <td style={cellStyle}>{a.program.name}</td>
                            <td style={headerCellStyle}>نوع التكليف</td>
                            <td style={cellStyle}>{a.assignment_type}</td>
                        </tr>
                        <tr>
                            <td style={headerCellStyle}>عدد الساعات</td>
                            <td style={cellStyle}>{a.package.hours}</td>
                            <td style={headerCellStyle}>عدد الأيام</td>
                            <td style={cellStyle}>{a.package.days}</td>
                        </tr>
                        <tr>
                            <td style={headerCellStyle}>تاريخ البدء</td>
                            <td style={cellStyle}>{a.start_date ? a.start_date.substring(0, 10) : '-'}</td>
                            <td style={headerCellStyle}>تاريخ الانتهاء</td>
                            <td style={cellStyle}>{a.end_date ? a.end_date.substring(0, 10) : '-'}</td>
                        </tr>
                        {a.groups.length > 0 && (
                            <tr>
                                <td style={headerCellStyle}>المجموعات</td>
                                <td colSpan={3} style={cellStyle}>{a.groups.map(g => g.name).join('، ')}</td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* تعليمات مهمة */}
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px' }}>
                    <tbody>
                        <tr>
                            <td style={sectionHeader('rgb(18, 155, 130)')}>تعليمات مهمة</td>
                        </tr>
                        <tr>
                            <td style={{ ...cellStyle, lineHeight: '2', fontSize: '12px' }}>
                                <div style={{ marginBottom: '8px' }}>
                                    <strong>1</strong>&nbsp;&nbsp;
                                    يتم صرف مكافأة التدريب لـ (المدرب/المعد) وفق الساعات التدريبية الفعلية، سواء طابقت ما هو موضح في التكليف، أو زادت عليه أو نقصت، وذلك حسب ما يتم اعتماده من المركز.
                                </div>
                                <div>
                                    <strong>2</strong>&nbsp;&nbsp;
                                    يلزم استكمال تعبئة التكليف وتوقيعه، وإعادة إرساله خلال مدة أقصاها (3) أيام عمل من تاريخ استلامه، وفي حال عدم استلامه موقعاً خلال المدة المحددة يعتبر ملغى تلقائياً.
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* إقرار */}
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px' }}>
                    <tbody>
                        <tr>
                            <td style={{ ...cellStyle, lineHeight: '2', fontSize: '12px' }}>
                                أقر أنا&nbsp;&nbsp;<strong style={{ borderBottom: '1px dotted #64748b', paddingBottom: '2px' }}>{a.trainer.name}</strong>&nbsp;&nbsp;
                                والموقع أدناه بالعلم بموعد التكليف المذكور أعلاه، وأقر بالتزامي بالمواعيد والتعليمات والحفاظ على حقوق العمل وخصوصيته لمركز التدريب والتطوير.
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* اعتماد المكلف ومدير جهة عمله */}
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px' }}>
                    <tbody>
                        <tr>
                            <td colSpan={4} style={sectionHeader('rgb(65, 148, 179)')}>اعتماد المكلف ومدير جهة عمله</td>
                        </tr>
                        <tr>
                            <td style={headerCellStyle}>اسم المدرب</td>
                            <td style={cellStyle}>{a.trainer.name}</td>
                            <td style={headerCellStyle}>اسم المدير</td>
                            <td style={cellStyle}></td>
                        </tr>
                        <tr>
                            <td style={headerCellStyle}>توقيع المدرب</td>
                            <td style={{ ...cellStyle, height: '50px' }}></td>
                            <td style={headerCellStyle}>
                                <div>توقيع المدير</div>
                                <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 'normal' }}>(في حال نوع التكليف "تدريب تربوي" فقط)</div>
                            </td>
                            <td style={{ ...cellStyle, height: '50px' }}></td>
                        </tr>
                    </tbody>
                </table>

                {/* اعتماد مركز التدريب والتطوير */}
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                        <tr>
                            <td colSpan={4} style={sectionHeader('rgb(162, 145, 96)')}>اعتماد مركز التدريب والتطوير</td>
                        </tr>
                        <tr>
                            <td style={{ ...headerCellStyle, textAlign: 'center', width: '25%' }}>المشرف</td>
                            <td style={{ ...headerCellStyle, textAlign: 'center', width: '25%' }}>
                                <div>رئيس قسم</div>
                                <div>التدريب التربوي</div>
                            </td>
                            <td style={{ ...headerCellStyle, textAlign: 'center', width: '25%' }}>المسؤول المالي</td>
                            <td style={{ ...headerCellStyle, textAlign: 'center', width: '25%' }}>
                                <div>مدير مركز</div>
                                <div>التدريب والتطوير</div>
                            </td>
                        </tr>
                        <tr>
                            <td style={{ ...cellStyle, height: '60px', textAlign: 'center' }}></td>
                            <td style={{ ...cellStyle, height: '60px', textAlign: 'center' }}></td>
                            <td style={{ ...cellStyle, height: '60px', textAlign: 'center' }}></td>
                            <td style={{ ...cellStyle, height: '60px', textAlign: 'center' }}></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </>
    );
}
