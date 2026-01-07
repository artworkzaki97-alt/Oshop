'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { getOrdersByIds } from '@/lib/actions';
import { Order } from '@/lib/types';
import { Loader2, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PrintableInvoice } from '@/components/admin/PrintableInvoice';

const BulkPrintContent = () => {
    const searchParams = useSearchParams();
    const idsParam = searchParams.get('ids');
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            if (idsParam) {
                setIsLoading(true);
                const ids = idsParam.split(',');
                if (ids.length > 0) {
                    const data = await getOrdersByIds(ids);
                    setOrders(data);
                }
                setIsLoading(false);
            } else {
                setIsLoading(false);
            }
        };

        fetchOrders();
    }, [idsParam]);

    const handlePrint = () => {
        window.print();
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen no-print">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                <p className="ml-4">جاري تجهيز البوليصات...</p>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="flex justify-center items-center h-screen no-print">
                <p className="text-red-500">لا توجد طلبات للطباعة.</p>
            </div>
        );
    }

    return (
        <div className="bg-gray-100 min-h-screen">
            <style jsx global>{`
                @media print {
                    .page-break {
                        page-break-after: always;
                    }
                    .no-print {
                        display: none;
                    }
                    body {
                        background-color: white;
                    }
                    .printable-content {
                        box-shadow: none;
                        border: none;
                        margin: 0;
                        padding: 0;
                        width: 100%;
                    }
                }
            `}</style>

            <div className="w-full max-w-4xl mx-auto flex justify-end p-4 mb-4 no-print sticky top-0 bg-gray-100 z-10 border-b">
                <div className="flex items-center gap-4">
                    <span className="text-sm font-medium">عدد البوليصات: {orders.length}</span>
                    <Button onClick={handlePrint}>
                        <Printer className="w-4 h-4 ml-2" />
                        طباعة الكل
                    </Button>
                </div>
            </div>

            <div className="mx-auto w-full max-w-[210mm]">
                {orders.map((order, index) => (
                    <div key={order.id} className="mb-8 print:mb-0">
                        <div className={`printable-content bg-white ${index < orders.length - 1 ? 'page-break' : ''}`}>
                            <PrintableInvoice labelData={order} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default function Page() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-screen no-print"><Loader2 className="w-12 h-12 animate-spin text-primary" /></div>}>
            <BulkPrintContent />
        </Suspense>
    );
}
