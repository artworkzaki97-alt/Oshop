'use server';

import { supabaseAdmin } from './supabase-admin';
import { JournalEntry, JournalLine, ManualAccount } from './accounting-types';
import { revalidatePath } from 'next/cache';

// Mock DB for Manual Accounts (since we might not have a table yet)
// We will store them in a JSON field or a new table if possible.
// For this iteration, we'll try to use a 'journal_entries' table and 'manual_accounts' table.
// If they don't exist, we will create sql to make them.

export async function createJournalEntry(data: Omit<JournalEntry, 'id' | 'createdAt' | 'createdBy' | 'entryNumber'>) {
    // 1. Validate Balance
    const totalDebit = data.lines.reduce((sum, line) => sum + line.debit, 0);
    const totalCredit = data.lines.reduce((sum, line) => sum + line.credit, 0);

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
        return { success: false, error: 'الالقيد غير متوازن (المدين لا يساوي الدائن)' };
    }

    try {
        // Generate ID
        const id = crypto.randomUUID();
        const entryNumber = `JE-${Date.now().toString().slice(-6)}`;

        // Insert into DB
        // We will assume a table 'journal_entries' exists. If not, we'll need to create it.
        const payload = {
            id,
            entry_number: entryNumber,
            date: data.date,
            description: data.description,
            lines: data.lines, // Stored as JSONB
            total_amount: totalDebit,
            created_at: new Date().toISOString()
            // created_by: retrieved from context
        };

        const { error } = await supabaseAdmin.from('journal_entries').insert(payload);

        if (error) {
            console.error('DB Error:', error);
            // Fallback: If table doesn't exist, we might need to run a migration.
            // For now, return error.
            return { success: false, error: 'فشل حفظ القيد. الرجاء التأكد من وجود جدول journal_entries.' };
        }

        revalidatePath('/admin/accounting');
        return { success: true, id };

    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function getJournalEntries(): Promise<JournalEntry[]> {
    const { data, error } = await supabaseAdmin
        .from('journal_entries')
        .select('*')
        .order('date', { ascending: false })
        .limit(50);

    if (error) return [];

    return data.map((d: any) => ({
        id: d.id,
        entryNumber: d.entry_number,
        date: d.date,
        description: d.description,
        lines: d.lines,
        totalAmount: d.total_amount,
        createdAt: d.created_at,
        createdBy: d.created_by || 'Admin'
    }));
}
