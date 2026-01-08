'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Order, Transaction, User, OrderStatus, Deposit, WalletTransaction } from '@/lib/types';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from '@/components/ui/use-toast';
import { addWalletTransaction } from '@/lib/actions';
import {
    User as UserIcon,
    Phone,
    Home,
    ShoppingCart,
    CreditCard,
    ListOrdered,
    ArrowRight,
    Printer,
    MapPin,
    Calendar,
    ArrowUpRight,
    ArrowDownLeft,
    Wallet,
    ArrowUpCircle,
    ArrowDownCircle,
    Receipt
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import logo from '@/app/assets/logo.png';

interface UserProfileClientProps {
    user: User;
    orders: Order[];
    transactions: Transaction[];
    deposits: Deposit[];
    walletTransactions: WalletTransaction[];
    totalOrdersValue: number;
    totalOrdersCount: number;
    totalDebt: number;
}

const statusConfig: Record<string, { text: string; className: string }> = {
    pending: { text: 'قيد التجهيز', className: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
    processed: { text: 'تم التنفيذ', className: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20' },
    ready: { text: 'تم التجهيز', className: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' },
    shipped: { text: 'تم الشحن', className: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
    arrived_misrata: { text: 'وصلت مصراتة', className: 'bg-teal-500/10 text-teal-500 border-teal-500/20' },
    out_for_delivery: { text: 'مع المندوب', className: 'bg-lime-500/10 text-lime-500 border-lime-500/20' },
    delivered: { text: 'تم التسليم', className: 'bg-green-500/10 text-green-500 border-green-500/20' },
    cancelled: { text: 'ملغي', className: 'bg-red-500/10 text-red-500 border-red-500/20' },
    paid: { text: 'مدفوع', className: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
    returned: { text: 'راجع', className: 'bg-red-500/10 text-red-500 border-red-500/20' },
    // Legacy
    arrived_dubai: { text: 'وصلت دبي', className: 'bg-orange-500/10 text-orange-500 border-orange-500/20' },
    arrived_benghazi: { text: 'وصلت بنغازي', className: 'bg-teal-500/10 text-teal-500 border-teal-500/20' },
    arrived_tobruk: { text: 'وصلت طبرق', className: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
};

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariant = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
};

export const UserProfileClient = ({
    user,
    orders,
    transactions,
    deposits,
    walletTransactions,
    totalOrdersValue,
    totalOrdersCount,
    totalDebt
}: UserProfileClientProps) => {

    const [isWalletDialogOpen, setIsWalletDialogOpen] = React.useState(false);
    const [walletActionType, setWalletActionType] = React.useState<'deposit' | 'withdrawal'>('deposit');
    const [walletAmount, setWalletAmount] = React.useState('');
    const [walletDescription, setWalletDescription] = React.useState('');
    const [paymentMethod, setPaymentMethod] = React.useState<'cash' | 'bank'>('cash');
    const [isSubmittingWallet, setIsSubmittingWallet] = React.useState(false);
    const { toast } = useToast();

    const handleWalletAction = async () => {
        const amount = parseFloat(walletAmount);
        if (!amount || amount <= 0) {
            toast({ title: "خطأ", description: "الرجاء إدخال مبلغ صحيح", variant: "destructive" });
            return;
        }

        setIsSubmittingWallet(true);
        const success = await addWalletTransaction(
            user.id,
            amount,
            walletActionType,
            walletDescription || (walletActionType === 'deposit' ? 'إيداع رصيد' : 'سحب رصيد'),
            undefined, // managerId
            walletActionType === 'deposit' ? paymentMethod : undefined
        );

        if (success) {
            toast({ title: "نجاح", description: "تمت العملية بنجاح" });
            setIsWalletDialogOpen(false);
            setWalletAmount('');
            setWalletDescription('');
            // Optional: Trigger a refresh or update local state if needed. 
            // Ideally, we should router.refresh() or passed callback.
            window.location.reload();
        } else {
            toast({ title: "خطأ", description: "فشلت العملية", variant: "destructive" });
        }
        setIsSubmittingWallet(false);
    };

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-8 pb-10"
        >
            {/* Navigation & Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link href="/admin/users">
                    <Button variant="ghost" className="rounded-full w-12 h-12 p-0 hover:bg-black/5 dark:hover:bg-white/10">
                        <ArrowRight className="w-6 h-6 text-muted-foreground" />
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold text-foreground">ملف المستخدم</h1>
            </div>

            {/* Hero Section */}
            <motion.div variants={itemVariant}>
                <GlassCard variant="premium" className="relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full -mr-32 -mt-32 pointer-events-none" />

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                        <div className="flex items-center gap-6">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-orange-600 p-1 shadow-xl shadow-primary/20 flex items-center justify-center bg-white dark:bg-zinc-900">
                                <div className="relative w-full h-full rounded-full overflow-hidden bg-white dark:bg-black/20 p-2">
                                    <Image
                                        src={logo}
                                        alt="User Logo"
                                        layout="fill"
                                        objectFit="contain"
                                        className="p-2"
                                    />
                                </div>
                            </div>

                            <div>
                                <h2 className="text-3xl font-black text-foreground mb-2 flex items-center gap-3">
                                    {user.name}
                                    <Badge variant="outline" className="text-xs font-normal bg-primary/10 text-primary border-primary/20">
                                        عميل
                                    </Badge>
                                </h2>
                                <div className="flex flex-wrap gap-4 text-muted-foreground">
                                    <div className="flex items-center gap-2 bg-black/5 dark:bg-white/5 px-3 py-1 rounded-full text-sm">
                                        <UserIcon className="w-4 h-4" />
                                        @{user.username}
                                    </div>
                                    <div className="flex items-center gap-2 bg-black/5 dark:bg-white/5 px-3 py-1 rounded-full text-sm">
                                        <Phone className="w-4 h-4" />
                                        <span dir="ltr">{user.phone}</span>
                                    </div>
                                    <div className="flex items-center gap-2 bg-black/5 dark:bg-white/5 px-3 py-1 rounded-full text-sm">
                                        <MapPin className="w-4 h-4" />
                                        {user.address || 'غير محدد'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3 w-full md:w-auto">
                            <Link href={`/admin/users/${user.id}/print`} target="_blank">
                                <Button variant="outline" className="gap-2 border-primary/20 hover:border-primary/50 hover:bg-primary/5">
                                    <Printer className="w-4 h-4" />
                                    طباعة كشف حساب
                                </Button>
                            </Link>
                            <Link href={`/admin/orders/add?userId=${user.id}&name=${user.name}&phone=${user.phone}&address=${user.address}`}>
                                <Button className="gap-2 bg-gradient-to-r from-primary to-orange-600 hover:from-primary/90 hover:to-orange-600/90 shadow-lg shadow-primary/25">
                                    <ShoppingCart className="w-4 h-4" />
                                    طلب جديد
                                </Button>
                            </Link>
                        </div>
                    </div>
                </GlassCard>
            </motion.div>

            {/* Wallet Section */}
            <motion.div variants={itemVariant} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <GlassCard variant="neon" className="border-l-4 border-l-emerald-500 col-span-1 md:col-span-3">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-emerald-500/10 rounded-full text-emerald-500">
                                <Wallet className="w-8 h-8" />
                            </div>
                            <div>
                                <p className="text-muted-foreground font-medium mb-1">رصيد المحفظة</p>
                                <h3 className="text-4xl font-black text-emerald-500">{user.walletBalance?.toLocaleString() || 0} <span className="text-lg font-normal text-muted-foreground">د.ل</span></h3>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={() => { setWalletActionType('deposit'); setIsWalletDialogOpen(true); }} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                                <ArrowDownLeft className="w-4 h-4" />
                                إيداع
                            </Button>
                            <Button onClick={() => { setWalletActionType('withdrawal'); setIsWalletDialogOpen(true); }} variant="outline" className="gap-2 border-red-500/20 hover:bg-red-500/10 text-red-500">
                                <ArrowUpRight className="w-4 h-4" />
                                سحب
                            </Button>
                        </div>
                    </div>
                </GlassCard>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div variants={itemVariant}>
                    <GlassCard variant="neon" className="border-l-4 border-l-primary">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-muted-foreground font-medium mb-1">إجمالي الطلبات</p>
                                <h3 className="text-3xl font-black text-foreground">{totalOrdersValue.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">د.ل</span></h3>
                            </div>
                            <div className="p-3 bg-primary/10 rounded-xl text-primary">
                                <Wallet className="w-6 h-6" />
                            </div>
                        </div>
                    </GlassCard>
                </motion.div>

                <motion.div variants={itemVariant}>
                    <GlassCard variant="neon" className="border-l-4 border-l-red-500">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-muted-foreground font-medium mb-1">الدين المستحق</p>
                                <h3 className="text-3xl font-black text-red-500">{totalDebt.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">د.ل</span></h3>
                            </div>
                            <div className="p-3 bg-red-500/10 rounded-xl text-red-500">
                                <CreditCard className="w-6 h-6" />
                            </div>
                        </div>
                    </GlassCard>
                </motion.div>

                <motion.div variants={itemVariant}>
                    <GlassCard variant="neon" className="border-l-4 border-l-purple-500">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-muted-foreground font-medium mb-1">عدد الطلبات</p>
                                <h3 className="text-3xl font-black text-foreground">{totalOrdersCount} <span className="text-sm font-normal text-muted-foreground">طلب</span></h3>
                            </div>
                            <div className="p-3 bg-purple-500/10 rounded-xl text-purple-500">
                                <ListOrdered className="w-6 h-6" />
                            </div>
                        </div>
                    </GlassCard>
                </motion.div>
            </div>

            {/* Tabs Section */}
            <motion.div variants={itemVariant} className="mt-8">
                <Tabs defaultValue="orders" className="w-full">
                    <TabsList className="grid w-full grid-cols-4 mb-8">
                        <TabsTrigger value="orders">الطلبات</TabsTrigger>
                        <TabsTrigger value="wallet">المحفظة</TabsTrigger>
                        <TabsTrigger value="transactions">المعاملات المالية</TabsTrigger>
                        <TabsTrigger value="deposits">سجل العربون</TabsTrigger>
                    </TabsList>

                    <TabsContent value="wallet">
                        <GlassCard className="h-full">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <Wallet className="w-5 h-5 text-emerald-500" />
                                    سجل المحفظة
                                </h3>
                            </div>

                            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                {walletTransactions && walletTransactions.length > 0 ? (
                                    walletTransactions.map((tx) => (
                                        <div key={tx.id} className="flex items-center justify-between p-4 rounded-xl bg-black/5 dark:bg-white/5 mb-3 border border-transparent hover:border-primary/10">
                                            <div className="flex items-center gap-4">
                                                <div className={`p-2 rounded-full ${tx.type === 'deposit' ? 'bg-emerald-100/50 text-emerald-600' : 'bg-red-100/50 text-red-600'}`}>
                                                    {tx.type === 'deposit' ? <ArrowUpCircle className="w-5 h-5" /> : <ArrowDownCircle className="w-5 h-5" />}
                                                </div>
                                                <div>
                                                    <p className="font-semibold">{tx.type === 'deposit' ? 'إيداع' : 'سحب'}</p>
                                                    <p className="text-xs text-muted-foreground">{new Date(tx.createdAt).toLocaleDateString('ar-LY', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</p>
                                                </div>
                                            </div>
                                            <div className="text-left">
                                                <p className={`font-bold ${tx.type === 'deposit' ? 'text-emerald-600' : 'text-red-600'}`}>
                                                    {tx.type === 'deposit' ? '+' : '-'}{tx.amount.toFixed(2)} د.ل
                                                </p>
                                                <div className="flex items-center justify-end gap-2 mt-1">
                                                    <p className="text-xs text-muted-foreground truncate max-w-[150px]">{tx.description}</p>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6"
                                                        title="طباعة إيصال"
                                                        onClick={() => {
                                                            const printWindow = window.open('', '', 'width=600,height=600');
                                                            if (printWindow) {
                                                                printWindow.document.write(`
                                                                    <html dir="rtl">
                                                                        <head>
                                                                            <title>إيصال مالي - ${tx.id.slice(0, 8)}</title>
                                                                            <style>
                                                                                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; text-align: center; border: 1px solid #ccc; max-width: 500px; margin: 20px auto; }
                                                                                .header { margin-bottom: 30px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
                                                                                .amount { font-size: 32px; font-weight: bold; color: ${tx.type === 'deposit' ? '#10b981' : '#ef4444'}; margin: 20px 0; }
                                                                                .details { text-align: right; margin: 20px 0; line-height: 1.8; }
                                                                                .footer { margin-top: 40px; font-size: 12px; color: #888; border-top: 1px solid #eee; padding-top: 20px; }
                                                                                @media print { body { border: none; margin: 0; } }
                                                                            </style>
                                                                        </head>
                                                                        <body>
                                                                            <div class="header">
                                                                                <h2>إيصال ${tx.type === 'deposit' ? 'إيداع' : 'سحب'} مالي</h2>
                                                                                <p>${new Date().toLocaleString('ar-LY')}</p>
                                                                            </div>
                                                                            <div class="amount">${tx.amount.toFixed(2)} د.ل</div>
                                                                            <div class="details">
                                                                                <strong>اسم العميل:</strong> ${user.name}<br>
                                                                                <strong>التاريخ:</strong> ${new Date(tx.createdAt).toLocaleString('ar-LY')}<br>
                                                                                <strong>النوع:</strong> ${tx.type === 'deposit' ? 'إيداع في المحفظة' : 'سحب من المحفظة'}<br>
                                                                                <strong>الوصف:</strong> ${tx.description}<br>
                                                                                ${tx.paymentMethod ? `<strong>طريقة الدفع:</strong> ${tx.paymentMethod === 'cash' ? 'نقدي' : 'مصرفي'}<br>` : ''}
                                                                                <strong>رقم العملية:</strong> ${tx.id}
                                                                            </div>
                                                                            <div class="footer">
                                                                                <p>Huwiyya Shipping - Oshop</p>
                                                                                <p>تم استخراج هذا الإيصال إلكترونياً</p>
                                                                            </div>
                                                                            <script>window.print();</script>
                                                                        </body>
                                                                    </html>
                                                                `);
                                                                printWindow.document.close();
                                                            }
                                                        }}
                                                    >
                                                        <Printer className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-10">
                                        <p className="text-muted-foreground">لا توجد حركات في المحفظة</p>
                                    </div>
                                )}
                            </div>
                        </GlassCard>
                    </TabsContent>

                    <TabsContent value="orders">
                        <GlassCard className="h-full">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <ShoppingCart className="w-5 h-5 text-primary" />
                                    سجل الطلبات
                                </h3>
                                <span className="text-xs font-mono bg-black/5 dark:bg-white/5 px-2 py-1 rounded">
                                    {orders.length} طلب
                                </span>
                            </div>

                            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                {orders.length > 0 ? (
                                    orders.map((order) => {
                                        const statusStyle = statusConfig[order.status] || { text: order.status, className: 'bg-gray-100 text-gray-500' };
                                        return (
                                            <div key={order.id} className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-transparent hover:border-primary/20 transition-all duration-300">
                                                <div className="flex items-center gap-4 mb-3 sm:mb-0">
                                                    <div className={`w-2 h-12 rounded-full ${order.remainingAmount > 0 ? 'bg-red-500' : 'bg-green-500'}`} />
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-bold text-foreground">#{order.invoiceNumber}</span>
                                                            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${statusStyle.className}`}>
                                                                {statusStyle.text}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(order.operationDate).toLocaleDateString('ar-LY')}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                                                    <div className="text-left">
                                                        <p className="text-xs text-muted-foreground">المتبقي</p>
                                                        <p className={`font-bold ${order.remainingAmount > 0 ? 'text-red-500' : 'text-green-500'}`}>
                                                            {order.remainingAmount.toLocaleString()} <span className="text-[10px]">د.ل</span>
                                                        </p>
                                                    </div>

                                                    <Link href={`/admin/orders/${order.id}`}>
                                                        <Button size="icon" variant="ghost" className="rounded-full hover:bg-primary/20 hover:text-primary">
                                                            <ArrowUpRight className="w-5 h-5" />
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-center py-10">
                                        <div className="w-16 h-16 bg-black/5 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <ShoppingCart className="w-8 h-8 text-muted-foreground/50" />
                                        </div>
                                        <p className="text-muted-foreground">لا توجد طلبات مسجلة</p>
                                    </div>
                                )}
                            </div>
                        </GlassCard>
                    </TabsContent>

                    <TabsContent value="transactions">
                        <GlassCard className="h-full">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <Wallet className="w-5 h-5 text-primary" />
                                    المعاملات المالية
                                </h3>
                            </div>

                            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                {transactions.length > 0 ? (
                                    transactions.map((tx) => (
                                        <div key={tx.id} className="relative pl-4 border-r-2 border-black/5 dark:border-white/5 last:border-0 pb-6 last:pb-0">
                                            <div className={`absolute -right-[5px] top-0 w-2.5 h-2.5 rounded-full ${tx.type === 'payment' ? 'bg-green-500 ring-4 ring-green-500/20' : 'bg-red-500 ring-4 ring-red-500/20'}`} />

                                            <div className="flex justify-between items-start mb-1">
                                                <span className="text-sm font-bold text-foreground">{tx.type === 'payment' ? 'دفعة مستلمة' : 'دين جديد'}</span>
                                                <span className={`font-mono font-bold text-sm ${tx.type === 'payment' ? 'text-green-500' : 'text-red-500'}`}>
                                                    {tx.type === 'payment' ? '+' : '-'}{tx.amount.toLocaleString()}
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground mb-1 line-clamp-2">{tx.description}</p>
                                            <span className="text-[10px] text-muted-foreground/70 bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded-full">
                                                {new Date(tx.date).toLocaleDateString('ar-LY')}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-10">
                                        <p className="text-muted-foreground">لا توجد معاملات</p>
                                    </div>
                                )}
                            </div>
                        </GlassCard>
                    </TabsContent>

                    <TabsContent value="deposits">
                        <GlassCard className="h-full">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <Receipt className="w-5 h-5 text-primary" />
                                    سجل العربون
                                </h3>
                                <span className="text-xs font-mono bg-black/5 dark:bg-white/5 px-2 py-1 rounded">
                                    {deposits.length} عملية
                                </span>
                            </div>

                            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                {deposits.length > 0 ? (
                                    deposits.map((deposit) => (
                                        <div key={deposit.id} className="flex items-center justify-between p-4 rounded-xl bg-black/5 dark:bg-white/5 mb-3">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                                                    <Receipt className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-sm">إيصال #{deposit.receiptNumber}</h4>
                                                    <p className="text-xs text-muted-foreground">{deposit.description}</p>
                                                </div>
                                            </div>
                                            <div className="text-left">
                                                <p className="font-bold text-green-500">{deposit.amount.toLocaleString()} د.ل</p>
                                                <p className="text-[10px] text-muted-foreground">{new Date(deposit.date).toLocaleDateString('ar-LY')}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-10">
                                        <p className="text-muted-foreground">لا يوجد سجل عربون</p>
                                    </div>
                                )}
                            </div>
                        </GlassCard>
                    </TabsContent>
                </Tabs>
                <Dialog open={isWalletDialogOpen} onOpenChange={setIsWalletDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{walletActionType === 'deposit' ? 'إيداع رصيد' : 'سحب رصيد'}</DialogTitle>
                            <DialogDescription>
                                {walletActionType === 'deposit' ? 'أدخل المبلغ المراد إيداعه في محفظة العميل' : 'أدخل المبلغ المراد سحبه من محفظة العميل'}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>المبلغ</Label>
                                <Input
                                    type="number"
                                    placeholder="0.00"
                                    value={walletAmount}
                                    onChange={(e) => setWalletAmount(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>ملاحظات (اختياري)</Label>
                                <Input
                                    placeholder="وصف العملية..."
                                    value={walletDescription}
                                    onChange={(e) => setWalletDescription(e.target.value)}
                                />
                            </div>

                            {walletActionType === 'deposit' && (
                                <div className="space-y-3">
                                    <Label>طريقة الإيداع</Label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div
                                            onClick={() => setPaymentMethod('cash')}
                                            className={`cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center justify-center gap-2 transition-all duration-200 ${paymentMethod === 'cash' ? 'border-primary bg-primary/10' : 'border-transparent bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10'}`}
                                        >
                                            <Wallet className={`w-6 h-6 ${paymentMethod === 'cash' ? 'text-primary' : 'text-muted-foreground'}`} />
                                            <span className={`font-bold ${paymentMethod === 'cash' ? 'text-primary' : 'text-muted-foreground'}`}>نقدي (Cash)</span>
                                        </div>

                                        <div
                                            onClick={() => setPaymentMethod('bank')}
                                            className={`cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center justify-center gap-2 transition-all duration-200 ${paymentMethod === 'bank' ? 'border-primary bg-primary/10' : 'border-transparent bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10'}`}
                                        >
                                            <CreditCard className={`w-6 h-6 ${paymentMethod === 'bank' ? 'text-primary' : 'text-muted-foreground'}`} />
                                            <span className={`font-bold ${paymentMethod === 'bank' ? 'text-primary' : 'text-muted-foreground'}`}>مصرفي (Bank)</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsWalletDialogOpen(false)}>إلغاء</Button>
                            <Button onClick={handleWalletAction} disabled={isSubmittingWallet}>
                                {isSubmittingWallet ? 'جاري التنفيذ...' : 'تأكيد'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </motion.div>
        </motion.div>
    );
};
