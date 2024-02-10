/**
 * This service allows for column manipulation within the document component
 */
import { Injectable } from '@angular/core';

import { Column } from '@oscc/models/Column';
import { Fragment } from '@oscc/models/Fragment';

// Service imports
import { ApiService } from '@oscc/api.service';
import { BibliographyService } from '@oscc/services/bibliography.service';
import { UtilityService } from '@oscc/utility.service';

@Injectable({
  providedIn: 'root',
})
export class ColumnsService {
  // We keep track of the number of columns to identify them
  column_identifier = 1;
  // List of connected columns to allow dragging and dropping between columns
  connected: string[] = [];
  // Object to store all column data: just an array with column data in the form of document columns
  list: Column[] = [];
  public current: Column = new Column({});

  constructor(
    private api: ApiService,
    private bib: BibliographyService,
    private utility: UtilityService
  ) {}

  /**
   * This function adds a new column to the columns array
   * @returns column_id (number)
   * @author Ycreak
   */
  public add(): number {
    // First, increment the column_identifier to create a new and unique id
    this.column_identifier += 1;
    // Create new column with the appropriate name.
    const new_column = new Column({ column_id: this.column_identifier });
    this.list.push(new_column);
    // And update the connected columns list
    this.connected = this.connect(this.list);
    return this.column_identifier;
  }

  /**
   * This function deletes a column from this.list given its name
   * @param column_id of column that is to be closed
   * @author Ycreak
   */
  public close(column_id: number): void {
    const object_index = this.list.findIndex((object) => {
      return object.column_id === column_id;
    });
    this.list.splice(object_index, 1);
    // And update the connected columns list
    this.connected = this.connect(this.list);
  }

  /**
   * This function moves a column inside this.list to allow the user to move columns
   * around on the frontend.
   * @param column_id of column that is to be moved
   * @param direction of movement
   * @author Ycreak
   */
  public move(column_id: number, direction: string): void {
    // First get the current index of the column we want to move
    const from_index = this.list.findIndex((object) => {
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
    if (to_index >= 0 && to_index < this.list.length) {
      this.list = this.utility.move_element_in_array(this.list, from_index, to_index);
    }
  }

  /**
   * This function creates a list of connected columns to allow dragging and dropping
   * @author Ycreak
   */
  private connect(columns: Column[]): string[] {
    const connected: string[] = [];
    for (const i of columns) {
      connected.push(String(i.column_id));
    }
    return connected;
  }

  /**
   * Colours all document titles black
   * @param column: columns with documents to be painted black
   * @author Ycreak
   */
  public blacken(column: Column): void {
    column.documents.forEach((doc: any) => {
      doc.colour = 'black';
    });
  }

  /**
   * Returns the column given its id
   * @param id (number)
   * @returns Column
   * @author Ycreak
   */
  public find(id: number): Column {
    return this.list.find((x) => x.column_id == id);
  }

  /**
   * Request the API for documents: add them to the given column
   * @param filter (object) on which to filter the database
   * @param column_id (number) in which to add the documents
   * @param append (boolean) whether we append documents or replace
   * @author Ycreak
   */
  public request(filter: object, column_id: number, append?: boolean): void {
    this.api.get_documents(filter).subscribe((documents) => {
      const column = column_id ? this.find(column_id) : this.find(this.add());
      // Format all documents to look nice on the frontend (little HTML, some beautiful CSS)
      documents = this.format(documents);
      // Add the documents to the column
      if (append) {
        documents.forEach((document: any) => column.documents.push(document));
      } else {
        column.documents = documents;
      }
      this.current = column;
      // Check if the column has bibliography keys. If so, we can show the option to create a bibliography
      column.has_bibliography = this.bib.check_documents_bibliography(column.documents);
      // Store the original order of the fragment names in the column object
      column.original_fragment_order = []; // Clear first
      documents.forEach((doc: any) => {
        column.original_fragment_order.push(doc.name);
      });
    });
  }

  /**
   * Formats incoming documents: adds html, sorts documents.
   * @param column_id (number) in which to add the documents
   * @param documents (object[]) which to add to the provided column
   * @returns documents (object[]) nicely formatted
   * @author Ycreak
   */
  private format(documents: any[]): any[] {
    documents.forEach((doc: any) => {
      if (doc) {
        if (doc.document_type == 'fragment') {
          doc.add_html_to_lines();
        }
      }
    });
    // Prepare the documents for publication
    documents = this.sort(documents);
    return documents;
  }

  /**
   * Sorts the given object of documents on status. We want to display Certa, followed
   * by Incerta and Adespota.
   * @param documents
   * @returns documents in the order we want
   * @author Ycreak
   */
  public sort(documents: any[]): any[] {
    documents = documents.sort(this.utility.sort_fragment_array_numerically);
    const normal = this.utility.filter_object_on_key(documents, 'status', 'Certum');
    const incerta = this.utility.filter_object_on_key(documents, 'status', 'Incertum');
    const adesp = this.utility.filter_object_on_key(documents, 'status', 'Adesp.');
    // Put testimonia at the end
    const testimonia = this.utility.filter_object_on_key(documents, 'document_type', 'testimonium');
    // Concatenate in the order we want
    documents = normal.concat(incerta).concat(adesp).concat(testimonia);

    return documents;
  }

  /**
   * We keep track of dragging and dropping within or between columns. If an edit occurs,
   * we set the corresponding document_column boolean 'edited' to true.
   * @param event containing the column identifiers of those that are edited
   * @author Ycreak
   * @TODO: what type is 'event'? CdkDragDrop<string[]> does not allow reading.
   */
  public set_edited_flag(event: any): void {
    // First, find the corresponding columns in this.list using the column_id that is used
    // in this.connected used by cdkDrag (and encoded in event)
    const edited_column_1 = this.list.find((i) => i.column_id === Number(event.container.id));
    const edited_column_2 = this.list.find((i) => i.column_id === Number(event.previousContainer.id));
    // Next, set the edited flag to true.
    edited_column_1.edited = true;
    edited_column_2.edited = true;
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
      for (const j in this.list) {
        // in each column, take a look in the documents array to find the linked document
        const corresponding_document = this.utility.filter_array_on_object(this.list[j].documents, {
          author: author,
          title: title,
          editor: editor,
          name: name,
        });
        if (corresponding_document?.length) {
          corresponding_document[0].colour = '#FF4081';
        }
      }
    }
  }
}
