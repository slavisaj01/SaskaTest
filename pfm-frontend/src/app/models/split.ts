import { Category } from "./category";
export interface Split {
  id:number;
  category: Category | null;
  subcategory?: string;
  amount: number;
  filteredSubcategories: string[];
}
