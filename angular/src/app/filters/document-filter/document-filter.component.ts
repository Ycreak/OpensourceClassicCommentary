import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {ColumnsService} from '@oscc/columns/columns.service';
import {FilterService} from './filter.service';

@Component({
  selector: 'app-document-filter',
  templateUrl: './document-filter.component.html',
  styleUrls: ['./document-filter.component.scss'],
})
export class DocumentFilterComponent {
  private column_id: number;

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    private dialogRef: MatDialogRef<DocumentFilterComponent>, 
    private columns: ColumnsService,
    private filter: FilterService,
  ) {
    this.column_id = data.column_id;
  }

  protected exit(): void {
    this.dialogRef.close();
  }

  protected add_table(): void {
    // We now request the api to add the documents from the table to the column we have been provided
    // The table data contains objects, which we can use as filters for the database.
    const filters = this.filter.dataSource.filteredData;
    if(filters.length){
      //TODO: for now, we need to request every single document from the server.
      // New API update will allow us to request a list of filters
      filters.forEach((doc: any) => {
        this.columns.request(doc, this.column_id, true);
      })
    } 
  }

  protected add_selection(): void {
    // We now request the api to add the selected documents to the column we have been provided
    // The selection contains objects, which we can use as filters for the database.
    const filters = this.filter.selection.selected;
    if(filters.length){
      //TODO: for now, we need to request every single document from the server.
      // New API update will allow us to request a list of filters
      filters.forEach((doc: any) => {
        this.columns.request(doc, this.column_id, true);
      })
    } 
  }

}
