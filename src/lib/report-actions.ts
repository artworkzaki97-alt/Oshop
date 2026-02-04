'use server';

import { supabaseAdmin } from './supabase-admin';
import { getUsers } from './actions'; // Uses existing logic to get users

export interface StatementTransaction {
    id: string;
    date: string;
    type: 'invoice' | 'receipt' | 'opening_balance';
    reference: string;
    description: string;
    debit: number; // Invoice Amount
    credit: number; // Receipt Amount
    balance: number; // Running Balance
}

export interface CustomerStatement {
    customer: any;
    fromDate: string;
    toDate: string;
    openingBalance: number;
    transactions: StatementTransaction[];
    closingBalance: number;
    totalDebit: number;
    totalCredit: number;
}

export async function getCustomerStatement(userId: string, fromDate: string, toDate: string): Promise<CustomerStatement> {
    try {
        // 1. Fetch Customer Details
        const { data: user } = await supabaseAdmin.from('users_v4').select('*').eq('id', userId).single();
        if (!user) throw new Error('Customer not found');

        // 2. Fetch All Orders (Invoices) - DEBITS
        // We fetch ALL to calculate opening balance correctly, then filter.
        // Optimally we would sum < fromDate via DB, but for now fetch all is safer for complex logic.
        const { data: orders } = await supabaseAdmin
            .from('orders_v4')
            .select('id, invoiceNumber, operationDate, total_amount_lyd, status')
            .eq('userId', userId)
            .neq('status', 'cancelled');

        // 3. Fetch All Receipts - CREDITS
        const { data: receipts } = await supabaseAdmin
            .from('accounting_transactions')
            .select('*')
            .eq('related_user_id', userId)
            .eq('type', 'receipt');

        // 4. Transform to Unified Transaction List
        let allTransactions: StatementTransaction[] = [];

        // Add Orders
        (orders || []).forEach((o: any) => {
            allTransactions.push({
                id: o.id,
                date: o.operationDate,
                type: 'invoice',
                reference: o.invoiceNumber || `ORD-${o.id.slice(0, 6)}`,
                description: `فاتورة مبيعات - ${o.status}`,
                debit: o.total_amount_lyd || 0,
                credit: 0,
                balance: 0
            });
        });

        // Add Receipts
        (receipts || []).forEach((r: any) => {
            allTransactions.push({
                id: r.id,
                date: r.date,
                type: 'receipt',
                reference: r.reference,
                description: r.description || 'سند قبض',
                debit: 0,
                credit: r.amount,
                balance: 0
            });
        });

        // 5. Sort by Date
        allTransactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // 6. Calculate Balances & Filter Scope
        let openingBalance = 0;
        let filteredTransactions: StatementTransaction[] = [];
        let runningBalance = 0;
        let totalDebit = 0;
        let totalCredit = 0;

        const start = new Date(fromDate).getTime();
        const end = new Date(toDate).getTime();
        // Adjust end to include the full day
        const endEndOfDay = end + (24 * 60 * 60 * 1000) - 1;

        for (const trx of allTransactions) {
            const trxDate = new Date(trx.date).getTime();

            if (trxDate < start) {
                // Determine effect on balance based on type
                // Typically: Debit increases balance (User owes us), Credit decreases it.
                // Asset perspective (Accounts Receivable).
                openingBalance += (trx.debit - trx.credit);
            } else if (trxDate <= endEndOfDay) {
                // In Range
                // We set the balance later
                filteredTransactions.push(trx);
            }
        }

        // Initialize running balance with opening
        runningBalance = openingBalance;

        // Update running balance for filtered range
        filteredTransactions = filteredTransactions.map(trx => {
            runningBalance += (trx.debit - trx.credit);

            totalDebit += trx.debit;
            totalCredit += trx.credit;

            return { ...trx, balance: runningBalance };
        });

        return {
            customer: user,
            fromDate,
            toDate,
            openingBalance,
            transactions: filteredTransactions,
            closingBalance: runningBalance,
            totalDebit,
            totalCredit
        };

    } catch (error) {
        console.error('Error in statement:', error);
        throw error;
    }
}
