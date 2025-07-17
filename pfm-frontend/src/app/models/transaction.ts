export interface Transaction {
  id: string;
  beneficiaryName: string;
  date: string; // ISO string, kasnije može Date
  direction: 'c' | 'd'; // credit or debit
  amount: number;
  currency: string;
  kind: string;
  isSplit: boolean;
  category: string;
  subcategory?: string;
  selected?: boolean;
}
