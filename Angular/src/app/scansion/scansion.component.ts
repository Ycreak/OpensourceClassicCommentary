import { Component, OnInit } from '@angular/core';

import { ApiService } from '../api.service';

import { FormBuilder, FormControl, FormGroup, Validators, FormArray } from '@angular/forms';


@Component({
  selector: 'app-scansion',
  templateUrl: './scansion.component.html',
  styleUrls: ['./scansion.component.scss']
})
export class ScansionComponent implements OnInit {

  // Forms
  line_form: FormGroup = this.formBuilder.group({
    lines: '',
  });

  line_number : number = 1;
  book_number : number = 1;

  spinner : boolean = false;

  neural_data : any = {}; // object

  expected = [];
  predicted = [];
  scores = [];
  syllables = [];
  correct_list = [];
  confidence = [];
  labels_expected = [];
  labels_predicted = [];

  num_cols = 15;

  similarity : number = 0;

  constructor(
    private api: ApiService,
    private formBuilder: FormBuilder,
  ) { }


  ngOnInit(): void {

    // this.RequestEditors(this.currentBook);
    // this.Request_neural_data(this.book_number, this.line_number);
    // this.neural = data.expected;
    // this.predicted = data.predicted;
    // this.similarity = data.similarity;
  }

  public async scan_lines(given_lines){
    console.log(given_lines)
    this.spinner = true;
    this.neural_data = await this.api.scan_given_lines(given_lines);
    this.spinner= false;
    this.syllables = this.neural_data.syllables;
    this.scores = this.neural_data.score;
    this.predicted = this.neural_data.predicted;

    // this.num_cols = this.neural_data.length;

    console.log(this.neural_data)

  }

  public async Request_neural_data(book_number: number, line_number: number){
    // Should be fixed
    this.neural_data = await this.api.Get_neural_data(this.book_number, this.line_number);
    
    this.syllables = this.neural_data.syllables;
    this.expected = this.neural_data.expected;
    // this.predicted = this.neural_data.predicted;
    // this.similarity = this.neural_data.similarity;
    // this.correct_list = this.neural_data.correct_list;
    // this.confidence = this.neural_data.confidence;
    // this.labels_predicted = this.neural_data.labels_predicted;
    // this.labels_expected = this.neural_data.labels_expected;

    // console.log(data);
    // return data
  }

}
