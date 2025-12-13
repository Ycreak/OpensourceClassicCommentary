import { Component, OnInit } from '@angular/core';

import { ApiService } from '@oscc/api.service';

import { UntypedFormBuilder, UntypedFormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NgIf, NgFor } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-scansion',
  templateUrl: './scansion.component.html',
  styleUrls: ['./scansion.component.scss'],
  standalone: true,
  imports: [
    MatToolbarModule,
    MatButtonModule,
    RouterLink,
    NgIf,
    MatProgressBarModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    NgFor,
    MatGridListModule,
  ],
})
export class ScansionComponent implements OnInit {
  // Forms
  line_form: UntypedFormGroup = this.formBuilder.group({
    lines: '',
  });

  spinner = false;

  neural_data: any[]; // object
  current_confidence: any;

  constructor(
    protected api: ApiService,
    private http: HttpClient,
    private formBuilder: UntypedFormBuilder
  ) {}

  ngOnInit(): void {
    this.http.get<any>('assets/syllable_probabilities.json').subscribe((data) => {
      this.neural_data = this.formatScansionFromApi(data);
    });
  }

  protected show_confidence(obj: any) {
    this.current_confidence = obj;
    console.log(obj);

    // Extract and sort the confidence values
    const confidences = [
      { key: 'long', value: obj.long },
      { key: 'short', value: obj.short },
      { key: 'elision', value: obj.elision },
      { key: 'space', value: obj.space },
    ];

    // Sort by value in descending order
    this.current_confidence = confidences.sort((a, b) => b.value - a.value);
    console.log(this.current_confidence);
  }

  public scan_lines(given_line: string) {
    this.api.scan_lines({ scansion: given_line }).subscribe({
      next: (data) => {
        this.neural_data = this.formatScansionFromApi(data);
      },
      error: (err) => this.api.show_server_response(err),
    });
  }

  private formatScansionFromApi(data: any) {
    // Multiply the specified keys by 100
    data.forEach((item: any) => {
      item.long *= 100;
      item.short *= 100;
      item.elision *= 100;
      item.space *= 100;
    });

    // Define symbols for scansions
    const symbols = {
      long: '-',
      short: '⏑',
      space: ' ',
      elision: 'x',
    };
    // Add the symbol for the prediction
    data.forEach((item: any) => {
      item.symbol = symbols[item.prediction];
    });

    // Add the 'confidence' key with the hex color
    data.forEach((item: any) => {
      const predictionKey = item.prediction; // e.g., "long", "short", etc.
      const confidenceValue = item[predictionKey as keyof typeof item]; // Get the value dynamically
      item.confidence = this.confidenceToColor(confidenceValue);
    });

    // Remove the padding label
    data = data.filter((item) => item.syllable !== '@');

    console.log(data);
    return data;
  }

  // Function to convert a value between 50 and 100 to a hex color
  private confidenceToColor(confidence: number): string {
    // Clamp the value between 50 and 100
    confidence = Math.max(50, Math.min(100, confidence));

    // Calculate the ratio between 50 and 100
    const ratio = (confidence - 50) / 50;

    // Interpolate between yellow (50) and green (100)
    const red = Math.floor(255 * (1 - ratio));
    const green = 255;
    const blue = 0;

    // Convert RGB to hex
    return `#${((1 << 24) + (red << 16) + (green << 8) + blue).toString(16).slice(1)}`;
  }
}
