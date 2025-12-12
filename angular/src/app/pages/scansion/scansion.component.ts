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
  current_confidence: any

  constructor(
    protected api: ApiService,
    private http: HttpClient,
    private formBuilder: UntypedFormBuilder
  ) {}

  ngOnInit(): void {
    this.http.get<any>('assets/syllable_probabilities.json').subscribe(data => {
      this.neural_data = data;
      console.log(data)
      // No padding please
      this.neural_data = this.neural_data.filter(item => item.syllable !== '@');

      this.neural_data = this.neural_data.map(item => {
        const newItem = {...item};
        if (newItem.prediction === "space") {
          newItem.prediction = "-";
        }
        return newItem;
      });

      console.log(this.neural_data); // Use your data here
    });
  }

  protected show_confidence(obj: any){
    this.current_confidence = obj
    console.log(obj)

    // Extract and sort the confidence values
    const confidences = [
      { key: 'long', value: obj.long * 100 },
      { key: 'short', value: obj.short * 100 },
      { key: 'elision', value: obj.elision * 100 },
      { key: 'space', value: obj.space * 100 },
    ];

    // Sort by value in descending order
    this.current_confidence = confidences.sort((a, b) => b.value - a.value);
    console.log(this.current_confidence)
  }

  public scan_lines(given_line: string) {
    this.api.scan_lines({ "scansion": given_line }).subscribe({
      next: (data) => {
        this.neural_data = data;
        // Remove the padding label
        this.neural_data = this.neural_data.filter(item => item.syllable !== '@');
        // Replace the space label with a dash (looks better on the frontend)
        this.neural_data = this.neural_data.map(item => {
          const newItem = {...item};
          if (newItem.prediction === "space") {
            newItem.prediction = "-";
          }
          return newItem;
        });
        console.log(data);
      },
      error: (err) => this.api.show_server_response(err),
    });
  }
}
