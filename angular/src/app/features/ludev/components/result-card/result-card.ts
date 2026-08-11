import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Api } from '@ludev/services/api';

@Component({
  selector: 'app-result-card',
  imports: [MatExpansionModule, MatExpansionModule, MatTooltipModule],
  templateUrl: './result-card.html',
  styleUrl: './result-card.scss',
})


export class ResultCardComponent {
  @Input() candidate: string = 'Candidate passage';
  @Input() meter: string = 'Metrical pattern';
  @Input() distance: number = 0;
  @Input({transform: joinArray}) scansion: string = 'Scansion';
  @Input({transform: sumConfidence}) confidence: string = "0.0%";

  @Input() syllables: string[] = [];
  @Input() confidences: number[] = [];
  @Input() labels: string[] = [];

  @Output() candidateClicked = new EventEmitter<string>();

  constructor(private api: Api) {}
  
  // highlight candidate in text when rc is clicked
  isclicked = false;

  onClick(): void {
    if (!this.isclicked) return;
    this.candidateClicked.emit(this.candidate);
    this.api.updateSelectedCandidate(this.candidate);
  }

  // unhighlight candidate when rc is closed
  onClose(): void {
  this.candidateClicked.emit(this.candidate);
  this.api.updateSelectedCandidate("");
  }

  getConfVal(confidence: string): number {
  return parseFloat(confidence);
  }

  get meterLabel(): string {
    return this.meter.replace(/_/g, ' ');
  }
  // can set another dist
  get isDiscarded(): boolean {
  return this.distance > 6;
  }

  // build words from syllables - helps with keeping words seperated but still clear syls for highlighting 
  get syllableWords(): {
  word: string;
  syllables: { text: string; label: string; confidence: string }[];
  }[] {
  const words = this.candidate.split(/\s+/).filter(Boolean);
  const result = [];
  // Latin does not distinguish u/v — normalise both sides before comparing
  const normalizeUV = (s: string) => s.toLowerCase().replace(/u/g, 'v');

  let i = 0;

  for (const word of words) {
    const group = [];
    let built = "";

    while (i < this.syllables.length && built.length < word.length) {
      const syl = this.syllables[i];
      const next = built + syl;

      if (!normalizeUV(word).startsWith(normalizeUV(next))) {
        console.warn(`Syllable mismatch at word "${word}", syllable "${syl}"`);
        break;
      }

      group.push({
        text: syl,
        label: this.labels[i],
        confidence: `${(this.confidences[i] * 100).toFixed(1)}%`,
      });

      built = next;
      i++;
    }

    result.push({ word, syllables: group });
  }

  return result;
  }
}

function sumConfidence(value: Array<number>) {
  if (value.length == 0) {
    console.error("No confidence scores");
    return "0.0%";
  }
  const sum = value.reduce((sum, x) => sum + x, 0);
  return ((sum / value.length) * 100).toFixed(2) + "%";
}

function joinArray(value: Array<string>) {
  if (value.length == 0) {
    console.error("Empty scansion");
    return "";
  }
  return value.join(" ");
}
