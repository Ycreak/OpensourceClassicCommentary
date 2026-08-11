import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { SharedData } from '@ludev/services/shared-data';

const ALL_METER_VALUES = [
  'hexameter',
  'pentameter',
  'hendecasyllable',
  'iambic_trimeter',
  'iambic_senarius',
  'iambic_septenarius',
  'iambic_octonarius',
  'trochaic_septenarius',
  'trochaic_octonarius',
];

const DEFAULT_MAX_DISTANCE = 2;
const DEFAULT_MIN_SYLLABLES = 11;
const DEFAULT_MAX_SYLLABLES = 18;

type HalfMeterFilter = 'only' | 'none' | 'either';
type MonosyllableFilter = 'ends' | 'does_not_end' | 'either';

type NumericFilterField =
  | 'maxDistance'
  | 'minSyllables'
  | 'maxSyllables'
  | 'minShortSyllables'
  | 'maxShortSyllables'
  | 'minLongSyllables'
  | 'maxLongSyllables'
  | 'minElisionSyllables'
  | 'maxElisionSyllables'
  | 'minConfidencePct'
  | 'maxConfidencePct'
  | 'minRepeatedVowelTypes'
  | 'maxRepeatedVowelTypes'
  | 'minNumFeet'
  | 'maxNumFeet';

type NumericInputValue = string | number | null;

interface NumericLimits {
  min: number;
  max?: number;
}

interface AppliedFilters {
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
  halfMeters: HalfMeterFilter;
  minNumFeet: number | null;
  maxNumFeet: number | null;
  endsInMonosyllableRestriction: MonosyllableFilter;
}

@Component({
  selector: 'app-filters-panel',
  standalone: true,
  imports: [
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
  ],
  templateUrl: './filters-panel.html',
  styleUrl: './filters-panel.scss',
})
export class FiltersPanelComponent {
  selectedMeters: string[] = [...ALL_METER_VALUES];

  // Keep this default value aligned with the threshold in backend/pipeline_service.py.
  maxDistance: NumericInputValue = String(DEFAULT_MAX_DISTANCE);
  minSyllables: NumericInputValue = String(DEFAULT_MIN_SYLLABLES);
  maxSyllables: NumericInputValue = String(DEFAULT_MAX_SYLLABLES);
  minShortSyllables: NumericInputValue = '';
  maxShortSyllables: NumericInputValue = '';
  minLongSyllables: NumericInputValue = '';
  maxLongSyllables: NumericInputValue = '';
  minElisionSyllables: NumericInputValue = '';
  maxElisionSyllables: NumericInputValue = '';
  // Stored as integers 0-100 in the UI, converted to 0.0-1.0 on apply.
  minConfidencePct: NumericInputValue = '85';
  maxConfidencePct: NumericInputValue = '100';
  minRepeatedVowelTypes: NumericInputValue = '';
  maxRepeatedVowelTypes: NumericInputValue = '';
  halfMeters: HalfMeterFilter = 'none';
  minNumFeet: NumericInputValue = '';
  maxNumFeet: NumericInputValue = '';
  endsInMonosyllableRestriction: MonosyllableFilter = 'either';

  filtersApplied: boolean = false;

  readonly allMeters = [
    { value: 'hexameter', label: 'Hexameter' },
    { value: 'pentameter', label: 'Pentameter' },
    { value: 'hendecasyllable', label: 'Hendecasyllable' },
    { value: 'iambic_trimeter', label: 'Iambic trimeter' },
    { value: 'iambic_senarius', label: 'Iambic senarius' },
    { value: 'iambic_septenarius', label: 'Iambic septenarius' },
    { value: 'iambic_octonarius', label: 'Iambic octonarius' },
    { value: 'trochaic_septenarius', label: 'Trochaic septenarius' },
    { value: 'trochaic_octonarius', label: 'Trochaic octonarius' },
  ];

  readonly halfMetersOptions = [
    { value: 'none', label: 'No incomplete lines' },
    { value: 'only', label: 'Only incomplete lines' },
    { value: 'either', label: 'Both meters and incomplete lines' },
  ];

  readonly monosyllableOptions = [
    { value: 'either', label: 'Both ending and not ending in monosyllable' },
    { value: 'ends', label: 'Ends in monosyllable' },
    { value: 'does_not_end', label: "Doesn't end in monosyllable" },
  ];

  private readonly integerPattern = /^\d+$/;

  private readonly numericLimits: Record<NumericFilterField, NumericLimits> = {
    maxDistance: { min: 0 },
    minSyllables: { min: 1 },
    maxSyllables: { min: 1 },
    minShortSyllables: { min: 0 },
    maxShortSyllables: { min: 0 },
    minLongSyllables: { min: 0 },
    maxLongSyllables: { min: 0 },
    minElisionSyllables: { min: 0 },
    maxElisionSyllables: { min: 0 },
    minConfidencePct: { min: 0, max: 100 },
    maxConfidencePct: { min: 0, max: 100 },
    minRepeatedVowelTypes: { min: 0 },
    maxRepeatedVowelTypes: { min: 0 },
    minNumFeet: { min: 1 },
    maxNumFeet: { min: 1 },
  };

  private rawNumericInputErrors: Partial<Record<NumericFilterField, boolean>> = {};

  constructor(private sharedData: SharedData) {}

  onNumericInput(field: NumericFilterField, event: Event): void {
    const input = event.target as HTMLInputElement;
    const rawValue = input.value.trim();

    this.rawNumericInputErrors[field] =
      input.validity.badInput || (rawValue !== '' && !this.integerPattern.test(rawValue));
  }

  private clearRawNumericInputError(field: NumericFilterField): void {
    delete this.rawNumericInputErrors[field];
  }

  private clearAllRawNumericInputErrors(): void {
    this.rawNumericInputErrors = {};
  }

  private getNumericValue(field: NumericFilterField): string {
    const value = this[field];

    if (value === null || value === undefined) {
      return '';
    }

    return String(value).trim();
  }

  private hasInvalidNumericValue(field: NumericFilterField): boolean {
    if (this.rawNumericInputErrors[field]) {
      return true;
    }

    const value = this.getNumericValue(field);

    if (value === '') {
      return false;
    }

    if (!this.integerPattern.test(value)) {
      return true;
    }

    const numericValue = Number(value);
    const limits = this.numericLimits[field];

    return numericValue < limits.min || (limits.max !== undefined && numericValue > limits.max);
  }

  private parseNumericValue(field: NumericFilterField): number | null {
    if (this.hasInvalidNumericValue(field)) {
      return null;
    }

    const value = this.getNumericValue(field);
    return value === '' ? null : Number(value);
  }

  private isInvalidRange(minField: NumericFilterField, maxField: NumericFilterField): boolean {
    if (this.hasInvalidNumericValue(minField) || this.hasInvalidNumericValue(maxField)) {
      return false;
    }

    const min = this.parseNumericValue(minField);
    const max = this.parseNumericValue(maxField);

    return min !== null && max !== null && min > max;
  }

  get hasNoSelectedMeters(): boolean {
    return this.selectedMeters.length === 0;
  }

  get hasInvalidMaxDistanceValue(): boolean {
    return this.hasInvalidNumericValue('maxDistance');
  }

  get hasInvalidSyllableValue(): boolean {
    return this.hasInvalidNumericValue('minSyllables') || this.hasInvalidNumericValue('maxSyllables');
  }

  get hasInvalidShortSyllableValue(): boolean {
    return this.hasInvalidNumericValue('minShortSyllables') || this.hasInvalidNumericValue('maxShortSyllables');
  }

  get hasInvalidLongSyllableValue(): boolean {
    return this.hasInvalidNumericValue('minLongSyllables') || this.hasInvalidNumericValue('maxLongSyllables');
  }

  get hasInvalidElisionSyllableValue(): boolean {
    return this.hasInvalidNumericValue('minElisionSyllables') || this.hasInvalidNumericValue('maxElisionSyllables');
  }

  get hasInvalidConfidenceValue(): boolean {
    return this.hasInvalidNumericValue('minConfidencePct') || this.hasInvalidNumericValue('maxConfidencePct');
  }

  get hasInvalidRepeatedVowelValue(): boolean {
    return this.hasInvalidNumericValue('minRepeatedVowelTypes') || this.hasInvalidNumericValue('maxRepeatedVowelTypes');
  }

  get hasInvalidNumFeetValue(): boolean {
    return this.hasInvalidNumericValue('minNumFeet') || this.hasInvalidNumericValue('maxNumFeet');
  }

  get hasInvalidSyllableRange(): boolean {
    return this.isInvalidRange('minSyllables', 'maxSyllables');
  }

  get hasInvalidShortSyllableRange(): boolean {
    return this.isInvalidRange('minShortSyllables', 'maxShortSyllables');
  }

  get hasInvalidLongSyllableRange(): boolean {
    return this.isInvalidRange('minLongSyllables', 'maxLongSyllables');
  }

  get hasInvalidElisionSyllableRange(): boolean {
    return this.isInvalidRange('minElisionSyllables', 'maxElisionSyllables');
  }

  get hasInvalidConfidenceRange(): boolean {
    return this.isInvalidRange('minConfidencePct', 'maxConfidencePct');
  }

  get hasInvalidRepeatedVowelRange(): boolean {
    return this.isInvalidRange('minRepeatedVowelTypes', 'maxRepeatedVowelTypes');
  }

  get hasInvalidNumFeetRange(): boolean {
    return this.isInvalidRange('minNumFeet', 'maxNumFeet');
  }

  get hasAnyInvalidFilter(): boolean {
    return (
      this.hasNoSelectedMeters ||
      this.hasInvalidMaxDistanceValue ||
      this.hasInvalidSyllableValue ||
      this.hasInvalidShortSyllableValue ||
      this.hasInvalidLongSyllableValue ||
      this.hasInvalidElisionSyllableValue ||
      this.hasInvalidConfidenceValue ||
      this.hasInvalidRepeatedVowelValue ||
      this.hasInvalidNumFeetValue ||
      this.hasInvalidSyllableRange ||
      this.hasInvalidShortSyllableRange ||
      this.hasInvalidLongSyllableRange ||
      this.hasInvalidElisionSyllableRange ||
      this.hasInvalidConfidenceRange ||
      this.hasInvalidRepeatedVowelRange ||
      this.hasInvalidNumFeetRange
    );
  }

  private formatList(items: string[]): string {
    if (items.length === 1) return items[0];
    if (items.length === 2) return `${items[0]} and ${items[1]}`;
    return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
  }

  private buildAppliedFilters(): AppliedFilters {
    const minConfidencePct = this.parseNumericValue('minConfidencePct');
    const maxConfidencePct = this.parseNumericValue('maxConfidencePct');

    return {
      meters: [...this.selectedMeters],
      maxDistance: this.parseNumericValue('maxDistance'),
      minSyllables: this.parseNumericValue('minSyllables'),
      maxSyllables: this.parseNumericValue('maxSyllables'),
      minShortSyllables: this.parseNumericValue('minShortSyllables'),
      maxShortSyllables: this.parseNumericValue('maxShortSyllables'),
      minLongSyllables: this.parseNumericValue('minLongSyllables'),
      maxLongSyllables: this.parseNumericValue('maxLongSyllables'),
      minElisionSyllables: this.parseNumericValue('minElisionSyllables'),
      maxElisionSyllables: this.parseNumericValue('maxElisionSyllables'),
      minConfidence: minConfidencePct !== null ? minConfidencePct / 100 : null,
      maxConfidence: maxConfidencePct !== null ? maxConfidencePct / 100 : null,
      minRepeatedVowelTypes: this.parseNumericValue('minRepeatedVowelTypes'),
      maxRepeatedVowelTypes: this.parseNumericValue('maxRepeatedVowelTypes'),
      halfMeters: this.halfMeters,
      minNumFeet: this.parseNumericValue('minNumFeet'),
      maxNumFeet: this.parseNumericValue('maxNumFeet'),
      endsInMonosyllableRestriction: this.endsInMonosyllableRestriction,
    };
  }

  private isMinFilterMorePermissive(current: number | null, last: number | null): boolean {
    if (current === null) return last !== null;
    if (last === null) return false;
    return current < last;
  }

  private isMaxFilterMorePermissive(current: number | null, last: number | null): boolean {
    if (current === null) return last !== null;
    if (last === null) return false;
    return current > last;
  }

  private getHalfMeterResultTypes(value: HalfMeterFilter): string[] {
    if (value === 'none') return ['full'];
    if (value === 'only') return ['half'];
    return ['full', 'half'];
  }

  private hasUnloadedHalfMeterResults(current: HalfMeterFilter, last: HalfMeterFilter): boolean {
    const lastResultTypes = this.getHalfMeterResultTypes(last);
    return this.getHalfMeterResultTypes(current).some((resultType) => !lastResultTypes.includes(resultType));
  }

  private getPreApiChangesRequiringReanalysis(filters: AppliedFilters): string[] {
    const last = this.sharedData.lastAnalyzedFilters;

    if (!last) {
      return [];
    }

    const changed: string[] = [];
    const lastMeters = last.meters ?? [];

    // Re-analyze only when the current filters ask for results not loaded by the last API call.
    if (filters.meters.some((meter) => !lastMeters.includes(meter))) {
      changed.push('Meters');
    }

    const loadedMaxDistance = Math.max(DEFAULT_MAX_DISTANCE, last.maxDistance ?? DEFAULT_MAX_DISTANCE);

    if (filters.maxDistance !== null && filters.maxDistance > loadedMaxDistance) {
      changed.push('Maximum distance');
    }

    if (this.hasUnloadedHalfMeterResults(filters.halfMeters, (last.halfMeters ?? 'none') as HalfMeterFilter)) {
      changed.push('Incomplete lines');
    }

    if (this.isMinFilterMorePermissive(filters.minSyllables, last.minSyllables ?? null)) {
      changed.push('Min syllables');
    }

    if (this.isMaxFilterMorePermissive(filters.maxSyllables, last.maxSyllables ?? null)) {
      changed.push('Max syllables');
    }

    if (this.isMinFilterMorePermissive(filters.minNumFeet, last.minNumFeet ?? null)) {
      changed.push('Min feet');
    }

    if (this.isMaxFilterMorePermissive(filters.maxNumFeet, last.maxNumFeet ?? null)) {
      changed.push('Max feet');
    }

    return changed;
  }

  get reanalyzeWarning(): string | null {
    if (this.hasAnyInvalidFilter) {
      return null;
    }

    const changed = this.getPreApiChangesRequiringReanalysis(this.buildAppliedFilters());

    return changed.length > 0
      ? `Pressing Apply will re-analyze the text because ${this.formatList(changed)} changed.`
      : null;
  }

  private isNumericFilterField(field: string): field is NumericFilterField {
    return field in this.numericLimits;
  }

  toggleMeter(value: string, checked: boolean): void {
    if (checked) {
      if (!this.selectedMeters.includes(value)) {
        this.selectedMeters = [...this.selectedMeters, value];
      }
    } else {
      this.selectedMeters = this.selectedMeters.filter((m) => m !== value);
    }
  }

  resetFilter(field: string): void {
    if (this.isNumericFilterField(field)) {
      this.clearRawNumericInputError(field);
    }

    switch (field) {
      case 'selectedMeters':
        this.selectedMeters = [...ALL_METER_VALUES];
        break;
      case 'maxDistance':
        this.maxDistance = String(DEFAULT_MAX_DISTANCE);
        break;
      case 'minSyllables':
        this.minSyllables = String(DEFAULT_MIN_SYLLABLES);
        break;
      case 'maxSyllables':
        this.maxSyllables = String(DEFAULT_MAX_SYLLABLES);
        break;
      case 'minShortSyllables':
        this.minShortSyllables = '';
        break;
      case 'maxShortSyllables':
        this.maxShortSyllables = '';
        break;
      case 'minLongSyllables':
        this.minLongSyllables = '';
        break;
      case 'maxLongSyllables':
        this.maxLongSyllables = '';
        break;
      case 'minElisionSyllables':
        this.minElisionSyllables = '';
        break;
      case 'maxElisionSyllables':
        this.maxElisionSyllables = '';
        break;
      case 'minConfidencePct':
        this.minConfidencePct = '85';
        break;
      case 'maxConfidencePct':
        this.maxConfidencePct = '100';
        break;
      case 'minRepeatedVowelTypes':
        this.minRepeatedVowelTypes = '';
        break;
      case 'maxRepeatedVowelTypes':
        this.maxRepeatedVowelTypes = '';
        break;
      case 'halfMeters':
        this.halfMeters = 'none';
        break;
      case 'minNumFeet':
        this.minNumFeet = '';
        break;
      case 'maxNumFeet':
        this.maxNumFeet = '';
        break;
      case 'endsInMonosyllableRestriction':
        this.endsInMonosyllableRestriction = 'either';
        break;
    }
  }

  onReset(): void {
    this.clearAllRawNumericInputErrors();
    this.filtersApplied = false;
    this.selectedMeters = [...ALL_METER_VALUES];
    this.maxDistance = String(DEFAULT_MAX_DISTANCE);
    this.minSyllables = String(DEFAULT_MIN_SYLLABLES);
    this.maxSyllables = String(DEFAULT_MAX_SYLLABLES);
    this.minShortSyllables = '';
    this.maxShortSyllables = '';
    this.minLongSyllables = '';
    this.maxLongSyllables = '';
    this.minElisionSyllables = '';
    this.maxElisionSyllables = '';
    this.minConfidencePct = '85';
    this.maxConfidencePct = '100';
    this.minRepeatedVowelTypes = '';
    this.maxRepeatedVowelTypes = '';
    this.halfMeters = 'none';
    this.minNumFeet = '';
    this.maxNumFeet = '';
    this.endsInMonosyllableRestriction = 'either';

    this.sharedData.setFilters({
      meters: [...ALL_METER_VALUES],
      maxDistance: DEFAULT_MAX_DISTANCE,
      minSyllables: DEFAULT_MIN_SYLLABLES,
      maxSyllables: DEFAULT_MAX_SYLLABLES,
      minShortSyllables: null,
      maxShortSyllables: null,
      minLongSyllables: null,
      maxLongSyllables: null,
      minElisionSyllables: null,
      maxElisionSyllables: null,
      minConfidence: null,
      maxConfidence: null,
      minRepeatedVowelTypes: null,
      maxRepeatedVowelTypes: null,
      halfMeters: 'none',
      minNumFeet: null,
      maxNumFeet: null,
      endsInMonosyllableRestriction: 'either',
    });
  }

  onApply(): void {
    if (this.hasAnyInvalidFilter) {
      return;
    }

    const filters = this.buildAppliedFilters();
    const shouldReanalyze = this.getPreApiChangesRequiringReanalysis(filters).length > 0;

    this.sharedData.setFilters(filters);

    if (shouldReanalyze) {
      this.sharedData.runOnAnalyze();
    }

    this.filtersApplied = true;

    // remove the filters applied message after 2 seconds
    setTimeout(() => {
      this.filtersApplied = false;
    }, 2000);
  }
}
