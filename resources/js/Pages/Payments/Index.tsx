import AuthenticatedLayout from '@/Components/Layout/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import Card from '@/Components/UI/Card';
import PageHeader from '@/Components/UI/PageHeader';
import { Banknote } from 'lucide-react';

export default function Index() {
    return (
        <AuthenticatedLayout>
            <Head title="صرف المستحقات" />
            <PageHeader title="صرف المستحقات" description="إدارة صرف مستحقات المدربين" />
            <Card>
                <div className="text-center py-16 text-slate-500">
                    <Banknote className="h-16 w-16 mx-auto text-slate-300 mb-4" />
                    <p className="text-xl font-semibold text-slate-600">قريباً</p>
                    <p className="text-sm text-slate-400 mt-2">هذه الصفحة قيد التطوير</p>
                </div>
            </Card>
        </AuthenticatedLayout>
    );
}
