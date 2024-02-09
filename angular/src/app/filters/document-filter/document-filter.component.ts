import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {FilterService} from './filter.service';

@Component({
  selector: 'app-document-filter',
  templateUrl: './document-filter.component.html',
  styleUrls: ['./document-filter.component.scss'],
})
export class DocumentFilterComponent {
  private column_id: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<DocumentFilterComponent>, 
    private filter: FilterService
  ) {
    this.column_id = data.column_id;
  }

  protected exit(): void {
    this.dialogRef.close();
  }

  protected add_table(): void {
    // We now request the api to add the selected documents to the column we have been provided
    this.dialogRef.close(this.filter.dataSource.filteredData);
  }

  protected add_selection(): void {
    // We now request the api to add the selected documents to the column we have been provided
    this.dialogRef.close(this.filter.selection.selected);
  }

}
