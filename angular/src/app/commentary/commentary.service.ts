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

  public request(doc: any, options?: { highlight?: boolean }): void {
    this.doc.next({ doc, highlight: options?.highlight === true });
  }

  public translate(): void {
    this.translated.next('translation toggle');
  }
}
