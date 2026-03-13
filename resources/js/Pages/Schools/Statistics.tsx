import AuthenticatedLayout from '@/Components/Layout/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { School, Users, GraduationCap, MapPin, ArrowRight } from 'lucide-react';
import Card from '@/Components/UI/Card';
import PageHeader from '@/Components/UI/PageHeader';
import Button from '@/Components/UI/Button';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell,
} from 'recharts';

interface Props {
    currentYear: string | null;
    byLevelAndType: Record<string, { male: number; female: number; total: number }>;
    topSchoolsByTrainees: Array<{ name: string; trainees_count: number; type: string }>;
    byDistrict: Array<{ district: string; count: number }>;
    stats: { total: number; male: number; female: number; trainees: number };
}

const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#06b6d4', '#84cc16'];

export default function Statistics({ currentYear, byLevelAndType, topSchoolsByTrainees, byDistrict, stats }: Props) {
    const levelData = Object.entries(byLevelAndType).map(([level, data]) => ({
        name: level,
        بنين: data.male,
        بنات: data.female,
        الإجمالي: data.total,
    }));

    const typeData = [
        { name: 'بنين', value: stats.male },
        { name: 'بنات', value: stats.female },
    ].filter(d => d.value > 0);

    const traineesData = topSchoolsByTrainees.filter(s => s.trainees_count > 0);

    const districtData = byDistrict.map(d => ({
        name: d.district,
        value: d.count,
    }));

    return (
        <AuthenticatedLayout>
            <Head title="إحصائيات المدارس" />

            <PageHeader
                title="إحصائيات المدارس"
                description={currentYear ? `العام الدراسي: ${currentYear}` : ''}
                action={
                    <a href={route('schools.index')}>
                        <Button variant="secondary" icon={<ArrowRight className="h-4 w-4" />}>
                            العودة للمدارس
                        </Button>
                    </a>
                }
            />

            {/* البطاقات الرئيسية */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <Card className="border-r-4 border-indigo-500">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-indigo-50">
                            <School className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">إجمالي المدارس</p>
                            <p className="text-3xl font-bold text-slate-800">{stats.total}</p>
                        </div>
                    </div>
                </Card>
                <Card className="border-r-4 border-blue-500">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-blue-50">
                            <Users className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">مدارس بنين</p>
                            <p className="text-3xl font-bold text-slate-800">{stats.male}</p>
                        </div>
                    </div>
                </Card>
                <Card className="border-r-4 border-pink-500">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-pink-50">
                            <Users className="h-6 w-6 text-pink-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">مدارس بنات</p>
                            <p className="text-3xl font-bold text-slate-800">{stats.female}</p>
                        </div>
                    </div>
                </Card>
                <Card className="border-r-4 border-teal-500">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-teal-50">
                            <GraduationCap className="h-6 w-6 text-teal-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">إجمالي المتدربين</p>
                            <p className="text-3xl font-bold text-slate-800">{stats.trainees}</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* المرحلة الدراسية حسب الفئة + توزيع الفئات */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <Card className="lg:col-span-2">
                    <h3 className="text-lg font-bold text-slate-800 mb-1">توزيع المدارس حسب المرحلة الدراسية</h3>
                    <p className="text-sm text-slate-500 mb-6">مقارنة بين مدارس البنين والبنات لكل مرحلة</p>
                    {levelData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={levelData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis type="number" tick={{ fontSize: 12 }} />
                                <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 13 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', direction: 'rtl' }}
                                    labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                                />
                                <Legend wrapperStyle={{ direction: 'rtl' }} />
                                <Bar dataKey="بنين" fill="#6366f1" radius={[0, 6, 6, 0]} />
                                <Bar dataKey="بنات" fill="#ec4899" radius={[0, 6, 6, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-64 text-slate-400">
                            <p>لا توجد بيانات</p>
                        </div>
                    )}
                </Card>

                <Card>
                    <h3 className="text-lg font-bold text-slate-800 mb-1">نسبة الفئات</h3>
                    <p className="text-sm text-slate-500 mb-6">بنين مقابل بنات</p>
                    {typeData.length > 0 ? (
                        <>
                            <ResponsiveContainer width="100%" height={220}>
                                <PieChart>
                                    <Pie
                                        data={typeData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={55}
                                        outerRadius={90}
                                        paddingAngle={4}
                                        dataKey="value"
                                        label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                                    >
                                        <Cell fill="#6366f1" />
                                        <Cell fill="#ec4899" />
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="flex justify-center gap-6 mt-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-indigo-500" />
                                    <span className="text-sm text-slate-600">بنين ({stats.male})</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-pink-500" />
                                    <span className="text-sm text-slate-600">بنات ({stats.female})</span>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-64 text-slate-400">
                            <p>لا توجد بيانات</p>
                        </div>
                    )}
                </Card>
            </div>

            {/* بطاقات تفصيلية للمراحل */}
            {levelData.length > 0 && (
                <div className="mb-8">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">تفاصيل المراحل الدراسية</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {levelData.map((level) => (
                            <Card key={level.name} className="hover:shadow-md transition-all">
                                <h4 className="font-bold text-slate-800 text-center mb-3">{level.name}</h4>
                                <div className="flex justify-center gap-4">
                                    <div className="text-center">
                                        <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mx-auto mb-1">
                                            <span className="text-lg font-bold text-indigo-600">{level.بنين}</span>
                                        </div>
                                        <span className="text-xs text-slate-500">بنين</span>
                                    </div>
                                    <div className="text-center">
                                        <div className="w-12 h-12 rounded-xl bg-pink-50 flex items-center justify-center mx-auto mb-1">
                                            <span className="text-lg font-bold text-pink-600">{level.بنات}</span>
                                        </div>
                                        <span className="text-xs text-slate-500">بنات</span>
                                    </div>
                                </div>
                                <div className="mt-3 text-center">
                                    <span className="text-xs text-slate-400">الإجمالي: </span>
                                    <span className="text-sm font-bold text-slate-700">{level.الإجمالي}</span>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* أعلى المدارس من حيث المتدربين */}
            {traineesData.length > 0 && (
                <Card className="mb-8">
                    <h3 className="text-lg font-bold text-slate-800 mb-1">أعلى المدارس من حيث عدد المتدربين</h3>
                    <p className="text-sm text-slate-500 mb-6">للعام الدراسي الحالي</p>
                    <ResponsiveContainer width="100%" height={Math.max(350, traineesData.length * 40)}>
                        <BarChart data={traineesData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis type="number" tick={{ fontSize: 12 }} />
                            <YAxis dataKey="name" type="category" width={200} tick={{ fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', direction: 'rtl' }}
                                formatter={(value) => [`${value} متدرب`, 'عدد المتدربين']}
                            />
                            <Bar dataKey="trainees_count" name="عدد المتدربين" radius={[0, 8, 8, 0]}>
                                {traineesData.map((entry, index) => (
                                    <Cell key={index} fill={entry.type === 'male' ? '#6366f1' : '#ec4899'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                    <div className="flex justify-center gap-6 mt-4">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-indigo-500" />
                            <span className="text-sm text-slate-600">بنين</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-pink-500" />
                            <span className="text-sm text-slate-600">بنات</span>
                        </div>
                    </div>
                </Card>
            )}

            {/* توزيع حسب المنطقة */}
            {districtData.length > 0 && (
                <Card>
                    <h3 className="text-lg font-bold text-slate-800 mb-1">توزيع المدارس حسب المنطقة الجغرافية</h3>
                    <p className="text-sm text-slate-500 mb-6">عدد المدارس في كل منطقة</p>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={districtData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', direction: 'rtl' }}
                                formatter={(value) => [`${value} مدرسة`, 'العدد']}
                            />
                            <Bar dataKey="value" name="عدد المدارس" radius={[8, 8, 0, 0]}>
                                {districtData.map((_, index) => (
                                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
            )}
        </AuthenticatedLayout>
    );
}
