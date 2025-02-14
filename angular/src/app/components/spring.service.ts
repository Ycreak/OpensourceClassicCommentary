// src/app/services/taxa.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SpringService {
  private baseUrl = 'https://nsr.dryrun.link/api/v1/taxa';

  constructor(private http: HttpClient) {}

  public get(query: string): Observable<any> {
    return this.http.get<any>(query);
  }
  
  public get_taxa(name: string): Observable<any> {
    const url = `${this.baseUrl}?taxonName=${name}`;
    return new Observable((observer) => {
      this.get(url).subscribe({
        next: (data) => {
          observer.next(data);
          observer.complete();
        },
        error: (err) => console.log(err),
      });
    });
  }
  public get_taxon(linnaeusId: string, item: string): Observable<any> {
    const url = `${this.baseUrl}/${linnaeusId}/${item}`;
    return new Observable((observer) => {
      this.get(url).subscribe({
        next: (data) => {
          observer.next(data);
          observer.complete();
        },
        error: (err) => console.log(err),
      });
    });
  }
}
