/**
 * Handles the advanced document filtering dialog. It allows all types of documents to be filtered. Closing the
 * dialog sends a list of filters back to the server.
 * @author Ycreak
 */
import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatTabChangeEvent } from '@angular/material/tabs';
// Services imports
import { FilterService } from './filter.service';

@Component({
  selector: 'app-document-filter',
  templateUrl: './document-filter.component.html',
  styleUrls: ['./document-filter.component.scss'],
})
export class DocumentFilterComponent {
  private current_tab: string = 'fragments';

  constructor(
    private dialogRef: MatDialogRef<DocumentFilterComponent>,
    private filter: FilterService
  ) {}

  /**
   * Keeps track on the currently opened tab
   * @param event
   * @author Ycreak
   */
  protected on_tab_change(event: MatTabChangeEvent): void {
    this.current_tab = event.tab.textLabel.toLowerCase();
  }

  protected exit(): void {
    this.dialogRef.close();
  }

  /**
   * Closes the dialog with a list of filters from the entire current table view
   * @author Ycreak
   */
  protected add_table(): void {
    this.dialogRef.close({
      endpoint: this.current_tab,
      filters: this.filter.data[this.current_tab].dataSource.filteredData,
    });
  }

  /**
   * Closes the dialog with a list of filters from the current table selection
   * @author Ycreak
   */
  protected add_selection(): void {
    this.dialogRef.close({
      endpoint: this.current_tab,
      filters: this.filter.data[this.current_tab].selection.selected,
    });
  }
}
