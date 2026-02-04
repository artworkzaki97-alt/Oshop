export type AccountType =
    | 'asset'
    | 'liability'
    | 'equity'
    | 'income'
    | 'expense';

export interface JournalLine {
    accountId: string; // Could be 'treasury_ID', 'user_ID', 'expense_ID', or manual account ID
    accountName: string;
    accountType: AccountType;
    debit: number;
    credit: number;
    description?: string;
}

export interface JournalEntry {
    id: string;
    entryNumber: string; // Sequence number e.g., JE-001
    date: string; // ISO
    description: string;
    lines: JournalLine[];
    totalAmount: number; // For validation (sum of debits == sum of credits)
    createdAt: string;
    createdBy: string;
}

export interface ManualAccount {
    id: string;
    name: string;
    type: AccountType;
    code?: string;
    parentAccount?: string;
}
