import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  //constructor() {}

  public saveData(key: string, value: string): void {
    localStorage.setItem(key, value);
  }

  public getData(key: string): any {
    return localStorage.getItem(key);
  }

  public removeData(key: string): void {
    localStorage.removeItem(key);
  }

  public clearData(): void {
    localStorage.clear();
  }
}
