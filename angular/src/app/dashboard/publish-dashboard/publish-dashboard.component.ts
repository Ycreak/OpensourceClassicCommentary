/**
 * This component shows which fragments are published and which are not. Allows to easily toggle and update in bulk.
 */
import { AfterViewInit, Component, ViewChild, OnInit } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { NgFor, NgIf } from '@angular/common';
import { MatOptionModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

import { ApiService } from '@oscc/api.service';
import { UtilityService } from '@oscc/utility.service';
import { Fragment } from '@oscc/models/Fragment';

@Component({
  selector: 'app-publish-dashboard',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    MatOptionModule,
    NgFor,
    NgIf,
    MatInputModule,
    MatTableModule,
    MatSortModule,
    MatCheckboxModule,
    MatPaginatorModule,
    MatButtonModule,
  ],
  templateUrl: './publish-dashboard.component.html',
  styleUrl: './publish-dashboard.component.scss',
})
export class PublishDashboardComponent implements OnInit, AfterViewInit {
  protected fragments: Fragment[] = [];
  protected displayedColumns: string[] = ['visible', 'author', 'title', 'editor', 'name'];
  protected dataSource: MatTableDataSource<Fragment> = new MatTableDataSource<Fragment>([]);
  protected toggledRows: Fragment[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    protected api: ApiService,
    protected utility: UtilityService
  ) {}

  ngOnInit(): void {
    // Request all fragments within our sandbox.
    this.api.request_documents({ document_type: 'fragment' }).subscribe((fragments: Fragment[]) => {
      this.dataSource.data = fragments;
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  protected applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  /**
   * Toggles the fragment's visiblity.
   * @param fragment (Fragment)
   */
  protected toggleVisible(fragment: Fragment) {
    // Toggle the visible value
    fragment.visible = fragment.visible === 1 ? 0 : 1;
    // Add to toggledRows if not already present
    if (!this.toggledRows.some((row) => row.name === fragment.name)) {
      this.toggledRows.push(fragment);
    }
  }

  /**
   * Write the update changes to the database.
   */
  protected update_toggled_fragments() {
    this.toggledRows.forEach((fragment: Fragment) => {
      this.api.post_document(fragment, 'update').subscribe();
    });
  }
}
