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
  /** We save each data source in this service for easy requesting from the dialog */
  public data: any = {};

  constructor() {}

  /**
   * Empties the data object
   * @author Ycreak
   */
  public init(): void {
    this.data = {
      fragments: {
        selection: new SelectionModel<any>(true, []),
        dataSource: MatTableDataSource<any>,
      },
      testimonia: {
        selection: new SelectionModel<any>(true, []),
        dataSource: MatTableDataSource<any>,
      },
      texts: {
        selection: new SelectionModel<any>(true, []),
        dataSource: MatTableDataSource<any>,
      },
    };
  }
}
