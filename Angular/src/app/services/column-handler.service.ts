/**
 * This service allows for column manipulation within the document component
 */
import { Injectable } from '@angular/core';

import { Column } from '@oscc/models/Column';
import { Fragment } from '@oscc/models/Fragment';

import { UtilityService } from '@oscc/utility.service';
import { BibliographyHelperService } from '@oscc/services/bibliography-helper.service';

@Injectable({
  providedIn: 'root',
})
export class ColumnHandlerService {
  // We keep track of the number of columns to identify them
  column_identifier = 1;
  // List of connected columns to allow dragging and dropping between columns
  connected_columns_list: string[] = [];

  // Object to store all column data: just an array with column data in the form of document columns
  columns: Column[] = [];

  public playground_id = 0;

  constructor(private bib_helper: BibliographyHelperService, private utility: UtilityService) {}

  /**
   * Colours all document titles black
   * @param column: columns with documents to be painted black
   * @author Ycreak
   */
  public colour_documents_black(column: Column): Column {
    for (const i in column.documents) {
      column.documents[i].colour = 'black';
    }
    return column;
  }

  /**
   * This function adds a new column to the columns array
   * @returns column_id (number)
   * @author Ycreak
   */
  public add_new_column(column_type: string): number {
    //TODO: shall we create a limit? like no more than 25 columns?
    // First, increment the column_identifier to create a new and unique id
    this.column_identifier += 1;
    // Create new column with the appropriate name. TODO: create better identifiers than simple integers
    const new_column = new Column({ column_id: this.column_identifier, type: column_type });
    this.columns.push(new_column);
    // And update the connected columns list
    this.connected_columns_list = this.update_connected_columns_list(this.columns);
    return this.column_identifier;
  }

  /**
   * This function deletes a column from this.columns given its name
   * @param column_id of column that is to be closed
   * @author Ycreak
   */
  public close_column(column_id: number): void {
    const object_index = this.columns.findIndex((object) => {
      return object.column_id === column_id;
    });
    this.columns.splice(object_index, 1);
    // And update the connected columns list
    this.connected_columns_list = this.update_connected_columns_list(this.columns);
  }

  /**
   * This function moves a column inside this.columns to allow the user to move columns
   * around on the frontend.
   * @param column_id of column that is to be moved
   * @param direction of movement
   * @author Ycreak
   */
  public move_column(column_id, direction): void {
    // First get the current index of the column we want to move
    const from_index = this.columns.findIndex((object) => {
      return object.column_id === column_id;
    });
    // Next, generate the new index when the column would be moved
    let to_index = 0;
    if (direction == 'left') {
      to_index = from_index - 1;
    } else {
      to_index = from_index + 1;
    }
    // If this next location is valid, move the column to that location, otherwise do nothing
    if (to_index >= 0 && to_index < this.columns.length) {
      this.columns = this.utility.move_element_in_array(this.columns, from_index, to_index);
    }
  }

  /**
   * We keep track of dragging and dropping within or between columns. If an edit occurs,
   * we set the corresponding document_column boolean 'edited' to true.
   * @param event containing the column identifiers of those that are edited
   * @author Ycreak
   * @TODO: what type is 'event'? CdkDragDrop<string[]> does not allow reading.
   */
  public track_edited_columns(event: any): void {
    // First, find the corresponding columns in this.columns using the column_id that is used
    // in this.connected_columns_list used by cdkDrag (and encoded in event)
    const edited_column_1 = this.columns.find((i) => i.column_id === Number(event.container.id));
    const edited_column_2 = this.columns.find((i) => i.column_id === Number(event.previousContainer.id));
    // Next, set the edited flag to true.
    edited_column_1.edited = true;
    edited_column_2.edited = true;
  }

  /**
   * This function creates a list of connected columns to allow dragging and dropping
   * @author Ycreak
   */
  private update_connected_columns_list(columns: Column[]): string[] {
    const connected_columns_list: string[] = [];
    for (const i of columns) {
      connected_columns_list.push(String(i.column_id));
    }
    return connected_columns_list;
  }

  /**
   * Given the current document, colour the linked documents in the other columns
   * @param document of which the linked documents should be coloured
   * @author Ycreak
   */
  public colour_linked_fragments(document: Fragment): void {
    // Loop through all documents the linked documents
    for (const i in document.linked_fragments) {
      const author = document.linked_fragments[i].author;
      const title = document.linked_fragments[i].title;
      const editor = document.linked_fragments[i].editor;
      const name = document.linked_fragments[i].name;
      // Now, for each document that is linked, try to find it in the other columns
      for (const j in this.columns) {
        // in each column, take a look in the documents array to find the linked document
        const corresponding_document = this.utility.filter_array_on_object(this.columns[j].documents, {
          author: author,
          title: title,
          editor: editor,
          name: name,
        });

        if (corresponding_document?.length) {
          corresponding_document[0].colour = '#FF4081';
        }
      }
      // Do the same for the playground TODO:
      //const corresponding_document = this.playground_handler.playground.documents.find(
      //(i) => i._id === linked_document_id
      //);
      // colour it if found
      //if (corresponding_document) corresponding_document.colour = '#FF4081';
    }
  }

  /**
   * Adds the provided documents to the correct column given its identifier
   * @param column_id (string)
   * @param documents (object[])
   * @param append (boolean, optional) whether to append documents to column or not
   */
  public add_documents_to_column(column_id: number, documents: any[], append?: boolean): void {
    // A new list of fragments has arrived. Use the column identifier to find the corresponding column
    const column = this.columns.find((x) => x.column_id == column_id);
    if (column) {
      if (append) {
        documents.forEach((document: any) => column.documents.push(document));
        //console.log(column.documents, documents)
        //column.documents.push(documents);
      } else {
        column.documents = documents;
      }
      // Store the original order of the fragment names in the column object
      column.original_fragment_order = []; // Clear first
      for (const document of documents) {
        column.original_fragment_order.push(document.name);
      }
      // See if there are any bibliography references in the column. Set the flag accordingly
      let bib_keys: string[] = [];
      documents.forEach((doc: any) => {
        bib_keys = bib_keys.concat(this.bib_helper.retrieve_bib_keys_from_commentary(doc.commentary));
        if (bib_keys.length > 0) {
          return;
        }
      });
      column.has_bibliography = bib_keys.length > 0;
    }
  }
}
