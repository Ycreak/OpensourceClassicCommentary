import { Component, OnInit } from '@angular/core';

import { ApiService } from '../api.service';
import { UtilityService } from '../utility.service';

import { UntypedFormBuilder, FormControl, UntypedFormGroup, Validators, FormArray } from '@angular/forms';

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

  spinner: boolean = false;

  neural_data: object; // object

  constructor(private api: ApiService, private formBuilder: UntypedFormBuilder, public utility: UtilityService) {}

  ngOnInit(): void {}

  public scan_lines(given_lines) {
    this.utility.spinner_on();
    this.api.scan_lines({ given_lines }).subscribe({
      next: (data) => {
        this.neural_data = data;
        console.log(data);
        this.utility.spinner_off();
      },
      error: (err) => this.utility.handle_error_message(err),
    });
  }

  // this.get_authors().subscribe({
  //   next: (data) => {
  //     column.retrieved_authors = data;
  //     this.utility.spinner_off();
  //   },
  //   error: (err) => this.utility.handle_error_message(err)
  // });
}
