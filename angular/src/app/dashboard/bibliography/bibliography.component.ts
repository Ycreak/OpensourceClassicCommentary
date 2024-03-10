import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';

import { ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

// Services imports
import { AuthService } from '@oscc/auth/auth.service';
import { BibliographyService } from '@oscc/services/bibliography.service';
import { DialogService } from '@oscc/services/dialog.service';

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
    private bib: BibliographyService,
    protected auth_service: AuthService,
    protected dialog: DialogService
  ) {
    this.table_data = new MatTableDataSource(this.table_source_data);
  }

  /**
   * On Init, we just load the list of authors. From here, selection is started
   */
  ngOnInit(): void {
    // Sort bib on lastname: FIXME: bibliography has faulty entries
    //this.bib.bibliography.sort((a, b) =>
    //a.creators[0].lastname > b.creators[0].lastname ? 1 : b.creators[0].lastname > a.creators[0].lastname ? -1 : 0
    //);
    this.fill_table(this.bib.bibliography);
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

  /**
   * Generates the bib key from the clicked table row
   * @param key (string)
   * @param author (string)
   * @param date (string)
   * @param pages (string)
   * @return bib_key (string)
   * @author Ycreak
   */
  protected get_bib_key(key: string, author: string, date: string, pages: string): string {
    if (pages) {
      return `[bib-${key}-${author}-${date}-${pages}]`;
    } else {
      return `[bib-${key}-${author}-${date}]`;
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
      let name = 'invalid';
      let lastname = 'invalid';

      try {
        name = `${bib[i].creators[0].lastname}, ${bib[i].creators[0].firstname}`;
        lastname = `${bib[i].creators[0].lastname}`;
      } catch (e) {
        console.error('Faulty bib entry:', bib[i]);
      }

      // Create an object for the table with the specific fields we need
      const table_object: any = {
        name: name,
        lastname: lastname,
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
