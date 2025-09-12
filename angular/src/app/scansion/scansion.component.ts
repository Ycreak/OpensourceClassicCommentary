import { Component, OnInit } from '@angular/core';

import { ApiService } from '../api.service';

import { UntypedFormBuilder, UntypedFormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NgIf, NgFor } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';

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

  neural_data: object; // object

  constructor(
    protected api: ApiService,
    private formBuilder: UntypedFormBuilder
  ) {}

  ngOnInit(): void {
    console.log('scansion');
  }

  public scan_lines(given_lines: any) {
    this.api.spinner_on();
    this.api.scan_lines({ given_lines }).subscribe({
      next: (data) => {
        this.neural_data = data;
        console.log(data);
        this.api.spinner_off();
      },
      error: (err) => this.api.show_server_response(err),
    });
  }
}
