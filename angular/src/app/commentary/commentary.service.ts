import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import { Commentary } from '@oscc/models/Commentary';

@Injectable({
  providedIn: 'root'
})
export class CommentaryService {

  public myVariableChange: Subject<any> = new Subject<any>();
  public doc: Subject<any> = new Subject<any>();
  public myVariable = false;

  public content: Commentary = new Commentary({})

  constructor() { 
  }

  public toggleMyVariable() {
      this.myVariableChange.next(!this.myVariable);
  }

  public request(doc: any): void {
    this.doc.next(doc) 
    //this.content = doc.commentary;
  }
}
