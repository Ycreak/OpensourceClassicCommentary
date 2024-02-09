/**
 * This component visualises the fragments in a table for easy filtering and selecting
 * @author Ycreak
 */

import { AfterViewInit, Component, ViewChild, Output, EventEmitter } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';

// Service imports
import { ApiService } from '@oscc/api.service';
import { UtilityService } from '@oscc/utility.service';

@Component({
  selector: 'app-fragment-table',
  templateUrl: './fragment-table.component.html',
  styleUrl: './fragment-table.component.scss',
})
export class FragmentTableComponent implements AfterViewInit {
  @Output() collection = new EventEmitter<any>();

  displayedColumns: string[] = ['select', 'author', 'title', 'editor', 'name'];
  dataSource: MatTableDataSource<any>;
  selection = new SelectionModel<any>(true, []);

  protected _author: string;
  protected _title: string;
  protected _editor: string;
  
  protected _authors: string[];
  protected _titles: string[];
  protected _editors: string[];

  protected master_index: any[] = [];
  protected local_index: any[] = [];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(protected api: ApiService, protected utility: UtilityService) {
    // Create a master index we use as a read only truth, and a local index which we will use to save the filtering of
    // the master index to.
    this.master_index = this.api.author_title_editor_blob;
    this.local_index = this.api.author_title_editor_blob;

    this._authors = [...new Set(this.master_index.map(element => element.author))];
    this._titles = [...new Set(this.master_index.map(element => element.title))];
    this._editors = [...new Set(this.master_index.map(element => element.editor))];
    // Assign the data to the data source for the table to render
    this.dataSource = new MatTableDataSource(this.master_index);
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  test() {
    console.log(this._author);
  }

  /**
   * Filters the fragment index on its meta data fields
   * @author Ycreak
   */
  protected filter_index() {
    const filter = {};

    if(this._author) {
      filter['author'] = this._author;
    }
    if(this._title) {
      filter['title'] = this._title;
    }
    if(this._editor) {
      filter['editor'] = this._editor;
    }

    this.local_index = this.utility.filter_array(this.master_index, filter)

    this._authors = [...new Set(this.local_index.map(element => element.author))];
    this._titles = [...new Set(this.local_index.map(element => element.title))];
    this._editors = [...new Set(this.local_index.map(element => element.editor))];
    
    this.dataSource = new MatTableDataSource(this.local_index);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  protected apply_filter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  /** Whether the number of selected elements matches the total number of rows. */
  protected isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  protected toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }
    this.selection.select(...this.dataSource.filteredData);
  }

  /** The label for the checkbox on the passed row */
  protected checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }
}
