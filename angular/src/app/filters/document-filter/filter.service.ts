/**
 * This service allows easy communication between the different filters within the advanced document filter.
 * For example, the Fragments table can communicate its selection to this service. Upon adding a selection in
 * the document filter, it will read this service for the filter to send to the api. This could also be done using
 * parent/child communication, but a little service is quicker and more elegant.
 * @author Ycreak
 */

import { Injectable } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTableDataSource } from '@angular/material/table';

@Injectable({
  providedIn: 'root',
})
export class FilterService {
  // Keeps track of the selection made in a table
  public selection = new SelectionModel<any>(true, []);
  // Keeps track of the entire table (including its filtering)
  public dataSource: MatTableDataSource<any>;

  constructor() {}
}
