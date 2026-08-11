import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ResultCardComponent } from '@ludev/components/result-card/result-card';
import { SharedData } from '@ludev/services/shared-data';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';

export type ResultsViewState = 'loading' | 'empty' | 'error' | 'results' | 'strict_filters' | 'no_results';
export type SortOption = 'position' | 'distance' | 'confidence' | 'syllables' | 'meter';
export type SortDirection = 'asc' | 'desc';

export class Result {
  candidate_id: number;
  words: string[];
  syllables: Array<string>;
  labels: Array<string>;
  confidence: Array<number>;
  distance: number;
  meter: string;
  num_syllables: number;
  num_short_syllables: number;
  num_long_syllables: number;
  num_elision_syllables: number;
  avg_confidence: number;
  is_half_meter: boolean;
  half_meter_type: number;
  ends_in_monosyllable: boolean;

  constructor(candidate_id: number, words: string[], syllables: Array<string>, labels: Array<string>, confidence: Array<number>, distance: number, meter: string, num_syllables: number, num_short_syllables: number, num_long_syllables: number, num_elision_syllables: number, avg_confidence: number, is_half_meter: boolean, half_meter_type: number, ends_in_monosyllable: boolean) {
    this.candidate_id = candidate_id;
    this.words = words;
    this.syllables = syllables;
    this.labels = labels;
    this.confidence = confidence;
    this.distance = distance;
    this.meter = meter;
    this.num_syllables = num_syllables;
    this.num_short_syllables = num_short_syllables;
    this.num_long_syllables = num_long_syllables;
    this.num_elision_syllables = num_elision_syllables;
    this.avg_confidence = avg_confidence;
    this.is_half_meter = is_half_meter;
    this.half_meter_type = half_meter_type;
    this.ends_in_monosyllable = ends_in_monosyllable;
  }
}

@Component({
  selector: 'app-results-panel',
  imports: [
    ResultCardComponent,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatSelectModule,
    MatMenuModule,
    ScrollingModule,
  ],
  templateUrl: './results-panel.html',
  styleUrl: './results-panel.scss',
})
export class ResultsPanelComponent {
  viewState: ResultsViewState = 'empty';
  allResults: Array<Result> = [];
  results: Array<Result> = [];
  sortOption: SortOption = 'position';
  sortDirection: SortDirection = 'asc';

  constructor(private sharedData: SharedData) {
    this.sharedData.state$.subscribe({
      next: state => {
        this.viewState = state;
      },
      error: err => {
        this.viewState = 'error';
        console.error(err.status, err.statusText);
      }
    });

    this.sharedData.data$.subscribe({
      next: data => {
        this.allResults = data;
        if (this.allResults.length == 0) {
          this.viewState = 'no_results';
        } else {
          this.applyFilters();
          this.viewState = 'results';
        }
      },
      error: err => {
        this.viewState = 'error';
        console.error(err.status, err.statusText);
      },
    });

    this.sharedData.filters$.subscribe(() => {
      this.applyFilters();
    });
  }
  // filter logic & sort by distance
  private applyFilters(): void {
    const f = this.sharedData.currentFilters;
    // [...variable] notation necessary for changing in combination with cdkVirtualFor
    this.results = [...this.allResults.filter(r => {
      const baseMeter = r.meter.startsWith('half_') ? r.meter.split('_').slice(3).join('_') : r.meter;
      if (!f.meters.includes(baseMeter)) return false;
      if (f.maxDistance !== null && r.distance > f.maxDistance) return false;
      if (f.minSyllables !== null && r.num_syllables < f.minSyllables) return false;
      if (f.maxSyllables !== null && r.num_syllables > f.maxSyllables) return false;
      if (f.minShortSyllables !== null && r.num_short_syllables < f.minShortSyllables) return false;
      if (f.maxShortSyllables !== null && r.num_short_syllables > f.maxShortSyllables) return false;
      if (f.minLongSyllables !== null && r.num_long_syllables < f.minLongSyllables) return false;
      if (f.maxLongSyllables !== null && r.num_long_syllables > f.maxLongSyllables) return false;
      if (f.minElisionSyllables !== null && r.num_elision_syllables < f.minElisionSyllables) return false;
      if (f.maxElisionSyllables !== null && r.num_elision_syllables > f.maxElisionSyllables) return false;
      if (f.minConfidence !== null && r.avg_confidence < f.minConfidence) return false;
      if (f.maxConfidence !== null && r.avg_confidence > f.maxConfidence) return false;
      if (f.minRepeatedVowelTypes !== null || f.maxRepeatedVowelTypes !== null) {
        const maxVowelCount = Math.max(r.num_short_syllables, r.num_long_syllables, r.num_elision_syllables);
        if (f.minRepeatedVowelTypes !== null && maxVowelCount < f.minRepeatedVowelTypes) return false;
        if (f.maxRepeatedVowelTypes !== null && maxVowelCount > f.maxRepeatedVowelTypes) return false;
      }
      if (f.halfMeters === 'only' && !r.is_half_meter) return false;
      if (f.halfMeters === 'none' && r.is_half_meter) return false;
      if (f.minNumFeet !== null && r.is_half_meter && r.half_meter_type < f.minNumFeet) return false;
      if (f.maxNumFeet !== null && r.is_half_meter && r.half_meter_type > f.maxNumFeet) return false;
      if (f.endsInMonosyllableRestriction === 'ends' && !r.ends_in_monosyllable) return false;
      if (f.endsInMonosyllableRestriction === 'does_not_end' && r.ends_in_monosyllable) return false;
      return true;
    })];
    this.sortResults();
    // set results panel message for too strict filtering
    if (this.results.length == 0 && this.allResults.length > 0) {
      this.setViewState('strict_filters');
    } else if (this.viewState == 'strict_filters') {
      this.setViewState('results');
    }
  }

  private readonly FILTER_DEFAULTS = {
  maxDistance: 2,
  minConfidence: 0.85,
  maxConfidence: 1.0,
  halfMeters: 'none',
  endsInMonosyllableRestriction: 'either',
  } as const;

get activeFilterLabels(): string[] {
  const f = this.sharedData.currentFilters;
  const labels: string[] = [];
  const add = (label: string) => labels.push(label);
  const addRange = (name: string, min: number | null, max: number | null, suffix = '') =>
    this.addFilterRange(labels, name, min, max, suffix);

  if (f.maxDistance !== null && f.maxDistance !== this.FILTER_DEFAULTS.maxDistance)
    add(`Dist ≤ ${f.maxDistance}`);

  addRange('Syl', f.minSyllables, f.maxSyllables);
  addRange('Short', f.minShortSyllables, f.maxShortSyllables);
  addRange('Long', f.minLongSyllables, f.maxLongSyllables);
  addRange('Eli', f.minElisionSyllables, f.maxElisionSyllables);

  const minConf = f.minConfidence !== null ? Math.round(f.minConfidence * 100) : null;
  const maxConf = f.maxConfidence !== null ? Math.round(f.maxConfidence * 100) : null;
  const confIsDefault =
    f.minConfidence === this.FILTER_DEFAULTS.minConfidence &&
    f.maxConfidence === this.FILTER_DEFAULTS.maxConfidence;
  if (!confIsDefault) addRange('Conf', minConf, maxConf, '%');

  addRange('Vowels', f.minRepeatedVowelTypes, f.maxRepeatedVowelTypes);

  addRange('Feet', f.minNumFeet, f.maxNumFeet);

  if (f.halfMeters !== this.FILTER_DEFAULTS.halfMeters) {
    if (f.halfMeters === 'only') add('IC only');
    if (f.halfMeters === 'either') add('Either IC');
  }

  if (f.endsInMonosyllableRestriction !== this.FILTER_DEFAULTS.endsInMonosyllableRestriction) {
    if (f.endsInMonosyllableRestriction === 'ends') add('MonoSyl');
    if (f.endsInMonosyllableRestriction === 'does_not_end') add('not MonoSyl');
  }
  return labels;
}

private addFilterRange(
  filters: string[],
  label: string,
  minValue: number | null,
  maxValue: number | null,
  suffix = ''
): void {
  if (minValue !== null && maxValue !== null) {
    filters.push(`${label}: ${minValue}${suffix}–${maxValue}${suffix}`);
  } else if (minValue !== null) {
    filters.push(`${label} ≥ ${minValue}${suffix}`);
  } else if (maxValue !== null) {
    filters.push(`${label} ≤ ${maxValue}${suffix}`);
  }
}

  onSortChange(sortOption: SortOption): void {
  this.sortOption = sortOption;
  this.sortDirection = sortOption === 'confidence' ? 'desc' : 'asc';
  this.sortResults();
}

toggleSortDirection(): void {
  this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
  this.sortResults();
}

private sortResults(): void {
  const direction = this.sortDirection === 'asc' ? 1 : -1;

  this.results.sort((a, b) => {
    let comparison = 0;

    switch (this.sortOption) {
      case 'distance':
        comparison = a.distance - b.distance;
        break;

      case 'confidence':
        comparison = this.getAverageConfidence(a.confidence) - this.getAverageConfidence(b.confidence);
        break;

      case 'syllables':
        comparison = a.syllables.length - b.syllables.length;
        break;

      case 'meter':
        comparison = a.meter.localeCompare(b.meter);
        break;

      case 'position':
      default:
        comparison = a.candidate_id - b.candidate_id;
        break;
    }

    return comparison * direction;
  });

  // [...variable] notation necessary for changing in combination with cdkVirtualFor
  this.results = [...this.results];
}

  setViewState(state: ResultsViewState): void {
    this.viewState = state;
  }

  // Helper function to calculate average confidence of scansions
  private getAverageConfidence(confidences: number[]): number {
  if (!confidences || confidences.length === 0) {
    return 0;
  }

  const total = confidences.reduce((sum, value) => sum + value, 0);
  return total / confidences.length;
}

// Helper to format number to 3 dp
private formatNumber(value: number): string {
  value *= 100;
  return value.toFixed(1) + "%";
}

private getFilename(extension: 'txt' | 'json'): string {
  const timestamp = new Date()
    .toISOString()
    .slice(0, 19)
    .replace('T', '_')
    .replace(/:/g, '-');

  return `results_${timestamp}.${extension}`;
}

private getReadableFilters(): string {
  const f = this.sharedData.currentFilters;

  const halfMetersLabel: Record<string, string> = {
    none: 'No incomplete lines',
    only: 'Only incomplete lines',
    either: 'Both meters and incomplete lines',
  };
  const monosyllableLabel: Record<string, string> = {
    either: 'Both ending and not ending in monosyllable',
    ends: 'Ends in monosyllable',
    does_not_end: "Doesn't end in monosyllable",
  };

  const pct = (v: number | null) => v !== null ? `${this.formatNumber(v)}` : 'No limit';

  return [
    `Meters: ${f.meters.join(', ')}`,
    `Maximum distance: ${f.maxDistance ?? 'No limit'}`,
    `Minimum syllables: ${f.minSyllables ?? 'No limit'}`,
    `Maximum syllables: ${f.maxSyllables ?? 'No limit'}`,
    `Minimum short syllables: ${f.minShortSyllables ?? 'No limit'}`,
    `Maximum short syllables: ${f.maxShortSyllables ?? 'No limit'}`,
    `Minimum long syllables: ${f.minLongSyllables ?? 'No limit'}`,
    `Maximum long syllables: ${f.maxLongSyllables ?? 'No limit'}`,
    `Minimum elision syllables: ${f.minElisionSyllables ?? 'No limit'}`,
    `Maximum elision syllables: ${f.maxElisionSyllables ?? 'No limit'}`,
    `Minimum confidence: ${pct(f.minConfidence)}`,
    `Maximum confidence: ${pct(f.maxConfidence)}`,
    `Minimum repeated vowel types: ${f.minRepeatedVowelTypes ?? 'No limit'}`,
    `Maximum repeated vowel types: ${f.maxRepeatedVowelTypes ?? 'No limit'}`,
    `Minimum feet: ${f.minNumFeet ?? 'No limit'}`,
    `Maximum feet: ${f.maxNumFeet ?? 'No limit'}`,
    `Incomplete lines: ${halfMetersLabel[f.halfMeters] ?? f.halfMeters}`,
    `Ends in monosyllable: ${monosyllableLabel[f.endsInMonosyllableRestriction] ?? f.endsInMonosyllableRestriction}`,
  ].join('\n');
}

  exportJson(): void {
  const exportData = {
    exportedAt: new Date().toISOString(),
    filters: this.sharedData.currentFilters,
    results: this.results.map(result => ({
      ...result,
      averageConfidence: this.getAverageConfidence(result.confidence),
    })),
  };

  this.downloadFile(
    JSON.stringify(exportData, null, 2),
    this.getFilename('json'),
    'application/json'
  );
}

exportTxt(): void {
  const separator = '='.repeat(70);
  const exportedAt = new Date().toLocaleString('en-GB');

  const header = [
    'Search results export',
    separator,
    '',
    'Exported at:',
    exportedAt,
    '',
    'Applied filters:',
    this.getReadableFilters(),
    '',
    `Number of candidates: ${this.results.length}`,
    '',
  ].join('\n');

  const content = this.results
    .map((result, index) => {
      const averageConfidence = this.getAverageConfidence(result.confidence);

      return [
        separator,
        `Candidate ${index + 1}  |  Candidate ID: ${result.candidate_id}`,
        separator,
        '',
        this.buildTextTable(
          ['Field', 'Value'],
          [
            ['Text', result.words.join(' ')],
            ['Meter', result.meter],
            ['Distance', String(result.distance)],
            ['Number of syllables', String(result.syllables.length)],
            ['Average confidence', this.formatNumber(averageConfidence)],
          ]
        ),
        '',
        'Syllable-level analysis:',
        '',
        this.buildTextTable(
          ['#', 'Syllable', 'Scansion', 'Confidence'],
          result.syllables.map((syllable, syllableIndex) => [
            String(syllableIndex + 1),
            syllable,
            result.labels[syllableIndex] ?? '-',
            result.confidence[syllableIndex] !== undefined
              ? this.formatNumber(result.confidence[syllableIndex])
              : '-',
          ])
        ),
      ].join('\n');
    })
    .join('\n\n\n');

  this.downloadFile(
    `${header}\n${content}`,
    this.getFilename('txt'),
    'text/plain'
  );
}

private buildTextTable(headers: string[], rows: string[][]): string {
  const columnWidths = headers.map((header, columnIndex) => {
    const rowWidths = rows.map(row => row[columnIndex]?.length ?? 0);
    return Math.max(header.length, ...rowWidths);
  });

  const separator = `+-${columnWidths
    .map(width => '-'.repeat(width))
    .join('-+-')}-+`;

  const formatRow = (row: string[]): string => {
    return `| ${row
      .map((cell, columnIndex) =>
        (cell ?? '').padEnd(columnWidths[columnIndex])
      )
      .join(' | ')} |`;
  };

  return [
    separator,
    formatRow(headers),
    separator,
    ...rows.map(formatRow),
    separator,
  ].join('\n');
}

private downloadFile(content: string, filename: string, type: string): void {
  const blob = new Blob([content], { type });
  const url = window.URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();

  window.URL.revokeObjectURL(url);
}

get candidateCount(): number {
  return this.results.length;
}

}
