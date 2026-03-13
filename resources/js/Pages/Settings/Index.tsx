import AuthenticatedLayout from '@/Components/Layout/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState, useRef } from 'react';
import { Settings, Save, Clock, Building, Upload, Image, X, List, Plus, Edit2, Trash2, Check } from 'lucide-react';
import Card, { CardHeader } from '@/Components/UI/Card';
import Button from '@/Components/UI/Button';
import PageHeader from '@/Components/UI/PageHeader';
import Input from '@/Components/UI/Input';

interface Setting {
    id: number;
    key: string;
    value: string | null;
    type: string;
    group: string;
}

interface DropdownOption {
    id: number;
    category: string;
    value: string;
    label: string;
    rate: number | null;
    sort_order: number;
    is_active: boolean;
}

interface Props {
    settings: Record<string, Setting[]>;
    dropdownCategories: Record<string, DropdownOption[]>;
}

const settingLabels: Record<string, { label: string; hint?: string }> = {
    hours_per_day: { label: 'ساعات التدريب اليومية', hint: 'عدد ساعات التدريب في اليوم الواحد' },
    training_start_time: { label: 'وقت بداية التدريب', hint: 'وقت بداية الجلسات التدريبية' },
    training_end_time: { label: 'وقت نهاية التدريب', hint: 'وقت نهاية الجلسات التدريبية' },
    organization_name: { label: 'اسم المؤسسة', hint: 'اسم مركز أو إدارة التدريب' },
    organization_logo: { label: 'شعار المؤسسة', hint: 'صورة شعار المؤسسة' },
    payment_month_1: { label: 'شهر الصرف الأول', hint: 'رقم الشهر (مثلاً: 12 لديسمبر)' },
    payment_month_2: { label: 'شهر الصرف الثاني', hint: 'رقم الشهر (مثلاً: 3 لمارس)' },
    payment_month_3: { label: 'شهر الصرف الثالث', hint: 'رقم الشهر (مثلاً: 6 ليونيو)' },
};

const groupLabels: Record<string, { label: string; icon: React.ElementType }> = {
    training: { label: 'إعدادات التدريب', icon: Clock },
    general: { label: 'إعدادات عامة', icon: Building },
    payments: { label: 'إعدادات الصرف', icon: Settings },
};

const categoryLabels: Record<string, string> = {
    program_types:  'أنواع البرامج',
    meeting_halls:  'قاعات الاجتماعات',
    group_statuses: 'حالات المجموعات',
    assignment_types: 'أنواع التكليفات وقيمة الساعة',
};

const categoriesWithRate = ['assignment_types'];

export default function Index({ settings, dropdownCategories }: Props) {
    const allSettings = Object.values(settings).flat();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(
        allSettings.find(s => s.key === 'organization_logo')?.value || null
    );
    const [logoFile, setLogoFile] = useState<File | null>(null);

    // Dropdown management state
    const [editingOption, setEditingOption] = useState<DropdownOption | null>(null);
    const [addingTo, setAddingTo] = useState<string | null>(null);
    const [newLabel, setNewLabel] = useState('');
    const [newRate, setNewRate] = useState('');
    const [editLabel, setEditLabel] = useState('');
    const [editRate, setEditRate] = useState('');

    const form = useForm({
        settings: allSettings.map((s) => ({ key: s.key, value: s.value || '' })),
    });

    const handleChange = (key: string, value: string) => {
        const newSettings = form.data.settings.map((s) =>
            s.key === key ? { ...s, value } : s
        );
        form.setData('settings', newSettings);
    };

    const getValue = (key: string) => {
        return form.data.settings.find((s) => s.key === key)?.value || '';
    };

    const handleLogoClick = () => {
        fileInputRef.current?.click();
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLogoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveLogo = () => {
        setLogoPreview(null);
        setLogoFile(null);
        handleChange('organization_logo', '');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (logoFile) {
            const formData = new FormData();
            formData.append('logo', logoFile);
            form.data.settings.forEach((setting, index) => {
                formData.append(`settings[${index}][key]`, setting.key);
                formData.append(`settings[${index}][value]`, setting.value);
            });

            router.post(route('settings.update'), formData, {
                preserveScroll: true,
                forceFormData: true,
            });
        } else {
            form.post(route('settings.update'), {
                preserveScroll: true,
            });
        }
    };

    const handleAddOption = (category: string) => {
        if (!newLabel.trim()) return;
        const label = newLabel.trim();
        const data: Record<string, any> = { category, value: label, label };
        if (categoriesWithRate.includes(category) && newRate) {
            data.rate = parseFloat(newRate);
        }
        router.post(route('dropdown-options.store'), data, {
            preserveScroll: true,
            onSuccess: () => {
                setNewLabel('');
                setNewRate('');
                setAddingTo(null);
            },
        });
    };

    const handleUpdateOption = () => {
        if (!editingOption || !editLabel.trim()) return;
        const label = editLabel.trim();
        const data: Record<string, any> = { value: label, label, is_active: editingOption.is_active };
        if (categoriesWithRate.includes(editingOption.category)) {
            data.rate = editRate ? parseFloat(editRate) : null;
        }
        router.put(route('dropdown-options.update', editingOption.id), data, {
            preserveScroll: true,
            onSuccess: () => setEditingOption(null),
        });
    };

    const handleDeleteOption = (option: DropdownOption) => {
        if (!confirm(`هل أنت متأكد من حذف "${option.label}"؟`)) return;
        router.delete(route('dropdown-options.destroy', option.id), { preserveScroll: true });
    };

    const handleToggleActive = (option: DropdownOption) => {
        router.put(route('dropdown-options.update', option.id), {
            value: option.value,
            label: option.label,
            is_active: !option.is_active,
        }, { preserveScroll: true });
    };

    const startEditing = (option: DropdownOption) => {
        setEditingOption(option);
        setEditLabel(option.label);
        setEditRate(option.rate != null ? String(option.rate) : '');
    };

    return (
        <AuthenticatedLayout>
            <Head title="الإعدادات" />

            <PageHeader
                title="الإعدادات"
                description="إعدادات النظام العامة"
            />

            <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                    {Object.entries(settings).map(([group, groupSettings]) => {
                        const groupInfo = groupLabels[group] || { label: group, icon: Settings };
                        const GroupIcon = groupInfo.icon;

                        return (
                            <Card key={group}>
                                <CardHeader
                                    title={
                                        <span className="flex items-center gap-2">
                                            <GroupIcon className="h-5 w-5 text-teal-600" />
                                            {groupInfo.label}
                                        </span>
                                    }
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {groupSettings.map((setting) => {
                                        const info = settingLabels[setting.key] || { label: setting.key };

                                        if (setting.key === 'organization_logo') {
                                            return (
                                                <div key={setting.key} className="md:col-span-2">
                                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                        {info.label}
                                                    </label>
                                                    <div className="flex items-start gap-6">
                                                        <div
                                                            onClick={handleLogoClick}
                                                            className="relative w-32 h-32 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center cursor-pointer hover:border-teal-400 hover:bg-teal-50/30 transition-all overflow-hidden group"
                                                        >
                                                            {logoPreview ? (
                                                                <>
                                                                    <img
                                                                        src={logoPreview}
                                                                        alt="شعار المؤسسة"
                                                                        className="w-full h-full object-contain p-2"
                                                                    />
                                                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                        <Upload className="h-8 w-8 text-white" />
                                                                    </div>
                                                                </>
                                                            ) : (
                                                                <div className="text-center">
                                                                    <Image className="h-10 w-10 text-slate-400 mx-auto mb-2" />
                                                                    <span className="text-xs text-slate-500">اضغط لرفع الشعار</span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="flex-1 space-y-3">
                                                            <input
                                                                ref={fileInputRef}
                                                                type="file"
                                                                accept="image/*"
                                                                onChange={handleLogoChange}
                                                                className="hidden"
                                                            />
                                                            <p className="text-sm text-slate-500">
                                                                {info.hint}
                                                            </p>
                                                            <p className="text-xs text-slate-400">
                                                                الصيغ المدعومة: PNG, JPG, SVG - الحجم الأقصى: 2MB
                                                            </p>
                                                            <div className="flex gap-2">
                                                                <Button
                                                                    type="button"
                                                                    size="sm"
                                                                    variant="secondary"
                                                                    icon={<Upload className="h-4 w-4" />}
                                                                    onClick={handleLogoClick}
                                                                >
                                                                    {logoPreview ? 'تغيير الشعار' : 'رفع شعار'}
                                                                </Button>
                                                                {logoPreview && (
                                                                    <Button
                                                                        type="button"
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        icon={<X className="h-4 w-4" />}
                                                                        onClick={handleRemoveLogo}
                                                                    >
                                                                        إزالة
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        }

                                        return (
                                            <div key={setting.key}>
                                                {setting.type === 'time' ? (
                                                    <Input
                                                        label={info.label}
                                                        type="time"
                                                        value={getValue(setting.key)}
                                                        onChange={(e) => handleChange(setting.key, e.target.value)}
                                                        hint={info.hint}
                                                    />
                                                ) : setting.type === 'integer' ? (
                                                    <Input
                                                        label={info.label}
                                                        type="number"
                                                        min={1}
                                                        value={getValue(setting.key)}
                                                        onChange={(e) => handleChange(setting.key, e.target.value)}
                                                        hint={info.hint}
                                                    />
                                                ) : (
                                                    <Input
                                                        label={info.label}
                                                        value={getValue(setting.key)}
                                                        onChange={(e) => handleChange(setting.key, e.target.value)}
                                                        hint={info.hint}
                                                    />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </Card>
                        );
                    })}
                </div>

                <div className="mt-6 flex justify-end">
                    <Button type="submit" icon={<Save className="h-4 w-4" />} loading={form.processing}>
                        حفظ الإعدادات
                    </Button>
                </div>
            </form>

            {/* Dropdown Management Section */}
            <div className="mt-8">
                <div className="flex items-center gap-2 mb-4">
                    <List className="h-5 w-5 text-slate-500" />
                    <h2 className="text-base font-bold text-slate-700">إدارة القوائم المنسدلة</h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {Object.entries(dropdownCategories).map(([category, options]) => (
                        <Card key={category} padding="none">
                            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                                <div className="flex items-center gap-2">
                                    <List className="h-4 w-4 text-slate-400" />
                                    <h3 className="text-sm font-bold text-slate-700">{categoryLabels[category] || category}</h3>
                                    <span className="text-xs text-slate-400">({options.length})</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => { setAddingTo(category); setNewLabel(''); }}
                                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                    إضافة
                                </button>
                            </div>

                            <div className="divide-y divide-slate-50">
                                {options.map((option, index) => (
                                    <div
                                        key={option.id}
                                        className={`flex items-center gap-2 px-4 py-2 transition-colors ${
                                            option.is_active
                                                ? 'hover:bg-slate-50/50'
                                                : 'bg-slate-50/30'
                                        }`}
                                    >
                                        <span className="w-6 h-6 rounded bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                            {index + 1}
                                        </span>

                                        {editingOption?.id === option.id ? (
                                            <div className="flex-1 flex items-center gap-2">
                                                <input
                                                    type="text"
                                                    value={editLabel}
                                                    onChange={(e) => setEditLabel(e.target.value)}
                                                    placeholder="اسم الخيار"
                                                    className="flex-1 px-2 py-1 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                                                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleUpdateOption(); } }}
                                                />
                                                {categoriesWithRate.includes(category) && (
                                                    <input
                                                        type="number"
                                                        step="0.5"
                                                        value={editRate}
                                                        onChange={(e) => setEditRate(e.target.value)}
                                                        placeholder="قيمة الساعة"
                                                        className="w-24 px-2 py-1 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                                                    />
                                                )}
                                                <button type="button" onClick={handleUpdateOption} className="p-1 rounded bg-teal-100 text-teal-600 hover:bg-teal-200 transition-colors">
                                                    <Check className="h-3.5 w-3.5" />
                                                </button>
                                                <button type="button" onClick={() => setEditingOption(null)} className="p-1 rounded bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors">
                                                    <X className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex-1 flex items-center gap-2 min-w-0">
                                                    <span className={`text-sm truncate ${option.is_active ? 'text-slate-700 font-medium' : 'text-slate-400 line-through'}`}>
                                                        {option.label}
                                                    </span>
                                                    {option.rate != null && (
                                                        <span className="text-[10px] px-1.5 py-0.5 bg-teal-50 text-teal-600 rounded font-medium flex-shrink-0">
                                                            {option.rate} ر.ق/ساعة
                                                        </span>
                                                    )}
                                                    {!option.is_active && (
                                                        <span className="text-[10px] px-1.5 py-0.5 bg-red-50 text-red-500 rounded font-medium">معطل</span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100" style={{ opacity: 1 }}>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleToggleActive(option)}
                                                        className={`p-1 rounded transition-colors ${
                                                            option.is_active
                                                                ? 'hover:bg-amber-50 text-amber-500'
                                                                : 'hover:bg-green-50 text-green-500'
                                                        }`}
                                                        title={option.is_active ? 'تعطيل' : 'تفعيل'}
                                                    >
                                                        {option.is_active ? <X className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
                                                    </button>
                                                    <button type="button" onClick={() => startEditing(option)} className="p-1 rounded hover:bg-teal-50 text-teal-500 transition-colors">
                                                        <Edit2 className="h-3.5 w-3.5" />
                                                    </button>
                                                    <button type="button" onClick={() => handleDeleteOption(option)} className="p-1 rounded hover:bg-red-50 text-red-500 transition-colors">
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}

                                {addingTo === category && (
                                    <div className="flex items-center gap-2 px-4 py-2 bg-teal-50/30">
                                        <Plus className="h-3.5 w-3.5 text-teal-400 flex-shrink-0" />
                                        <input
                                            type="text"
                                            value={newLabel}
                                            onChange={(e) => setNewLabel(e.target.value)}
                                            placeholder="اسم الخيار"
                                            className="flex-1 px-2 py-1 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                                            autoFocus
                                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddOption(category); } }}
                                        />
                                        {categoriesWithRate.includes(category) && (
                                            <input
                                                type="number"
                                                step="0.5"
                                                value={newRate}
                                                onChange={(e) => setNewRate(e.target.value)}
                                                placeholder="قيمة الساعة"
                                                className="w-24 px-2 py-1 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                                            />
                                        )}
                                        <button type="button" onClick={() => handleAddOption(category)} className="p-1 rounded bg-teal-100 text-teal-600 hover:bg-teal-200 transition-colors">
                                            <Check className="h-3.5 w-3.5" />
                                        </button>
                                        <button type="button" onClick={() => setAddingTo(null)} className="p-1 rounded bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors">
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                )}

                                {options.length === 0 && addingTo !== category && (
                                    <div className="text-center py-6 text-slate-400">
                                        <p className="text-sm">لا توجد خيارات</p>
                                    </div>
                                )}
                            </div>
                        </Card>
                    ))}

                    {Object.keys(dropdownCategories).length === 0 && (
                        <Card className="col-span-full">
                            <div className="text-center py-8 text-slate-400">
                                <List className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                                <p className="text-sm">لا توجد قوائم منسدلة</p>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
