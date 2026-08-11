import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { Result } from '@ludev/components/results-panel/results-panel';
import { Api } from '@ludev/services/api';
import { sanitizeTextInput, sanitizeUpload } from '@ludev/utils/input-sanitizers';
import { SharedData } from '@ludev/services/shared-data';

type SourceMode = 'paste' | 'upload';

@Component({
  selector: 'app-text-input-panel',
  imports: [
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatIconModule,
  ],
  templateUrl: './text-input-panel.html',
  styleUrl: './text-input-panel.scss',
})
export class TextInputPanelComponent implements OnInit, OnDestroy {
  sourceMode: SourceMode = 'paste';
  inputText = '';
  validationError = '';
  isSubmitting = false;
  selectedFileName = '';
  isInvalidFile = false;
  highlightedHtml: SafeHtml = '';
  showHighlight = false;
  private subscriptions = new Subscription();
  @ViewChild('highlightPanelText')
  highlightPanelText?: ElementRef<HTMLDivElement>;

  get characterCount(): number {
    return this.inputText.length;
  }

  constructor(
    private api: Api,
    private sanitizer: DomSanitizer,
    private sharedData: SharedData
  ) {
    this.subscriptions.add(
      this.sharedData.analyze$.subscribe({
        next: (data) => {
          const analyze = data as boolean;
          if (analyze) {
            this.onAnalyze();
          }
        },
        error: (err) => {
          console.error(err.status, err.statusText);
        },
      })
    );
  }

  // get clicked candidate from rc and build highlighted html
  ngOnInit(): void {
    this.subscriptions.add(
      this.api.selectedCandidate$.subscribe((candidate) => {
        if (candidate && this.inputText) {
          this.highlightedHtml = this.highlight(this.inputText, candidate);
          this.showHighlight = true;
          this.scrollToHighlightedCandidate();
        } else {
          this.showHighlight = false;
          this.highlightedHtml = '';
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onBrowseFiles(event: Event): void {
    const target = event.currentTarget as HTMLInputElement;
    const file = target.files?.[0] ?? null;

    this.readUploadedFile(file);
    target.value = '';
  }

  onDragOver(event: Event): void {
    event.preventDefault();
  }

  onDropSuccess(event: DragEvent): void {
    event.preventDefault();
    this.readUploadedFile(event.dataTransfer?.files?.[0] ?? null);
  }

  onTextChange() {
    if (this.selectedFileName) {
      this.selectedFileName = '';
    }
  }

  onClearText(): void {
    this.inputText = '';
    this.validationError = '';
    this.selectedFileName = '';
    this.isInvalidFile = false;
    this.showHighlight = false;
    this.highlightedHtml = '';
  }

  onAnalyze(): void {
    this.showHighlight = false;
    const { sanitizedText, error } = sanitizeTextInput(this.inputText);

    if (error) {
      this.validationError = error;
      return;
    }

    this.inputText = sanitizedText;
    this.validationError = '';
    this.isSubmitting = true;

    this.api.updateState('loading');
    this.sharedData.recordAnalysis();
    this.api.analyze(sanitizedText).subscribe({
      next: (data: Result[]) => {
        this.isSubmitting = false;
        this.api.update(data);
      },
      error: (error) => {
        this.isSubmitting = false;
        this.validationError = 'The analysis request failed. Please try again with a different input.';
        this.api.updateState('error');
        console.error(error.status, error.statusText);
      },
    });
  }

  private readUploadedFile(file: File | null): void {
    const { sanitizedFile, error } = sanitizeUpload(file);

    if (error || !sanitizedFile) {
      this.validationError = error ?? 'Only plain text files (.txt) are supported.';
      this.isInvalidFile = true;
      this.selectedFileName = '';
      return;
    }

    const fileReader = new FileReader();
    fileReader.onload = () => {
      this.inputText = fileReader.result?.toString() ?? '';
      this.selectedFileName = sanitizedFile.name;
      this.validationError = '';
      this.isInvalidFile = false;
      this.sourceMode = 'upload';
    };
    fileReader.onerror = () => {
      this.validationError = 'The selected file could not be read.';
      this.isInvalidFile = true;
      this.selectedFileName = '';
    };
    fileReader.readAsText(sanitizedFile);
  }

  private highlight(fullText: string, candidate: string): SafeHtml {
    const words = candidate.split(' ').map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    // allow punctuation and account for changes from the text preprocessor
    // ie being unable to match
    const pattern = words.join('[\\s\\S]{0,20}?');
    const regex = new RegExp(`(${pattern})`, 'gi');

    const html = fullText.replace(regex, '<mark class="candidate-highlight">$1</mark>');

    // keep whitespace
    return this.sanitizer.bypassSecurityTrustHtml(`<span class="text-preview">${html}</span>`);
  }

  private scrollToHighlightedCandidate(): void {
    setTimeout(() => {
      const container = this.highlightPanelText?.nativeElement;

      if (!container) return;

      const highlightedCandidate = container.querySelector('.candidate-highlight');

      highlightedCandidate?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest',
      });
    });
  }
}
