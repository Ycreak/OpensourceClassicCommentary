/**
 * This service allows for column manipulation within the fragment component
 */
import { Injectable } from '@angular/core';

import { Column } from '../../models/Column';
import { ApiService } from '../../api.service';

import { UtilityService } from '../../utility.service';

@Injectable({
  providedIn: 'root'
})
export class ColumnHandlerService {

  // We keep track of the number of columns to identify them
  column_identifier: number = 1;
  // List of connected columns to allow dragging and dropping between columns
  connected_columns_list: string[] = [];

  // Object to store all column data: just an array with column data in the form of fragment columns
  columns: Column[] = [];

  constructor(
    private api : ApiService,
    private utility : UtilityService,
  ) { }

  /**
   * Colours all fragment titles black
   * @param column: columns with fragments to be painted black
   * @author Ycreak
   */
  public colour_fragments_black(column): Column {
    for(let i in column.fragments){
      column.fragments[i].colour = 'black';
    }
    return column
  }

  /**
   * This function adds a new column to the columns array
   * @author Ycreak
   */
  public add_new_column(): void {
    //TODO: shall we create a limit? like no more than 25 columns?
    // First, increment the column_identifier to create a new and unique id
    this.column_identifier += 1;
    // Create new column with the appropriate name. TODO: create better identifiers than simple integers
    let new_column = new Column( { column_id : String( this.column_identifier ) } );
    this.columns.push(new_column)    
    // Request authors for this new column
    this.api.request_authors(new_column);
    // And update the connected columns list
    this.connected_columns_list = this.update_connected_columns_list(this.columns)
  }

  /**
   * This function deletes a column from this.columns given its name
   * @param column_id of column that is to be closed
   * @author Ycreak
   */
  public close_column(column_id : string): void {
    const object_index = this.columns.findIndex(object => {
      return object.column_id === column_id;
    });    
    this.columns.splice(object_index, 1);
    // And update the connected columns list
    this.connected_columns_list = this.update_connected_columns_list(this.columns)
  }
  
  /**
   * This function moves a column inside this.columns to allow the user to move columns
   * around on the frontend.
   * @param column_id of column that is to be moved
   * @param direction of movement
   * @author Ycreak
   */
  private move_column(column_id, direction): void{
    // First get the current index of the column we want to move
    const from_index = this.columns.findIndex(object => {
      return object.column_id === column_id;
    });
    // Next, generate the new index when the column would be moved
    let to_index = 0;
    if(direction == 'left'){
      to_index = from_index - 1;
    }
    else{
      to_index = from_index + 1;
    }
    // If this next location is valid, move the column to that location, otherwise do nothing
    if (to_index >= 0 && to_index < this.columns.length){
      this.columns = this.utility.move_element_in_array(this.columns, from_index, to_index)
    }
  }

  /**
   * We keep track of dragging and dropping within or between columns. If an edit occurs,
   * we set the corresponding fragment_column boolean 'edited' to true.
   * @param event containing the column identifiers of those that are edited
   * @author Ycreak
   * @TODO: what type is 'event'? CdkDragDrop<string[]> does not allow reading.
   */
  private track_edited_columns(event: any): void {    
    // First, find the corresponding columns in this.columns using the column_id that is used
    // in this.connected_columns_list used by cdkDrag (and encoded in event)
    let edited_column_1 = this.columns.find(i => i.column_id === event.container.id);
    let edited_column_2 = this.columns.find(i => i.column_id === event.previousContainer.id);
    // Next, set the edited flag to true.
    edited_column_1.edited = true;
    edited_column_2.edited = true;
  }

  /**
   * This function creates a list of connected columns to allow dragging and dropping
   * @author Ycreak
   */
  private update_connected_columns_list(columns : Column[]): string[] {
    let connected_columns_list : string[] = [];
    for (let i of columns) {
      connected_columns_list.push(String(i.column_id));
    };
    return connected_columns_list
  }
  


}
