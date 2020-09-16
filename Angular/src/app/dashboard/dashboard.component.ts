import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';

// To allow the use of forms
import { FormBuilder } from '@angular/forms';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  authorsJSON;

  constructor(private api: ApiService) { }

  ngOnInit(): void {
    this.api.GetAuthors().subscribe(data => this.authorsJSON = data);
  }

}
