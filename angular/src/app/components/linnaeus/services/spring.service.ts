// src/app/services/taxa.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SpringService {
  private baseUrl = 'https://nsr.dryrun.link/api/v1';
  //private baseUrl = 'https://www-b.nederlandsesoorten.nl/api/v1';

  constructor(private http: HttpClient) {}

  public get(query: string): Observable<any> {
    return this.http.get<any>(query);
  }

  public get_traits(traitgroup_id: string): Observable<any> {
    const url = `${this.baseUrl}/traitgroups/values/${traitgroup_id}`;
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
  public get_traitgroups(): Observable<any> {
    const url = `${this.baseUrl}/traitgroups`;
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
  public get_trait_values(trait_id: string): Observable<any> {
    const url = `${this.baseUrl}/traits/${trait_id}/values`;
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
  public get_taxa_on_trait(trait_id: string): Observable<any> {
    const url = `${this.baseUrl}/taxa?traitValueId=${trait_id}`;
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
  public get_taxa(name: string): Observable<any> {
    const url = `${this.baseUrl}/taxa?taxonName=${name}`;
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
    const url = `${this.baseUrl}/taxa/${linnaeusId}/${item}`;
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
