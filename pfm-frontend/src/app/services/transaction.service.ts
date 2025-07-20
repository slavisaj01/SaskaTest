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
        data.map((item) => {
          console.log('Raw item:', item); // šta vraća JSON server

          const transaction: Transaction = {
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
            splits: item.splits ?? [], 
            category: item.category ?? '',
            subcategory: item.subcategory ?? '',
            selected: false
          };

          console.log('Parsed transaction:', transaction); // parsirano
          return transaction;
        })
      )
    );
  }



  updateTransactionCategory(id: string, update: { category: string; subcategory?: string }): Observable<any> {
    return this.http.patch(`http://localhost:3000/transactions/${id}`, update);
  }
  
  splitTransactionApiStyle(transactionId: string, splits: { catcode: string; amount: number }[]): Observable<any> {
    return this.http.patch(`http://localhost:3000/transactions/${transactionId}`, {
      isSplit: true,
      splits: splits
    });
  }
    

}
