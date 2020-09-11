import { Component } from '@angular/core';
import { ApiService } from './api.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'OpenSourceClassicCommentary';

  constructor(private api: ApiService) {

  }
  ngOnInit(): void {
    this.api.GetBooks('I really dont know any latin book authors except Cicero');
    console.log('This works!');
  }
}
