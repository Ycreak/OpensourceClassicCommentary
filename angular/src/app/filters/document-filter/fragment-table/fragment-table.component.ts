/**
 * This component visualises the fragments in a table for easy filtering and selecting
 * @author Ycreak
 */

import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { SelectionModel } from '@angular/cdk/collections';
import { MatCheckboxModule } from '@angular/material/checkbox';

// Service imports
import { ApiService } from '@oscc/api.service';

@Component({
  selector: 'app-fragment-table',
  templateUrl: './fragment-table.component.html',
  styleUrl: './fragment-table.component.scss',
})
export class FragmentTableComponent implements AfterViewInit {
  displayedColumns: string[] = ['select', 'author', 'title', 'editor', 'name'];
  dataSource: MatTableDataSource<any>;
  selection = new SelectionModel<any>(true, []);

  private filter = { author: '', title: '' };

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(protected api: ApiService) {
    console.log(this.api.author_title_editor_blob);
    console.log(this.api.get_author_list());
    // Assign the data to the data source for the table to render
    //this.dataSource = new MatTableDataSource([]);
    this.dataSource = new MatTableDataSource(this.api.author_title_editor_blob);
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  test() {
    console.log(this.selection);
  }

  applyFilter(event: Event, key: string) {
    const filterValue = (event.target as HTMLInputElement).value;

    //let filter = {
    //author: filterValue.trim().toLowerCase(),
    //title: ''
    //}

    //this.filter[] = filterValue;

    //this.dataSource.filter = JSON.stringify(filter)
    this.dataSource.filter = filterValue.trim().toLowerCase();

    //console.log(this.filter)

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.dataSource.filteredData);
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }
}
