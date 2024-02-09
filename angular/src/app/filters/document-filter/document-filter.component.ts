/**
 * Handles the advanced document filtering dialog. It allows all types of documents to be filtered. Closing the
 * dialog sends a list of filters back to the server.
 * @author Ycreak
 */
import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

// Services imports
import { FilterService } from './filter.service';

@Component({
  selector: 'app-document-filter',
  templateUrl: './document-filter.component.html',
  styleUrls: ['./document-filter.component.scss'],
})
export class DocumentFilterComponent {
  constructor(
    private dialogRef: MatDialogRef<DocumentFilterComponent>,
    private filter: FilterService
  ) {}

  protected exit(): void {
    this.dialogRef.close();
  }

  /**
   * Closes the dialog with a list of filters from the entire current table view
   * @author Ycreak
   */
  protected add_table(): void {
    const filters = this.filter.dataSource.filteredData;
    this.dialogRef.close(filters);
  }

  /**
   * Closes the dialog with a list of filters from the current table selection
   * @author Ycreak
   */
  protected add_selection(): void {
    const filters = this.filter.selection.selected;
    this.dialogRef.close(filters);
  }
}
