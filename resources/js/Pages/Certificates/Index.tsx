import AuthenticatedLayout from '@/Components/Layout/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, Trash2, Search, X, Award, Download, FileText, Edit2, Upload } from 'lucide-react';
import Card from '@/Components/UI/Card';
import Button from '@/Components/UI/Button';
import Badge from '@/Components/UI/Badge';
import PageHeader from '@/Components/UI/PageHeader';
import Modal, { ModalFooter } from '@/Components/UI/Modal';
import DeleteModal from '@/Components/UI/DeleteModal';
import Input from '@/Components/UI/Input';
import Textarea from '@/Components/UI/Textarea';

interface CertificateTemplate {
    id: number;
    name: string;
    description: string | null;
    file_path: string;
    original_filename: string;
    placeholders: string[] | null;
    is_active: boolean;
    created_by: number | null;
    creator: { id: number; name: string } | null;
    created_at: string;
}

interface Assignment {
    id: number;
    trainer: { id: number; name: string; employer: string | null };
    program: { id: number; name: string };
    package: { id: number; name: string; hours: number; days: number };
}

interface CertificateLog {
    id: number;
    certificate_template_id: number | null;
    assignment_id: number | null;
    trainer_id: number | null;
    placeholder_data: Record<string, string> | null;
    created_at: string;
    template: { id: number; name: string } | null;
    trainer: { id: number; name: string } | null;
    assignment: { id: number; program: { id: number; name: string }; package: { id: number; name: string; hours: number } } | null;
    generated_by: { id: number; name: string } | null;
}

interface Props {
    templates: CertificateTemplate[];
    logs: {
        data: CertificateLog[];
        total: number;
        links: Array<{ url: string | null; label: string; active: boolean }>;
    };
    assignments: Assignment[];
    filters: { search?: string };
    currentYear: string;
}

export default function Index({ templates, logs, assignments, filters, currentYear }: Props) {
    const [activeTab, setActiveTab] = useState<'templates' | 'generate'>('templates');
    const [showTemplateForm, setShowTemplateForm] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<CertificateTemplate | null>(null);
    const [deletingTemplate, setDeletingTemplate] = useState<CertificateTemplate | null>(null);
    const [search, setSearch] = useState(filters.search || '');
    const [searchTimer, setSearchTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

    // Generate form
    const [selectedAssignment, setSelectedAssignment] = useState<number | ''>('');
    const [selectedTemplate, setSelectedTemplate] = useState<number | ''>('');
    const [generating, setGenerating] = useState(false);

    // Template form
    const templateForm = useForm({
        name: '',
        description: '',
        file: null as File | null,
    });

    const openCreateTemplate = () => {
        setEditingTemplate(null);
        templateForm.setData({ name: '', description: '', file: null });
        setShowTemplateForm(true);
    };

    const openEditTemplate = (t: CertificateTemplate) => {
        setEditingTemplate(t);
        templateForm.setData({ name: t.name, description: t.description || '', file: null });
        setShowTemplateForm(true);
    };

    const handleTemplateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const options = {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                setShowTemplateForm(false);
                templateForm.reset();
            },
        };

        if (editingTemplate) {
            templateForm.post(route('certificates.templates.update', editingTemplate.id), options);
        } else {
            templateForm.post(route('certificates.templates.store'), options);
        }
    };

    const handleGenerate = async () => {
        if (!selectedAssignment || !selectedTemplate) return;
        setGenerating(true);

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
                || document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1]?.replace(/%3D/g, '=')
                || '';
            const response = await fetch(route('certificates.generate'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/octet-stream',
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    template_id: selectedTemplate,
                    assignment_id: selectedAssignment,
                }),
            });

            if (response.ok) {
                const blob = await response.blob();
                const contentDisposition = response.headers.get('Content-Disposition');
                let filename = 'certificate.docx';
                if (contentDisposition) {
                    const match = contentDisposition.match(/filename\*?=(?:UTF-8'')?["']?([^"';\n]+)/);
                    if (match) filename = decodeURIComponent(match[1]);
                }
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);

                // Reload to update logs
                router.reload({ only: ['logs'] });
            } else {
                const text = await response.text();
                console.error('Generate error:', response.status, text);
                alert('حدث خطأ أثناء إنشاء الشهادة. الرجاء المحاولة مرة أخرى.');
            }
        } catch (err) {
            console.error('Generate error:', err);
            alert('حدث خطأ أثناء إنشاء الشهادة.');
        } finally {
            setGenerating(false);
        }
    };

    const handleSearchChange = (val: string) => {
        setSearch(val);
        if (searchTimer) clearTimeout(searchTimer);
        setSearchTimer(setTimeout(() => {
            router.get(route('certificates.index'), { search: val || undefined }, { preserveState: true, preserveScroll: true });
        }, 400));
    };

    const activeTemplates = templates.filter(t => t.is_active);

    return (
        <AuthenticatedLayout>
            <Head title="الشهادات" />

            <PageHeader
                title={<>الشهادات <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-amber-100 text-amber-700 mr-2">{templates.length} قالب</span></>}
                description="إدارة قوالب الشهادات وإصدارها"
            />

            {/* Tabs */}
            <div className="flex gap-1 mb-6 bg-white rounded-xl p-1 shadow-sm border border-slate-200 w-fit">
                <button
                    onClick={() => setActiveTab('templates')}
                    className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'templates' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                    القوالب
                </button>
                <button
                    onClick={() => setActiveTab('generate')}
                    className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'generate' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                    إنشاء وسجل الشهادات
                </button>
            </div>

            {activeTab === 'templates' && (
                <>
                    <div className="flex justify-end mb-4">
                        <Button icon={<Plus className="h-4 w-4" />} onClick={openCreateTemplate}>
                            رفع قالب جديد
                        </Button>
                    </div>

                    <Card padding="none">
                        {templates.length === 0 ? (
                            <div className="text-center py-16 text-slate-500">
                                <FileText className="h-14 w-14 mx-auto text-slate-300 mb-3" />
                                <p className="font-medium">لا توجد قوالب</p>
                                <p className="text-sm text-slate-400 mt-1">ابدأ برفع قالب شهادة بصيغة Word (.docx)</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-200 bg-slate-50/50">
                                            <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-600 uppercase tracking-wide">#</th>
                                            <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-600 uppercase tracking-wide">اسم القالب</th>
                                            <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-600 uppercase tracking-wide">الوصف</th>
                                            <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-600 uppercase tracking-wide">اسم الملف</th>
                                            <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-600 uppercase tracking-wide">المتغيرات المكتشفة</th>
                                            <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-600 uppercase tracking-wide">بواسطة</th>
                                            <th className="px-4 py-3.5 text-center text-xs font-bold text-slate-600 uppercase tracking-wide">الإجراءات</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {templates.map((t, i) => (
                                            <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-4 py-3 text-slate-500">{i + 1}</td>
                                                <td className="px-4 py-3 font-medium text-slate-800">{t.name}</td>
                                                <td className="px-4 py-3 text-slate-600 text-xs max-w-[200px] truncate">{t.description || '-'}</td>
                                                <td className="px-4 py-3 text-slate-600 text-xs">{t.original_filename}</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex flex-wrap gap-1">
                                                        {t.placeholders?.map((p) => (
                                                            <Badge key={p} variant="default">${`{${p}}`}</Badge>
                                                        )) || <span className="text-slate-400 text-xs">-</span>}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-xs text-slate-600">{t.creator?.name || '-'}</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <a href={`/storage/${t.file_path}`} download title="تحميل القالب" className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors">
                                                            <Download className="h-4 w-4" />
                                                        </a>
                                                        <button onClick={() => openEditTemplate(t)} title="تعديل" className="p-2 rounded-lg hover:bg-teal-100 text-teal-600 transition-colors">
                                                            <Edit2 className="h-4 w-4" />
                                                        </button>
                                                        <button onClick={() => setDeletingTemplate(t)} title="حذف" className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition-colors">
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </Card>
                </>
            )}

            {activeTab === 'generate' && (
                <>
                    {/* Generate Form */}
                    <Card className="mb-6">
                        <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                            <Award className="h-5 w-5 text-amber-500" />
                            إنشاء شهادة جديدة
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">التكليف (المدرب - البرنامج) <span className="text-red-500">*</span></label>
                                <select
                                    value={selectedAssignment}
                                    onChange={(e) => setSelectedAssignment(Number(e.target.value) || '')}
                                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-sm"
                                >
                                    <option value="">-- اختر التكليف --</option>
                                    {assignments.map(a => (
                                        <option key={a.id} value={a.id}>
                                            {a.trainer.name} - {a.program.name} ({a.package.name})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">قالب الشهادة <span className="text-red-500">*</span></label>
                                <select
                                    value={selectedTemplate}
                                    onChange={(e) => setSelectedTemplate(Number(e.target.value) || '')}
                                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-sm"
                                >
                                    <option value="">-- اختر القالب --</option>
                                    {activeTemplates.map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-end">
                                <button
                                    onClick={handleGenerate}
                                    disabled={!selectedAssignment || !selectedTemplate || generating}
                                    className="w-full px-4 py-2.5 text-sm font-medium bg-amber-600 text-white rounded-xl hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                                >
                                    <Download className="h-4 w-4" />
                                    {generating ? 'جاري الإنشاء...' : 'إنشاء وتحميل'}
                                </button>
                            </div>
                        </div>

                        {/* Available placeholders hint */}
                        {selectedTemplate && (() => {
                            const t = templates.find(t => t.id === selectedTemplate);
                            return t?.placeholders && t.placeholders.length > 0 ? (
                                <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                                    <p className="text-xs font-medium text-slate-600 mb-1">المتغيرات في هذا القالب:</p>
                                    <div className="flex flex-wrap gap-1">
                                        {t.placeholders.map(p => (
                                            <span key={p} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-xs text-slate-600">${`{${p}}`}</span>
                                        ))}
                                    </div>
                                </div>
                            ) : null;
                        })()}
                    </Card>

                    {/* Search */}
                    <Card className="mb-6">
                        <div className="relative">
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                placeholder="بحث بالمدرب..."
                                className="w-full pr-10 pl-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                            />
                            {search && (
                                <button onClick={() => handleSearchChange('')} className="absolute left-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-200 text-slate-400">
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </Card>

                    {/* Logs Table */}
                    <Card padding="none">
                        <div className="p-4 border-b border-slate-100">
                            <h3 className="font-bold text-slate-700 flex items-center gap-2">
                                سجل الشهادات الصادرة
                                <Badge variant="default">{logs.total}</Badge>
                            </h3>
                        </div>
                        {logs.data.length === 0 ? (
                            <div className="text-center py-12 text-slate-500">
                                <Award className="h-14 w-14 mx-auto text-slate-300 mb-3" />
                                <p className="font-medium">لا توجد شهادات صادرة</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-200 bg-slate-50/50">
                                            <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-600 uppercase tracking-wide">#</th>
                                            <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-600 uppercase tracking-wide">القالب</th>
                                            <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-600 uppercase tracking-wide">المدرب</th>
                                            <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-600 uppercase tracking-wide">البرنامج</th>
                                            <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-600 uppercase tracking-wide">بواسطة</th>
                                            <th className="px-4 py-3.5 text-right text-xs font-bold text-slate-600 uppercase tracking-wide">التاريخ</th>
                                            <th className="px-4 py-3.5 text-center text-xs font-bold text-slate-600 uppercase tracking-wide">تحميل</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {logs.data.map((log, i) => (
                                            <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-4 py-3 text-slate-500">{i + 1}</td>
                                                <td className="px-4 py-3 text-slate-700">{log.template?.name || '-'}</td>
                                                <td className="px-4 py-3 font-medium text-slate-800">{log.trainer?.name || '-'}</td>
                                                <td className="px-4 py-3 text-slate-600">{log.assignment?.program?.name || '-'}</td>
                                                <td className="px-4 py-3 text-xs text-slate-600">{log.generated_by?.name || '-'}</td>
                                                <td className="px-4 py-3 text-xs text-slate-600">{log.created_at?.substring(0, 10)}</td>
                                                <td className="px-4 py-3 text-center">
                                                    <a
                                                        href={route('certificates.logs.download', log.id)}
                                                        className="inline-flex p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors"
                                                        title="تحميل"
                                                    >
                                                        <Download className="h-4 w-4" />
                                                    </a>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </Card>

                    {/* Pagination */}
                    {logs.links && logs.links.length > 3 && (
                        <div className="mt-6 flex justify-center">
                            <nav className="flex items-center gap-1">
                                {logs.links.map((link, i) => (
                                    <button
                                        key={i}
                                        disabled={!link.url}
                                        onClick={() => link.url && router.get(link.url, {}, { preserveState: true, preserveScroll: true })}
                                        className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                                            link.active ? 'bg-teal-600 text-white' : link.url ? 'text-slate-600 hover:bg-slate-100' : 'text-slate-300 cursor-not-allowed'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </nav>
                        </div>
                    )}
                </>
            )}

            {/* Template Form Modal */}
            <Modal
                open={showTemplateForm}
                onClose={() => { setShowTemplateForm(false); templateForm.reset(); }}
                title={editingTemplate ? 'تعديل القالب' : 'رفع قالب جديد'}
                size="md"
            >
                <form onSubmit={handleTemplateSubmit} className="space-y-4">
                    <Input
                        label="اسم القالب"
                        value={templateForm.data.name}
                        onChange={(e) => templateForm.setData('name', e.target.value)}
                        error={templateForm.errors.name}
                        required
                    />
                    <Textarea
                        label="الوصف"
                        value={templateForm.data.description}
                        onChange={(e) => templateForm.setData('description', e.target.value)}
                        error={templateForm.errors.description}
                        rows={2}
                    />
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            ملف القالب (.docx) {!editingTemplate && <span className="text-red-500">*</span>}
                        </label>
                        {templateForm.data.file ? (
                            <div className="flex items-center gap-3 p-3 bg-teal-50 border border-teal-200 rounded-xl">
                                <FileText className="h-5 w-5 text-teal-600" />
                                <span className="text-sm text-teal-700 flex-1">{templateForm.data.file.name}</span>
                                <button type="button" onClick={() => templateForm.setData('file', null)} className="p-1 rounded hover:bg-teal-100">
                                    <X className="h-4 w-4 text-teal-600" />
                                </button>
                            </div>
                        ) : (
                            <label className="flex items-center justify-center gap-2 px-4 py-4 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-teal-400 hover:bg-teal-50/50 transition-all">
                                <Upload className="h-5 w-5 text-slate-400" />
                                <span className="text-sm text-slate-500">
                                    {editingTemplate ? 'اختر ملفاً جديداً (اختياري)' : 'اختر ملف Word (.docx)'}
                                </span>
                                <input
                                    type="file"
                                    accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                    className="hidden"
                                    onChange={(e) => {
                                        if (e.target.files?.[0]) {
                                            templateForm.setData('file', e.target.files[0]);
                                        }
                                    }}
                                />
                            </label>
                        )}
                        {templateForm.errors.file && (
                            <p className="text-xs text-red-500 mt-1">{templateForm.errors.file}</p>
                        )}
                        {editingTemplate && (
                            <p className="text-xs text-slate-500 mt-1">الملف الحالي: {editingTemplate.original_filename}</p>
                        )}
                    </div>

                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-xs font-medium text-blue-700 mb-1">المتغيرات المتاحة للاستخدام في القالب:</p>
                        <div className="flex flex-wrap gap-1 text-xs text-blue-600">
                            {['trainer_name', 'employee_name', 'national_id', 'employee_id', 'employer',
                              'program_name', 'package_name', 'hours', 'days', 'start_date', 'end_date',
                              'assignment_type', 'group_names', 'academic_year', 'date', 'organization_name'
                            ].map(p => (
                                <code key={p} className="px-1.5 py-0.5 bg-blue-100 rounded">${`{${p}}`}</code>
                            ))}
                        </div>
                    </div>

                    <ModalFooter>
                        <button type="button" onClick={() => { setShowTemplateForm(false); templateForm.reset(); }} className="px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-xl transition-colors">
                            إلغاء
                        </button>
                        <button
                            type="submit"
                            disabled={templateForm.processing || (!editingTemplate && !templateForm.data.file)}
                            className="px-6 py-2 text-sm font-medium bg-teal-600 text-white rounded-xl hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {templateForm.processing ? 'جاري الحفظ...' : (editingTemplate ? 'تحديث' : 'رفع القالب')}
                        </button>
                    </ModalFooter>
                </form>
            </Modal>

            <DeleteModal
                open={!!deletingTemplate}
                onClose={() => setDeletingTemplate(null)}
                action={deletingTemplate ? route('certificates.templates.destroy', deletingTemplate.id) : ''}
                message={`هل أنت متأكد من حذف القالب "${deletingTemplate?.name}"؟`}
            />
        </AuthenticatedLayout>
    );
}
