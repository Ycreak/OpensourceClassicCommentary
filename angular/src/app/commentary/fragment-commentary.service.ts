/**
 * Single seam for "open commentary for this Document".
 *
 * Both the playground and the teaching commentary bridge need to make a
 * Document visible in the columns and then request its commentary. This
 * facade owns that columns -> commentary chain so individual callers no
 * longer have to know that ColumnsService and CommentaryService are two
 * separate moving parts.
 */
import { Injectable } from '@angular/core';

import { ColumnsService } from '@oscc/columns/columns.service';
import { CommentaryService } from '@oscc/commentary/commentary.service';

@Injectable({
  providedIn: 'root',
})
export class FragmentCommentaryService {
  constructor(
    private columns: ColumnsService,
    private commentary: CommentaryService
  ) {}

  /**
   * Make `doc` the selected document in the visible columns (if present)
   * and request its commentary. Falls back to the supplied `doc` when no
   * matching column entry is found, mirroring the original inline logic.
   */
  public open(doc: any, options: { highlight?: boolean } = {}): void {
    const selected_column_document = this.columns.select_document(doc);
    this.commentary.request(selected_column_document?.document ?? doc, { highlight: options.highlight === true });
  }
}
