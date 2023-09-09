import { Component, OnInit } from '@angular/core';
import { Output, EventEmitter } from '@angular/core';
import { ColumnHandlerService } from '@oscc/services/column-handler.service';
import { ApiService } from '@oscc/api.service';
import { environment } from '@src/environments/environment';

// Service imports
import { UtilityService } from '@oscc/utility.service';
import { SettingsService } from '@oscc/services/settings.service';

// Model imports
import { Fragment } from '@oscc/models/Fragment';
import { Column } from '@oscc/models/Column';
import { DialogService } from '@oscc/services/dialog.service';

@Component({
  selector: 'app-playground',
  templateUrl: './playground.component.html',
  styleUrls: ['./playground.component.scss'],
})
export class PlaygroundComponent implements OnInit {
  @Output() document_clicked = new EventEmitter<Fragment>();
  // Playground column that keeps all data related to said playground
  playground: Column;
  // Boolean to keep track if we are dragging or clicking a fragment within the playground
  playground_dragging: boolean;
  note: any;

  protected single_fragment_requested: boolean;

  constructor(
    protected api: ApiService,
    protected utility: UtilityService,
    protected settings: SettingsService,
    protected column_handler: ColumnHandlerService,
    protected dialog: DialogService
  ) {}

  ngOnInit(): void {
    this.playground = new Column({ column_id: environment.playground_id });
  }

  /**
   * Request the API for documents: add them to the given column
   * @param column_id (number) in which to add the documents
   * @param documents (object[]) which to add to the provided column
   */
  protected request_documents(filter: object): void {
    this.api.get_documents(filter).subscribe((documents) => {
      this.process_incoming_documents(documents);
    });
  }
  /**
   * Request the API for document names: add them to the playground object
   * @param column_id (number) in which to add the documents
   * @param documents (object[]) which to add to the provided column
   */
  protected request_document_names(filter: object): void {
    this.api.get_document_names(filter).subscribe((document_names) => {
      this.playground.fragment_names = document_names;
    });
  }
  /**
   * Processes incoming documents: adds html, sorts documents and puts them in the given column.
   * @param column_id (number) in which to add the documents
   * @param documents (object[]) which to add to the provided column
   * @author Ycreak
   */
  private process_incoming_documents(documents: any[]): void {
    for (const i in documents) {
      documents[i].add_html_to_lines();
    }
    if (this.single_fragment_requested) {
      this.playground.documents.push(documents[0]);
    } else {
      this.playground.documents = documents;
    }
  }
  /**
   * Function to handle what happens when a fragment is selected in HTML.
   * @param fragment selected by the user
   * @author Ycreak
   */
  protected handle_document_click(fragment: Fragment): void {
    // If we are currently dragging a fragment in the playground, we do not want the click even to fire.
    if (!this.playground_dragging) {
      this.document_clicked.emit(fragment);
      // The next part handles the colouring of clicked and referenced fragments.
      // First, restore all fragments to their original black colour when a new fragment is clicked
      for (const index in this.column_handler.columns) {
        this.column_handler.columns[index] = this.column_handler.colour_documents_black(
          this.column_handler.columns[index]
        );
      }
      //TODO:
      this.playground = this.column_handler.colour_documents_black(this.playground);
      // Second, colour the clicked fragment
      fragment.colour = '#3F51B5';
      // Lastly, colour the linked fragments
      // this.colour_linked_fragments(fragment);
    } else {
      // After a drag, make sure to set the dragging boolean on false again
      this.playground_dragging = false;
    }
  }

  /**
   * This function allows the playground to delete notes and fragements
   * @param column column from which the deletion is to take place
   * @param item either a note or a fragment needs deletion
   * @author Ycreak
   */
  public delete_clicked_item_from_playground(column: Column, item: string): void {
    if (item == 'fragment') {
      const object_index = column.documents.findIndex((object) => {
        return object._id === column.clicked_document._id;
      });
      if (object_index != -1) {
        column.documents.splice(object_index, 1);
      }
    } else {
      // it is a note
      const object_index = column.note_array.findIndex((object) => {
        return object === column.clicked_note;
      });
      if (object_index != -1) {
        column.note_array.splice(object_index, 1);
      }
    }
  }

  /**
   * @param column to which the fragment is to be added
   * @author Ycreak
   */
  public add_single_fragment(filter: object): void {
    this.single_fragment_requested = true;
    // format the fragment and push it to the list
    this.request_documents(filter);
  }

  /**
   * @author CptVickers
   */
  protected clear_playground(): void {
    this.dialog.open_confirmation_dialog('Are you sure you want to clear the playground?', '').subscribe({
      next: (res) => {
        if (res) {
          this.playground.documents = [];
          this.playground.note_array = [];
        }
      },
    });
  }
}
