/**
 * This component visualises the testimonia in a table for easy filtering and selecting
 * @author Ycreak
 */

import { AfterViewInit, Component, ViewChild, Output, EventEmitter } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

// Service imports
import { TestimoniaApiService } from '@oscc/services/api/testimonia.service';
import { UtilityService } from '@oscc/utility.service';
import { FilterService } from '../filter.service';

@Component({
  selector: 'app-testimonia-table',
  templateUrl: './testimonia-table.component.html',
  styleUrl: './testimonia-table.component.scss',
})
export class TestimoniaTableComponent implements AfterViewInit {
  @Output() collection = new EventEmitter<any>();

  displayedColumns: string[] = ['select', 'author', 'name'];

  protected _author: string;
  protected _title: string;
  protected _editor: string;
  protected _name: string;

  protected _authors: string[];
  protected _titles: string[];
  protected _names: string[];

  protected master_index: any[] = [];
  protected local_index: any[] = [];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    protected api: TestimoniaApiService,
    protected filter: FilterService,
    protected utility: UtilityService
  ) {
    // Initialise the dataSource
    this.filter.data.testimonia.dataSource = new MatTableDataSource([]);
    // Then request the source from the api
    this.api.request_index().subscribe(() => {
      // Create a master index we use as a read only truth, and a local index which we will use to save the filtering of
      // the master index to.
      this.master_index = this.api.testimonia_index;
      this.local_index = this.api.testimonia_index;

      this._authors = [...new Set(this.master_index.map((element) => element.author))];
      this._names = [...new Set(this.master_index.map((element) => element.name))];
      // Assign the data to the data source for the table to render
      this.filter.data.testimonia.dataSource = new MatTableDataSource(this.master_index);
    });
  }

  ngAfterViewInit() {
    this.filter.data.testimonia.dataSource.paginator = this.paginator;
    this.filter.data.testimonia.dataSource.sort = this.sort;
  }

  /**
   * Filters the fragment index on its meta data fields
   * @author Ycreak
   */
  protected filter_index() {
    const filter = {};

    if (this._author) {
      filter['author'] = this._author;
    }
    if (this._name) {
      filter['name'] = this._name;
    }

    this.local_index = this.utility.filter_array(this.master_index, filter);

    this._authors = [...new Set(this.local_index.map((element) => element.author))];
    this._names = [...new Set(this.local_index.map((element) => element.name))];

    this.filter.data.testimonia.dataSource = new MatTableDataSource(this.local_index);
    this.filter.data.testimonia.dataSource.paginator = this.paginator;
    this.filter.data.testimonia.dataSource.sort = this.sort;
  }

  /** Applies the given filter to the table. */
  protected apply_filter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.filter.data.testimonia.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.filter.data.testimonia.dataSource.paginator) {
      this.filter.data.testimonia.dataSource.paginator.firstPage();
    }
  }

  /** Whether the number of selected elements matches the total number of rows. */
  protected isAllSelected() {
    const numSelected = this.filter.data.testimonia.selection.selected.length;
    const numRows = this.filter.data.testimonia.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  protected toggleAllRows() {
    if (this.isAllSelected()) {
      this.filter.data.testimonia.selection.clear();
      return;
    }
    this.filter.data.testimonia.selection.select(...this.filter.data.testimonia.dataSource.filteredData);
  }

  /** The label for the checkbox on the passed row */
  protected checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.filter.data.testimonia.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }
}
