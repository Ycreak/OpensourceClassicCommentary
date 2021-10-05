import { Component, OnInit } from '@angular/core';

import { ApiService } from '../api.service';



@Component({
  selector: 'app-scansion',
  templateUrl: './scansion.component.html',
  styleUrls: ['./scansion.component.scss']
})
export class ScansionComponent implements OnInit {

  line_number : number = 1;
  book_number : number = 1;

  neural_data : any = {}; // object

  expected = [];
  predicted = [];
  syllables = [];
  correct_list = [];
  confidence = [];
  labels_expected = [];
  labels_predicted = [];

  similarity : number = 0;

  constructor(
    private api: ApiService,

  ) { }


  ngOnInit(): void {

    // this.RequestEditors(this.currentBook);
    this.Request_neural_data(this.book_number, this.line_number);
    // this.neural = data.expected;
    // this.predicted = data.predicted;
    // this.similarity = data.similarity;
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
