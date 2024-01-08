import { Component, OnInit } from '@angular/core';

import { ApiService } from '../api.service';

import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';

@Component({
  selector: 'app-scansion',
  templateUrl: './scansion.component.html',
  styleUrls: ['./scansion.component.scss'],
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
      error: (err) => this.api.handle_error_message(err),
    });
  }
}
