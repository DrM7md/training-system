import { Head } from '@inertiajs/react';
import { useEffect } from 'react';

interface Trainer {
    id: number;
    name: string;
    national_id: string | null;
    employee_id: string | null;
    employer: string | null;
    direct_manager: string | null;
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

const COLORS = {
    primary: 'rgb(26, 54, 93)',
    accent1: 'rgb(137, 20, 60)',
    accent2: 'rgb(15, 66, 96)',
    accent3: 'rgb(18, 155, 130)',
    accent4: 'rgb(65, 148, 179)',
    accent5: 'rgb(162, 145, 96)',
    border: '#c7d2de',
    headerBg: '#edf2f7',
    text: '#1a202c',
    textLight: '#4a5568',
    textMuted: '#718096',
};

export default function Print({ assignment, organizationName, organizationLogo }: Readonly<Props>) {
    useEffect(() => {
        setTimeout(() => window.print(), 500);
    }, []);

    const a = assignment;

    const cellStyle: React.CSSProperties = {
        border: `1px solid ${COLORS.border}`,
        padding: '7px 12px',
        fontSize: '12px',
        color: COLORS.text,
        verticalAlign: 'middle',
    };

    const headerCellStyle: React.CSSProperties = {
        ...cellStyle,
        backgroundColor: COLORS.headerBg,
        fontWeight: 'bold',
        fontSize: '11px',
        color: COLORS.textLight,
        width: '18%',
    };

    const sectionHeader = (bg: string): React.CSSProperties => ({
        backgroundColor: bg,
        color: 'white',
        textAlign: 'center',
        padding: '6px 8px',
        fontSize: '13px',
        fontWeight: 'bold',
        border: `1px solid ${bg}`,
        letterSpacing: '0.5px',
    });

    const tableStyle: React.CSSProperties = {
        width: '100%',
        borderCollapse: 'collapse',
        marginBottom: '10px',
    };

    return (
        <>
            <Head title={`استمارة تكليف - ${a.trainer.name}`} />
            <style>{`
                @media print {
                    @page { size: A4 portrait; margin: 12mm 10mm 12mm 10mm; }
                    body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                }
                body { background: #e2e8f0; margin: 0; }
            `}</style>

            <div style={{
                maxWidth: '210mm',
                margin: '0 auto',
                padding: '24px 28px',
                backgroundColor: 'white',
                fontFamily: 'Arial, Tahoma, sans-serif',
                direction: 'rtl',
                lineHeight: '1.5',
                boxShadow: '0 0 20px rgba(0,0,0,0.1)',
            }}>
                {/* Top decorative line */}
                <div style={{
                    height: '4px',
                    background: `linear-gradient(to left, ${COLORS.primary}, ${COLORS.accent4}, ${COLORS.accent3})`,
                    marginBottom: '16px',
                    borderRadius: '2px',
                }} />

                {/* Header */}
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px' }}>
                    <tbody>
                        <tr>
                            <td style={{ width: '20%', textAlign: 'right', verticalAlign: 'middle' }}>
                                {organizationLogo && (
                                    <img src={organizationLogo} alt="" style={{ height: '70px', objectFit: 'contain' }} />
                                )}
                            </td>
                            <td style={{ textAlign: 'center', verticalAlign: 'middle', padding: '0 10px' }}>
                                <div style={{ fontSize: '11px', color: COLORS.textMuted, marginBottom: '4px' }}>
                                    {organizationName}
                                </div>
                                <div style={{
                                    fontSize: '19px',
                                    fontWeight: 'bold',
                                    color: COLORS.primary,
                                    letterSpacing: '1px',
                                }}>
                                    استمارة التكليف بالمهام التدريبية
                                </div>
                                <div style={{
                                    width: '80px',
                                    height: '2px',
                                    backgroundColor: COLORS.accent3,
                                    margin: '6px auto 0',
                                    borderRadius: '1px',
                                }} />
                            </td>
                            <td style={{ width: '20%', textAlign: 'left', verticalAlign: 'middle' }}>
                                {organizationLogo && (
                                    <img src={organizationLogo} alt="" style={{ height: '70px', objectFit: 'contain' }} />
                                )}
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* بيانات المكلف */}
                <table style={tableStyle}>
                    <tbody>
                        <tr>
                            <td colSpan={4} style={sectionHeader(COLORS.accent1)}>بيانات المكلف</td>
                        </tr>
                        <tr>
                            <td style={headerCellStyle}>اسم المكلف</td>
                            <td style={{ ...cellStyle, fontWeight: 'bold' }}>{a.trainer.name}</td>
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
                <table style={tableStyle}>
                    <tbody>
                        <tr>
                            <td colSpan={4} style={sectionHeader(COLORS.accent2)}>بيانات البرنامج التدريبي</td>
                        </tr>
                        <tr>
                            <td style={headerCellStyle}>عنوان البرنامج التدريبي</td>
                            <td style={{ ...cellStyle, fontWeight: 'bold' }}>{a.program.name}</td>
                            <td style={headerCellStyle}>نوع التكليف</td>
                            <td style={cellStyle}>{a.assignment_type}</td>
                        </tr>
                        <tr>
                            <td style={headerCellStyle}>الحقيبة التدريبية</td>
                            <td style={cellStyle}>{a.package.name}</td>
                            <td style={headerCellStyle}>عدد الساعات</td>
                            <td style={cellStyle}>{a.package.hours} ساعة</td>
                        </tr>
                        <tr>
                            <td style={headerCellStyle}>عدد الأيام</td>
                            <td style={cellStyle}>{a.package.days} يوم</td>
                            <td style={headerCellStyle}>تاريخ البدء</td>
                            <td style={cellStyle}>{a.start_date ? a.start_date.substring(0, 10) : '-'}</td>
                        </tr>
                        <tr>
                            <td style={headerCellStyle}>تاريخ الانتهاء</td>
                            <td style={cellStyle}>{a.end_date ? a.end_date.substring(0, 10) : '-'}</td>
                            {a.groups.length > 0 ? (
                                <>
                                    <td style={headerCellStyle}>المجموعات</td>
                                    <td style={cellStyle}>{a.groups.map(g => g.name).join('، ')}</td>
                                </>
                            ) : (
                                <>
                                    <td style={headerCellStyle}></td>
                                    <td style={cellStyle}></td>
                                </>
                            )}
                        </tr>
                    </tbody>
                </table>

                {/* تعليمات مهمة */}
                <table style={tableStyle}>
                    <tbody>
                        <tr>
                            <td style={sectionHeader(COLORS.accent3)}>تعليمات مهمة</td>
                        </tr>
                        <tr>
                            <td style={{
                                ...cellStyle,
                                lineHeight: '2',
                                fontSize: '11px',
                                padding: '10px 16px',
                            }}>
                                <div style={{ marginBottom: '4px', display: 'flex', gap: '8px' }}>
                                    <span style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '20px',
                                        height: '20px',
                                        borderRadius: '50%',
                                        backgroundColor: COLORS.accent3,
                                        color: 'white',
                                        fontSize: '10px',
                                        fontWeight: 'bold',
                                        flexShrink: 0,
                                    }}>1</span>
                                    <span>يتم صرف مكافأة التدريب لـ (المدرب/المعد) وفق الساعات التدريبية الفعلية، سواء طابقت ما هو موضح في التكليف، أو زادت عليه أو نقصت، وذلك حسب ما يتم اعتماده من المركز.</span>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <span style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '20px',
                                        height: '20px',
                                        borderRadius: '50%',
                                        backgroundColor: COLORS.accent3,
                                        color: 'white',
                                        fontSize: '10px',
                                        fontWeight: 'bold',
                                        flexShrink: 0,
                                    }}>2</span>
                                    <span>يلزم استكمال تعبئة التكليف وتوقيعه، وإعادة إرساله خلال مدة أقصاها (3) أيام عمل من تاريخ استلامه، وفي حال عدم استلامه موقعاً خلال المدة المحددة يعتبر ملغى تلقائياً.</span>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* إقرار */}
                <table style={tableStyle}>
                    <tbody>
                        <tr>
                            <td style={{
                                ...cellStyle,
                                lineHeight: '2',
                                fontSize: '11px',
                                padding: '10px 16px',
                                backgroundColor: '#fefce8',
                                borderRight: `3px solid ${COLORS.accent5}`,
                            }}>
                                <strong style={{ color: COLORS.accent5 }}>إقرار: </strong>
                                أقر أنا&nbsp;&nbsp;<strong style={{
                                    borderBottom: `1.5px dotted ${COLORS.primary}`,
                                    paddingBottom: '1px',
                                    color: COLORS.primary,
                                }}>{a.trainer.name}</strong>&nbsp;&nbsp;
                                والموقع أدناه بالعلم بموعد التكليف المذكور أعلاه، وأقر بالتزامي بالمواعيد والتعليمات والحفاظ على حقوق العمل وخصوصيته لمركز التدريب والتطوير.
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* اعتماد المكلف ومدير جهة عمله */}
                <table style={tableStyle}>
                    <tbody>
                        <tr>
                            <td colSpan={4} style={sectionHeader(COLORS.accent4)}>اعتماد المكلف ومدير جهة عمله</td>
                        </tr>
                        <tr>
                            <td style={headerCellStyle}>اسم المدرب</td>
                            <td style={{ ...cellStyle, fontWeight: 'bold' }}>{a.trainer.name}</td>
                            <td style={headerCellStyle}>اسم المدير</td>
                            <td style={{ ...cellStyle, fontWeight: 'bold' }}>{a.trainer.direct_manager || ''}</td>
                        </tr>
                        <tr>
                            <td style={headerCellStyle}>التوقيع</td>
                            <td style={{ ...cellStyle, height: '45px' }}></td>
                            <td style={headerCellStyle}>
                                <div>التوقيع</div>
                                <div style={{ fontSize: '9px', color: COLORS.textMuted, fontWeight: 'normal' }}>(في حال نوع التكليف "تدريب تربوي" فقط)</div>
                            </td>
                            <td style={{ ...cellStyle, height: '45px' }}></td>
                        </tr>
                    </tbody>
                </table>

                {/* اعتماد مركز التدريب والتطوير */}
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                        <tr>
                            <td colSpan={4} style={sectionHeader(COLORS.accent5)}>اعتماد مركز التدريب والتطوير</td>
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
                            <td style={{ ...cellStyle, height: '55px', textAlign: 'center' }}></td>
                            <td style={{ ...cellStyle, height: '55px', textAlign: 'center' }}></td>
                            <td style={{ ...cellStyle, height: '55px', textAlign: 'center' }}></td>
                            <td style={{ ...cellStyle, height: '55px', textAlign: 'center' }}></td>
                        </tr>
                    </tbody>
                </table>

                {/* Bottom decorative line */}
                <div style={{
                    height: '3px',
                    background: `linear-gradient(to left, ${COLORS.primary}, ${COLORS.accent4}, ${COLORS.accent3})`,
                    marginTop: '12px',
                    borderRadius: '2px',
                }} />
            </div>
        </>
    );
}
