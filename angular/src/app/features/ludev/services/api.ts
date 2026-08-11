import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Result, ResultsViewState } from '@ludev/components/results-panel/results-panel';
import { SharedData } from '@ludev/services/shared-data';
import { environment } from '@src/environments/environment';

const httpOptions = {
  headers: new HttpHeaders({'Content-Type': 'application/json'})
};

@Injectable({
  providedIn: 'root',
})
export class Api {
  response = {};
  
  constructor(private http: HttpClient, private sharedData: SharedData) { }

  analyze(text: string): Observable<any> {
    return this.http.post(environment.ludev_flask_api, {"text": text, "options": this.sharedData.currentFilters}, httpOptions);
  }

  update(response: Result[]) {
    this.response = response;
    this.sharedData.setData(response);
  }

  updateState(state: ResultsViewState) {
    this.sharedData.setState(state);
  }

  private selectedCandidateSubject = new BehaviorSubject<string | null>(null);
  selectedCandidate$ = this.selectedCandidateSubject.asObservable();

  updateSelectedCandidate(candidate: string | null): void {
    this.selectedCandidateSubject.next(candidate);
  }
}
