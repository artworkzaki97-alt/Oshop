'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, CreditCard, Loader2, Search, DollarSign, Calendar } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { SheinCard } from '@/lib/types';
import { getSheinCards, addSheinCard, updateSheinCard, deleteSheinCard, getTreasuryBalance, addTreasuryTransaction } from '@/lib/actions';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function SheinCardsPage() {
    const { toast } = useToast();
    const [cards, setCards] = useState<SheinCard[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'used' | 'expired'>('all');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isTreasuryDialogOpen, setIsTreasuryDialogOpen] = useState(false);
    const [treasuryBalance, setTreasuryBalance] = useState(0);
    const [treasuryAmount, setTreasuryAmount] = useState('');
    const [treasuryNote, setTreasuryNote] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Form State
    const [currentCardId, setCurrentCardId] = useState<string | null>(null);
    const [code, setCode] = useState('');
    const [value, setValue] = useState('');
    const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
    const [notes, setNotes] = useState('');
    const [status, setStatus] = useState<'available' | 'used' | 'expired'>('available');

    useEffect(() => {
        fetchCards();
    }, []);

    const fetchCards = async () => {
        setIsLoading(true);
        const [data, balance] = await Promise.all([
            getSheinCards(),
            getTreasuryBalance()
        ]);
        setCards(data);
        setTreasuryBalance(balance);
        setIsLoading(false);
    };

    const handleOpenDialog = (card?: SheinCard) => {
        if (card) {
            setCurrentCardId(card.id);
            setCode(card.code);
            setValue(card.value.toString());
            setPurchaseDate(card.purchaseDate.split('T')[0]);
            setNotes(card.notes || '');
            setStatus(card.status);
        } else {
            setCurrentCardId(null);
            setCode('');
            setValue('');
            setPurchaseDate(new Date().toISOString().split('T')[0]);
            setNotes('');
            setStatus('available');
        }
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        if (!code || !value) {
            toast({ title: "خطأ", description: "الكود والقيمة مطلوبان", variant: "destructive" });
            return;
        }

        setIsSaving(true);
        try {
            const cardData = {
                code,
                value: parseFloat(value),
                currency: 'USD' as const,
                purchaseDate: new Date(purchaseDate).toISOString(),
                notes,
                status
            };

            if (currentCardId) {
                await updateSheinCard(currentCardId, cardData);
                toast({ title: "تم التحديث", description: "تم تحديث البطاقة بنجاح" });
            } else {
                await addSheinCard(cardData);
                toast({ title: "تم الإضافة", description: "تم إضافة البطاقة بنجاح" });
            }
            setIsDialogOpen(false);
            fetchCards();
        } catch (error) {
            console.error(error);
            toast({ title: "خطأ", description: "حدث خطأ أثناء الحفظ", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm(`هل أنت متأكد من حذف هذه البطاقة؟`)) {
            try {
                await deleteSheinCard(id);
                toast({ title: "تم الحذف", description: "تم حذف البطاقة بنجاح" });
                fetchCards();
            } catch (error) {
                toast({ title: "خطأ", description: "فشل الحذف", variant: "destructive" });
            }
        }
    };

    const filteredCards = useMemo(() => {
        return cards.filter(card => {
            const matchesSearch = card.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                card.notes?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === 'all' || card.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [cards, searchQuery, statusFilter]);

    // Summary Stats
    const totalAvailableValue = cards.filter(c => c.status === 'available').reduce((sum, c) => sum + (c.remainingValue ?? c.value), 0);
    const totalCardsCount = cards.length;
    const availableCardsCount = cards.filter(c => c.status === 'available').length;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <h1 className="text-3xl font-bold tracking-tight">إدارة البطاقات والخزينة</h1>
                <div className="flex gap-2">
                    <Button onClick={() => setIsTreasuryDialogOpen(true)} variant="secondary" className="gap-2">
                        <DollarSign className="w-4 h-4" />
                        إضافة رصيد USDT
                    </Button>
                    <Button onClick={() => handleOpenDialog()}>
                        <Plus className="w-4 h-4 ml-2" />
                        إضافة بطاقة جديدة
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">إجمالي الرصيد المتاح</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalAvailableValue.toFixed(2)} $</div>
                        <p className="text-xs text-muted-foreground">قيمة البطاقات غير المستخدمة</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">عدد البطاقات المتاحة</CardTitle>
                        <CreditCard className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{availableCardsCount}</div>
                        <p className="text-xs text-muted-foreground">بطاقة جاهزة للاستخدام</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">إجمالي البطاقات</CardTitle>
                        <div className="h-4 w-4 text-muted-foreground">#</div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalCardsCount}</div>
                        <p className="text-xs text-muted-foreground">مجموع الكل (متاح + مستخدم)</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">خزينة USDT</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-800 dark:text-green-200">{treasuryBalance.toFixed(2)} $</div>
                        <p className="text-xs text-green-600/80 dark:text-green-400">الرصيد النقدي المتاح</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
                        <div className="relative flex-1 max-w-sm w-full">
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="بحث عن كود أو ملاحظة..."
                                className="pr-9"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="تصفية حسب الحالة" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">الكل</SelectItem>
                                <SelectItem value="available">متاح</SelectItem>
                                <SelectItem value="used">مستخدم</SelectItem>
                                <SelectItem value="expired">منتهي الصلاحية</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-right">الكود</TableHead>
                                    <TableHead className="text-center">القيمة ($)</TableHead>
                                    <TableHead className="text-center">الحالة</TableHead>
                                    <TableHead className="text-center">تاريخ الشراء</TableHead>
                                    <TableHead className="text-right">ملاحظات</TableHead>
                                    <TableHead className="text-center">إجراءات</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">
                                            <div className="flex justify-center items-center">
                                                <Loader2 className="w-6 h-6 animate-spin" />
                                                <span className="mr-2">جاري التحميل...</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : filteredCards.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                            لا توجد بطاقات مطابقة
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredCards.map((card) => (
                                        <TableRow key={card.id} className={card.status === 'used' ? 'bg-muted/30' : ''}>
                                            <TableCell className="font-mono font-medium dir-ltr text-right">{card.code}</TableCell>
                                            <TableCell className="text-center font-bold text-green-600 dir-ltr">
                                                {(card.remainingValue ?? card.value).toFixed(2)}
                                                {card.remainingValue !== undefined && card.remainingValue < card.value && (
                                                    <span className="text-xs text-muted-foreground block line-through decoration-red-500/50">
                                                        {card.value.toFixed(2)}
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant={card.status === 'available' ? 'default' : card.status === 'used' ? 'secondary' : 'destructive'}>
                                                    {card.status === 'available' ? 'متاح' : card.status === 'used' ? 'مستخدم' : 'منتهي'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center font-mono text-sm">
                                                {format(new Date(card.purchaseDate), 'yyyy-MM-dd')}
                                            </TableCell>
                                            <TableCell className="max-w-[200px] truncate" title={card.notes}>
                                                {card.notes || '-'}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex justify-center gap-2">
                                                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(card)}>
                                                        <Pencil className="w-4 h-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(card.id)}>
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{currentCardId ? 'تعديل بطاقة' : 'إضافة بطاقة جديدة'}</DialogTitle>
                        <DialogDescription>
                            أدخل تفاصيل بطاقة الهدايا.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>كود البطاقة</Label>
                            <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="أدخل كود البطاقة" dir="ltr" />
                        </div>
                        <div className="space-y-2">
                            <Label>القيمة ($)</Label>
                            <Input type="number" step="0.01" value={value} onChange={(e) => setValue(e.target.value)} placeholder="0.00" dir="ltr" />
                        </div>
                        <div className="space-y-2">
                            <Label>تاريخ الشراء</Label>
                            <Input type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>الحالة</Label>
                            <Select value={status} onValueChange={(v: any) => setStatus(v)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="available">متاح</SelectItem>
                                    <SelectItem value="used">مستخدم</SelectItem>
                                    <SelectItem value="expired">منتهي الصلاحية</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>ملاحظات</Label>
                            <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="ملاحظات إضافية..." />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>إلغاء</Button>
                        <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            حفظ
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isTreasuryDialogOpen} onOpenChange={setIsTreasuryDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>إضافة رصيد للخزينة (USDT)</DialogTitle>
                        <DialogDescription>
                            أدخل المبلغ الذي تود إيداعه في الخزينة.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>المبلغ ($)</Label>
                            <Input
                                type="number"
                                step="0.01"
                                value={treasuryAmount}
                                onChange={(e) => setTreasuryAmount(e.target.value)}
                                placeholder="0.00"
                                dir="ltr"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>الملاحظات (اختياري)</Label>
                            <Input
                                value={treasuryNote}
                                onChange={(e) => setTreasuryNote(e.target.value)}
                                placeholder="سبب الإيداع..."
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsTreasuryDialogOpen(false)}>إلغاء</Button>
                        <Button onClick={async () => {
                            if (!treasuryAmount) return;
                            setIsSaving(true);
                            try {
                                await addTreasuryTransaction({
                                    amount: parseFloat(treasuryAmount),
                                    type: 'deposit',
                                    description: treasuryNote || 'إيداع يدوي',
                                });
                                toast({ title: "تم الإيداع", description: "تم إضافة الرصيد بنجاح" });
                                setIsTreasuryDialogOpen(false);
                                setTreasuryAmount('');
                                setTreasuryNote('');
                                fetchCards();
                            } catch (e) {
                                toast({ title: "خطأ", description: "فشل الإيداع", variant: "destructive" });
                            } finally {
                                setIsSaving(false);
                            }
                        }} disabled={isSaving}>
                            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            إيداع
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
