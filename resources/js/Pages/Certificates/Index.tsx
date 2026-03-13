import AuthenticatedLayout from '@/Components/Layout/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import Card from '@/Components/UI/Card';
import PageHeader from '@/Components/UI/PageHeader';
import { Award } from 'lucide-react';

export default function Index() {
    return (
        <AuthenticatedLayout>
            <Head title="الشهادات" />
            <PageHeader title="الشهادات" description="إدارة شهادات المدربين والمتدربين" />
            <Card>
                <div className="text-center py-16 text-slate-500">
                    <Award className="h-16 w-16 mx-auto text-slate-300 mb-4" />
                    <p className="text-xl font-semibold text-slate-600">قريباً</p>
                    <p className="text-sm text-slate-400 mt-2">هذه الصفحة قيد التطوير</p>
                </div>
            </Card>
        </AuthenticatedLayout>
    );
}
