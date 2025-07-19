export interface Transaction {
  id: string;
  beneficiaryName: string;
  date: string; 
  direction: 'c' | 'd'; // credit or debit
  amount: number;
  currency: string;
  kind: string;
  isSplit?: boolean;
  category: string;
  subcategory?: string;
  splits?: {
    catcode: string;
    amount: number;
  }[];
  selected?: boolean;
}
