import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import { Commentary } from '@oscc/models/Commentary';

@Injectable({
  providedIn: 'root',
})
export class CommentaryService {
  public doc: Subject<any> = new Subject<any>();
  public translated: Subject<any> = new Subject<any>();

  public content: Commentary = new Commentary({});

  constructor() {}

  public request(doc: any): void {
    this.doc.next(doc);
  }

  public translate(): void {
    this.translated.next(!this.translated);
  }
}
