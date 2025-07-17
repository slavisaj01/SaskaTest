import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Category } from '../models/category';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  constructor(private http: HttpClient) {}

  getCategories(): Observable<any[]> {
  return this.http.get<any[]>('http://localhost:3000/categories').pipe(
     map((data) =>
      data.map((cat) => ({
        id: cat.id,
        code: cat.code,
        name: cat.name,
        parentCode: cat['parent-code'] || null
      }))
    )
  );}

  
}
