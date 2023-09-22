import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { ApiService } from '@oscc/api.service';
import { AuthService } from '@oscc/auth/auth.service';
import { DialogService } from '@oscc/services/dialog.service';

import { ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-bibliography',
  templateUrl: './bibliography.component.html',
  styleUrls: ['./bibliography.component.scss'],
})
export class BibliographyComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  table_columns: string[] = ['name', 'title', 'date'];
  table_data: MatTableDataSource<any>;
  table_source_data: any[];

  private bib_subscription: any;
  protected pages: string;

  constructor(
    protected auth_service: AuthService,
    protected api: ApiService,
    protected dialog: DialogService
  ) {
    this.table_data = new MatTableDataSource(this.table_source_data);
  }

  /**
   * On Init, we just load the list of authors. From here, selection is started
   */
  ngOnInit(): void {
    // Sort bib on lastname
    this.api.bibliography.sort((a, b) =>
      a.creators[0].lastname > b.creators[0].lastname ? 1 : b.creators[0].lastname > a.creators[0].lastname ? -1 : 0
    );
    this.fill_table(this.api.bibliography);
  }

  ngAfterViewInit(): void {
    // Sort and paginator prefer an init AfterViewInit
    this.table_data.paginator = this.paginator;
    this.table_data.sort = this.sort;
  }

  ngOnDestroy(): void {
    if (this.bib_subscription) {
      this.bib_subscription.unsubscribe();
    }
  }

  protected get_bib_key(key: string, pages: string): string {
    if (pages) {
      return `[bib-${key}-${pages}]`;
    } else {
      return `[bib-${key}]`;
    }
  }

  /**
   * Function to fill the specimens table with data
   * @param data received from the API
   * @author Ycreak
   */
  private fill_table(bib: any) {
    this.table_data.paginator = this.paginator;
    this.table_data.sort = this.sort;
    this.table_source_data = [];

    for (const i in bib) {
      // Create an object for the table with the specific fields we need
      const table_object: any = {
        name: `${bib[i].creators[0].lastname}, ${bib[i].creators[0].firstname}`,
        title: bib[i].title,
        date: bib[i].date,
        key: bib[i].key,
      };
      this.table_source_data.push(table_object);
    }
    this.table_data = new MatTableDataSource(this.table_source_data);
    this.table_data.paginator = this.paginator;
    this.table_data.sort = this.sort;
  }

  /**
   * Applies the sorting and filtering of the given table. Handles pagination if necessary.
   * @param event handles the filtering if provided
   * @param table that needs to be sorted/filtered
   * @author Ycreak
   */
  public apply_sort_filter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.table_data.filter = filterValue.trim().toLowerCase();
    if (this.table_data.paginator) {
      this.table_data.paginator.firstPage();
    }
  }
}
