import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, map, Observable, switchMap } from 'rxjs';
import { Transaction } from '../models/transaction';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {

  constructor(private http:HttpClient) { }

  getTransactions(): Observable<Transaction[]> {
    return this.http.get<any[]>('http://localhost:3000/transactions').pipe(
      map((data) =>
        data.map((item) => ({
          id: item.id,
          beneficiaryName: item['beneficiary-name'] || item.beneficiaryName,
          date: new Date(item.date).toISOString(), 
          direction: item.direction,
          amount: typeof item.amount === 'string'
          ? parseFloat(item.amount.replace(/,/g, ''))
          : item.amount,
          currency: item.currency,
          kind: item.kind,
          isSplit: item['isSplit'] ?? false,
          category: item.category ?? '',
          subcategory: item.subcategory ?? ''
        }))
      )
    );
  }

  updateTransactionCategory(id: string, update: { category: string; subcategory?: string }): Observable<any> {
    return this.http.patch(`http://localhost:3000/transactions/${id}`, update);
  }
  deleteTransaction(id: string): Observable<any> {
    return this.http.delete(`http://localhost:3000/transactions/${id}`);
  }

  splitTransaction(originalId: string, newTransactions: Partial<Transaction>[]): Observable<any> {
    const deleteOriginal$ = this.deleteTransaction(originalId);
    const addNewTransactions$ = newTransactions.map(tx =>
      this.http.post(`http://localhost:3000/transactions`, tx)
    );

    return deleteOriginal$.pipe(
      switchMap(() => forkJoin(addNewTransactions$))
    );
  }

}
