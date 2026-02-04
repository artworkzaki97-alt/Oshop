'use server';

import { supabaseAdmin } from './supabase-admin';
import { revalidatePath } from 'next/cache';

export interface CashAccount {
    id: string;
    name: string;
    currency: 'LYD' | 'USD';
    balance: number;
    code?: string;
    description?: string;
}

// Reuse existing treasury_cards_v4 table but filter for cash types
export async function getCashAccounts(): Promise<CashAccount[]> {
    const { data, error } = await supabaseAdmin
        .from('treasury_cards_v4')
        .select('*')
        .in('type', ['cash_libyan', 'cash_dollar'])
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching cash accounts:', error);
        return [];
    }

    return data.map((d: any) => ({
        id: d.id,
        name: d.name,
        currency: d.currency,
        balance: d.balance || 0,
        description: d.description
    }));
}

export async function createCashAccount(data: Omit<CashAccount, 'id' | 'balance'>) {
    try {
        const type = data.currency === 'LYD' ? 'cash_libyan' : 'cash_dollar';

        const { error } = await supabaseAdmin.from('treasury_cards_v4').insert({
            name: data.name,
            type: type,
            currency: data.currency,
            balance: 0,
            description: data.description
        });

        if (error) throw error;
        revalidatePath('/admin/accounting/cash-accounts');
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export interface BankAccount {
    id: string;
    name: string;
    currency: 'LYD' | 'USD';
    balance: number;
    accountNumber?: string;
    bankName?: string;
}

export async function getBankAccounts(): Promise<BankAccount[]> {
    const { data, error } = await supabaseAdmin
        .from('treasury_cards_v4')
        .select('*')
        .eq('type', 'bank')
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching bank accounts:', error);
        return [];
    }

    return data.map((d: any) => ({
        id: d.id,
        name: d.name,
        currency: d.currency,
        balance: d.balance || 0,
        accountNumber: d.description, // Overloading description field for Account Number
        bankName: d.name
    }));
}

export async function createBankAccount(data: Omit<BankAccount, 'id' | 'balance'>) {
    try {
        const { error } = await supabaseAdmin.from('treasury_cards_v4').insert({
            name: data.name,
            type: 'bank',
            currency: data.currency,
            balance: 0,
            description: data.accountNumber // Store Account Number in description
        });

        if (error) throw error;
        revalidatePath('/admin/accounting/bank-accounts');
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

