import React from 'react';
import { Order } from '@/lib/types';
import logo from '@/app/assets/logo.png';
import { Package, Hash, Calendar as CalendarIcon, DollarSign } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';

const InfoRow = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
    <div className="flex items-start">
        <div className="flex-shrink-0 w-28 text-gray-600 font-semibold flex items-center gap-1.5 whitespace-nowrap">
            {icon} {label}
        </div>
        <div className="font-medium">{value}</div>
    </div>
);

export const PrintableInvoice = ({ labelData }: { labelData: Order }) => {
    const isPaymentOnReceipt = labelData.remainingAmount > 0;
    // Calculate if shipping is calculated
    const hasShippingCalc = labelData.weightKG && labelData.weightKG > 0;

    return (
        <div className="bg-white shadow-lg flex flex-col border border-gray-300 w-full h-full mx-auto" dir="rtl">
            {/* Header */}
            <header className="grid grid-cols-3 items-center p-4 border-b border-gray-300">
                <div className="col-span-1 flex items-center gap-4">
                    <img src={logo.src} alt="Logo" style={{ width: '60px', height: '60px' }} />
                    <div>
                        <h1 className="text-lg font-bold whitespace-nowrap">بوليصة شحن</h1>
                        <p className="text-xs text-gray-500">شركة Oshop</p>
                    </div>
                </div>
                <div className="col-span-1"></div>
                <div className="col-span-1 text-left">
                    <p className="font-bold text-sm whitespace-nowrap">رقم الفاتورة: {labelData.invoiceNumber}</p>
                    <p className="text-xs text-gray-500">{format(new Date(labelData.operationDate), 'yyyy/MM/dd')}</p>
                </div>
            </header>

            {/* Sender & Receiver */}
            <section className="grid grid-cols-2 gap-4 p-4 border-b border-gray-300 text-sm">
                <div className="border-l border-gray-300 pl-4">
                    <h2 className="font-bold mb-2 whitespace-nowrap">من: المرسل</h2>
                    <p className="font-semibold">شركة Oshop</p>
                    <p>المقاوبة - الدائري الثاني - بالقرب من التقاطع, Misurata, Libya</p>
                    <p dir="ltr" className="text-right font-mono">0927172021</p>
                </div>
                <div>
                    <h2 className="font-bold mb-2 whitespace-nowrap">إلى: المستلم</h2>
                    <p className="font-semibold">{labelData.customerName}</p>
                    <p>{labelData.customerAddress}</p>
                    <p dir="ltr" className="text-right font-mono">{labelData.customerPhone}</p>
                </div>
            </section>

            {/* Order Details */}
            <section className="p-4 flex-grow">
                <h2 className="font-bold mb-2 whitespace-nowrap">تفاصيل الشحنة</h2>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    <InfoRow icon={<Package className="w-4 h-4" />} label="وصف المحتوى:" value={labelData.itemDescription || 'غير محدد'} />
                    <InfoRow icon={<Hash className="w-4 h-4" />} label="كود التتبع:" value={labelData.trackingId || 'N/A'} />
                    <InfoRow icon={<CalendarIcon className="w-4 h-4" />} label="تاريخ الطلب:" value={format(new Date(labelData.operationDate), 'yyyy/MM/dd')} />

                    {/* Weight & Shipping */}
                    {labelData.weightKG && labelData.weightKG > 0 && (
                        <>
                            <InfoRow icon={<Package className="w-4 h-4" />} label="الوزن:" value={`${labelData.weightKG} كجم`} />
                            {labelData.shippingPriceUSD && (
                                <InfoRow icon={<DollarSign className="w-4 h-4" />} label="سعر الشحن:" value={`${labelData.shippingPriceUSD} $/كجم`} />
                            )}
                        </>
                    )}

                    <InfoRow icon={<DollarSign className="w-4 h-4" />} label="المبلغ الإجمالي:" value={`${labelData.sellingPriceLYD.toFixed(2)} د.ل`} />
                </div>

                {/* Note about shipping cost if not calculated */}
                {!hasShippingCalc && (
                    <div className="mt-4 p-2 bg-yellow-50 text-yellow-700 text-xs rounded border border-yellow-200 text-center">
                        ملاحظة: سيتم احتساب تكلفة الشحن الجوي لاحقاً عند وصول الشحنة.
                    </div>
                )}

                <Separator className="my-4" />
                <div className="bg-gray-100 p-3 rounded-md text-center">
                    <p className="font-bold text-base whitespace-nowrap">
                        {isPaymentOnReceipt ? "المبلغ المطلوب عند الاستلام" : "الدفعة تمت بالكامل"}
                    </p>
                    {isPaymentOnReceipt && (
                        <p className="text-xl font-bold text-red-600">
                            {labelData.remainingAmount.toFixed(2)} د.ل
                        </p>
                    )}
                </div>
            </section>

            {/* Footer */}
            <footer className="mt-auto p-4 border-t border-gray-300 text-center flex-shrink-0">
                <p className="text-sm font-bold">شكراً لتعاملكم معنا!</p>
                <p className="text-xs text-gray-500 mt-1">
                    ملاحظة: الرجاء التأكد من سلامة الشحنة قبل التوقيع على الاستلام.
                </p>
            </footer>
        </div>
    );
};
