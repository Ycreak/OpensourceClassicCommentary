import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { Result, ResultsViewState } from '@ludev/components/results-panel/results-panel';

export interface Filters {
  meters: string[];
  maxDistance: number | null;
  minSyllables: number | null;
  maxSyllables: number | null;
  minShortSyllables: number | null;
  maxShortSyllables: number | null;
  minLongSyllables: number | null;
  maxLongSyllables: number | null;
  minElisionSyllables: number | null;
  maxElisionSyllables: number | null;
  minConfidence: number | null;
  maxConfidence: number | null;
  minRepeatedVowelTypes: number | null;
  maxRepeatedVowelTypes: number | null;
  halfMeters: 'only' | 'none' | 'either';
  minNumFeet: number | null;
  maxNumFeet: number | null;
  endsInMonosyllableRestriction: 'ends' | 'does_not_end' | 'either';
}

// init filter vals
const filters: Filters = {
  meters: [
    'hexameter',
    'pentameter',
    'hendecasyllable',
    'iambic_trimeter',
    'iambic_senarius',
    'iambic_septenarius',
    'iambic_octonarius',
    'trochaic_septenarius',
    'trochaic_octonarius',
  ],
  maxDistance: 2,
  minSyllables: 11,
  maxSyllables: 18,
  minShortSyllables: null,
  maxShortSyllables: null,
  minLongSyllables: null,
  maxLongSyllables: null,
  minElisionSyllables: null,
  maxElisionSyllables: null,
  minConfidence: 0.85,
  maxConfidence: 1,
  minRepeatedVowelTypes: null,
  maxRepeatedVowelTypes: null,
  halfMeters: 'none',
  minNumFeet: null,
  maxNumFeet: null,
  endsInMonosyllableRestriction: 'either',
};

@Injectable({
  providedIn: 'root',
})
export class SharedData {
  private data = new Subject<Result[]>();
  data$ = this.data.asObservable();
  private state = new BehaviorSubject<ResultsViewState>('empty');
  state$ = this.state.asObservable();
  private filtersSubject = new BehaviorSubject<Filters>(filters);
  filters$ = this.filtersSubject.asObservable();
  private analyze = new BehaviorSubject<boolean>(false);
  analyze$ = this.analyze.asObservable();

  setData(data: Result[]) {
    this.data.next(data);
  }

  setState(viewState: ResultsViewState) {
    this.state.next(viewState);
  }

  setFilters(filters: Filters) {
    this.filtersSubject.next(filters);
  }

  get currentFilters(): Filters {
    return this.filtersSubject.getValue();
  }

  runOnAnalyze() {
    this.analyze.next(true);
  }

  lastAnalyzedFilters: Filters | null = null;

  recordAnalysis(): void {
    this.lastAnalyzedFilters = { ...this.filtersSubject.getValue() };
  }
}
