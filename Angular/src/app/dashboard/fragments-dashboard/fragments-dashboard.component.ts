// Library imports
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormArray } from '@angular/forms';
import { Validators } from '@angular/forms';
import { environment } from '@src/environments/environment';

// Component imports
import { ApiService } from '@oscc/api.service';
import { UtilityService } from '@oscc/utility.service';
import { AuthService } from '@oscc/auth/auth.service';
import { DialogService } from '@oscc/services/dialog.service';

// Model imports
import { Fragment } from '@oscc/models/Fragment';
import { Column } from '@oscc/models/Column';

@Component({
  selector: 'app-fragments-dashboard',
  templateUrl: './fragments-dashboard.component.html',
  styleUrls: ['./fragments-dashboard.component.scss'],
})
export class FragmentsDashboardComponent implements OnInit {
  // Fragment referencer variables
  protected referenced_author = '';
  protected referenced_title = '';
  protected referenced_editor = '';
  protected referenced_name = '';

  hide = true; // Whether to hide passwords in the material form fields

  // We only allow the delete fragment button if one is actually selected.
  fragment_selected = false;

  /**
   * This form represents the Fragment class. It is built in stages by all the fragment tabs on the HTML.
   * After all validators, it will be parsed to a Fragment object. It is used in the Dashboard for the creation
   * and revision of fragments.
   */
  fragment_form = new FormGroup({
    _id: new FormControl(''),
    document_type: new FormControl('fragment'),
    name: new FormControl('', [Validators.required, Validators.pattern('[0-9-_ ]*')]), // numbers and "-" and "_" allowed.
    author: new FormControl('', [Validators.required, Validators.pattern('[a-zA-Z ]*')]), // alpha characters allowed
    title: new FormControl('', [Validators.required, Validators.pattern('[a-zA-Z ]*')]), // alpha characters allowed
    editor: new FormControl('', [Validators.required, Validators.pattern('[a-zA-Z ]*')]), // alpha characters allowed
    translation: new FormControl(''),
    differences: new FormControl(''),
    commentary: new FormControl(''),
    apparatus: new FormControl(''),
    metrical_analysis: new FormControl(''),
    reconstruction: new FormControl(''),
    // This array is dynamically filled by the function push_fragment_context_to_fragment_form().
    // It will contain multiple FormGroups per context, containing an author, location and text.
    context: new FormArray([]),
    // This array is dynamically filled by the function push_fragment_line_to_fragment_form().
    // It will contain multiple FormGroups per line, containing a line_number and line_text.
    lines: new FormArray([]),
    linked_fragments: new FormArray([]),
    //status: new FormControl('', Validators.required),
    status: new FormControl(''),
    published: new FormControl(''),
    lock: new FormControl(''),
  });

  // In this object all meta data is stored regarding the currently selected fragment
  selected_fragment_data: Column;
  fragment_referencer: Column;

  constructor(
    protected api: ApiService,
    protected utility: UtilityService,
    protected dialog: DialogService,
    protected auth_service: AuthService
  ) {}

  ngOnInit(): void {
    //if (environment.debug) {
    //this.api.request_documents(255, 'Ennius', 'Thyestes', 'TRF', '112');
    //}

    this.api.request_authors_titles_editors_blob();
    // We will store all dashboard data in the following data object
    this.selected_fragment_data = new Column({
    });
    this.fragment_referencer = new Column({
    });
  }

  /**
   * This function requests a wysiwyg dialog to handle data updating to the fragment_form.
   * It functions by providing the field of fragment_form which is to be updated by the editor.
   * The dialog is called provided the config of the editor and the string to be edited. An edited string
   * is returned by the dialog service
   * @param field from fragment_form which is to be send and updated
   * @author Ycreak
   */
  protected request_wysiwyg_dialog(field: string, index = 0): void {
    if (field == 'context') {
      // For the context, retrieve the context text field from the fragment form and pass that to the dialog
      const form_array_field = this.fragment_form.value.context[index].text;
      this.dialog.open_wysiwyg_dialog(form_array_field).subscribe((result) => {
        if (result) {
          // Result will only be provided when the user has acceped the changes
          // Now update the correct field. This is done by getting the FormArray and patching the correct
          // FormGroup within this array. This is to ensure dynamic updating on the frontend
          const context_array = this.fragment_form.controls['context'] as FormArray;
          context_array.controls[index].patchValue({ ['text']: result });
        }
      });
    } else {
      // The other content fields can be updated by just getting their content strings
      this.dialog.open_wysiwyg_dialog(this.fragment_form.value[field]).subscribe((result) => {
        if (result) {
          this.fragment_form.patchValue({ [field]: result });
        }
      });
    }
  }

  /**
   * Converts the fragment_form (formgroup) to the Fragment object
   * @param fragment_form to be converted
   * @returns object representing a json blob for the server
   * @author Ycreak
   */
  private convert_fragment_form_to_Fragment(fragment_form: FormGroup): Fragment {
    return fragment_form.value;
  }

  /**
   * This function takes the Typescript Fragment object retrieved from the server and uses
   * its data fields to fill in the fragment_form.
   * @param fragment Fragment object that is to be parsed into the fragment_form
   * @author Ycreak
   */
  private convert_Fragment_to_fragment_form(fragment: Fragment): void {
    // This functions updates the fragment_form with the provided fragment
    for (const item of [
      '_id',
      'name',
      'author',
      'title',
      'editor',
      'status',
      'lock',
      'published',
      'witness',
      'text',
      'document_type',
    ]) {
      this.fragment_form.patchValue({ [item]: fragment[item] });
    }
    // Update the fragment form with the commentary of the given fragment
    for (const item of [
      'translation',
      'differences',
      'commentary',
      'apparatus',
      'reconstruction',
      'metrical_analysis',
    ]) {
      this.fragment_form.patchValue({ [item]: fragment.commentary[item] });
    }
    // Fill the fragment context array
    for (const i in fragment.commentary.context) {
      this.push_fragment_context_to_fragment_form(
        fragment.commentary.context[i].author,
        fragment.commentary.context[i].location,
        fragment.commentary.context[i].text
      );
    }
    // Fill the fragment lines array
    for (const i in fragment.lines) {
      this.push_fragment_line_to_fragment_form(fragment.lines[i].line_number, fragment.lines[i].text);
    }
    // Fill the linked fragment array
    for (const i in fragment.linked_fragments) {
      this.push_linked_fragments_to_fragment_form(
        fragment.linked_fragments[i].author,
        fragment.linked_fragments[i].title,
        fragment.linked_fragments[i].editor,
        fragment.linked_fragments[i].name
        //fragment.linked_fragments[i].linked_fragment_id
      );
    }
  }

  /**
   * This function creates a form group containing a single line of a fragment and pushes
   * it to the fragment_form, specifically to the lines FormArray.
   * @param line_number given number of the fragment
   * @param text with string containing the lines content
   * @author Ycreak
   */
  protected push_fragment_line_to_fragment_form(line_number: string, text: string): void {
    // First, create a form group to represent a line
    const new_line = new FormGroup({
      line_number: new FormControl(line_number),
      text: new FormControl(text),
    });
    // Next, push the created form group to the lines FormArray
    const fragment_lines_array = this.fragment_form.get('lines') as FormArray;
    fragment_lines_array.push(new_line);
  }

  /**
   * This function creates a form group containing a single linked fragment and pushes
   * it to the fragment_form, specifically to the linked_fragment FormArray.
   * @param linked_fragment_id given id of the linked fragment
   * @author Ycreak
   */
  private push_linked_fragments_to_fragment_form(
    author: string,
    title: string,
    editor: string,
    name: string
    //linked_fragment_id?: string
  ): void {
    // First, create a form group to represent a line
    const new_linked_fragment = new FormGroup({
      author: new FormControl(author),
      title: new FormControl(title),
      editor: new FormControl(editor),
      name: new FormControl(name),
      //linked_fragment_id: new FormControl(linked_fragment_id),
    });
    // Next, push the created form group to the lines FormArray
    const linked_fragments_array = this.fragment_form.get('linked_fragments') as FormArray;
    linked_fragments_array.push(new_linked_fragment);
  }

  /**
   * This function creates a form group containing a single context of a fragment and pushes
   * it to the fragment_form, specifically to the context FormArray.
   * @param author author of the given context
   * @param location location in which the context appears
   * @param text text of the actual context in which the fragment appears
   * @author Ycreak
   */
  protected push_fragment_context_to_fragment_form(_author: string, _location: string, _text: string): void {
    // First, create a form group to represent a context
    const new_context = new FormGroup({
      author: new FormControl(_author),
      location: new FormControl(_location),
      text: new FormControl(_text),
    });
    // Next, push the created form group to the context FormArray
    const fragment_context_array = this.fragment_form.get('context') as FormArray;
    fragment_context_array.push(new_context);
  }

  /**
   * Pushes the id of the referenced fragment to the Fragment_form
   * @param column Fragment_column object with all necessary data
   * @author Ycreak
   */
  protected add_referenced_fragment_to_Fragment_form(referencer_column: Column): void {
    this.push_linked_fragments_to_fragment_form(
      referencer_column.author,
      referencer_column.title,
      referencer_column.editor,
      referencer_column.name
    );
  }

  /**
   * Function to reset the fragment form
   * @author Ycreak
   */
  protected reset_fragment_form(): void {
    // First, remove all data from the form
    this.fragment_form.reset();
    // Second, remove the previously created FormArray controls and set new ones
    this.fragment_form.setControl('context', new FormArray([]));
    this.fragment_form.setControl('lines', new FormArray([]));
    this.fragment_form.setControl('linked_fragments', new FormArray([]));
  }

  /**
   * Remove an item from a FormArray within a Form
   * @param form_name encapsulating form
   * @param target FormArray from which to delete an item
   * @param index number of the item we want to delete
   * @author Ycreak
   */
  protected remove_form_item_from_form_array(form_name: string, target: string, index: number): void {
    const form_array_in_question = this[form_name].get(target) as FormArray;
    form_array_in_question.removeAt(index);
  }

  //   _____  ______ ____  _    _ ______  _____ _______ _____
  //  |  __ \|  ____/ __ \| |  | |  ____|/ ____|__   __/ ____|
  //  | |__) | |__ | |  | | |  | | |__  | (___    | | | (___
  //  |  _  /|  __|| |  | | |  | |  __|  \___ \   | |  \___ \
  //  | | \ \| |___| |__| | |__| | |____ ____) |  | |  ____) |
  //  |_|  \_\______\___\_\\____/|______|_____/   |_| |_____/
  /**
   * Request the API for document names: add them to the dashboard document object
   * @param column_id (number) in which to add the documents
   * @param documents (object[]) which to add to the provided column
   */
  protected request_document_names(filter: object): void {
    this.api.get_document_names(filter).subscribe((document_names) => {
      this.selected_fragment_data.fragment_names = document_names;
    });
  }
  /**
   * Request the API for documents
   * @param documents (object[]) which to add to the provided column
   */
  protected request_documents(filter: object): void {
    this.api.get_documents(filter).subscribe((documents) => {
      this.reset_fragment_form();
      this.convert_Fragment_to_fragment_form(documents[0]);
      // Set the data for the drop down menus
      this.selected_fragment_data.author = this.fragment_form.value.author;
      this.selected_fragment_data.title = this.fragment_form.value.title;
      this.selected_fragment_data.editor = this.fragment_form.value.editor;
      this.selected_fragment_data.name = this.fragment_form.value.name;
    });
  }

  /**
   * This function requests the api to revise the fragment given the fragment_form.
   * @param fragment_form which represents a Fragment, edited by the user in the dashboard
   * @author Ycreak
   */
  protected request_revise_fragment(fragment_form: FormGroup): void {
    // If the fragment is locked and the user is not a teacher, we will not allow this operation.
    if (fragment_form.value.lock == 'locked' && this.auth_service.current_user_role != 'teacher') {
      this.utility.open_snackbar('This fragment is locked.');
    } else {
      const item_string =
        fragment_form.value.author +
        ', ' +
        fragment_form.value.title +
        ', ' +
        fragment_form.value.editor +
        ': ' +
        fragment_form.value.name;

      this.dialog
        .open_confirmation_dialog('Are you sure you want to SAVE CHANGES to this fragment?', item_string)
        .subscribe((result) => {
          if (result) {
            const fragment = this.convert_fragment_form_to_Fragment(fragment_form);
            //FIXME:
            this.api.revise_fragment(fragment);
            this.fragment_selected = true;
            this.reset_fragment_form();
            // It might be possible we have created a new author, title or editor. Retrieve the lists again
            // TODO: retrieve author-title-editor blob
          }
        });
    }
  }

  /**
   * Given the fragment_form which represents a Fragment, this function requests the api to create a
   * new fragment.
   * @param fragment_form which represents a Fragment, edited by the user in the dashboard
   * @author Ycreak
   */
  protected request_create_fragment(fragment_form: FormGroup): void {
    const item_string =
      fragment_form.value.author +
      ', ' +
      fragment_form.value.title +
      ', ' +
      fragment_form.value.editor +
      ': ' +
      fragment_form.value.name;

    this.dialog
      .open_confirmation_dialog('Are you sure you want to CREATE this fragment?', item_string)
      .subscribe((result) => {
        if (result) {
          const fragment = this.convert_fragment_form_to_Fragment(fragment_form);
          this.api.create_fragment(fragment);
          this.fragment_selected = true;
          this.reset_fragment_form();
          // It might be possible we have created a new author, title or editor. Retrieve the lists again
          // TODO: retrieve author-title-editor blob
        }
      });
  }

  /**
   * Given the fragment_form which represents a Fragment, this function requests the api to delete the
   * selected fragment. This is done via its id.
   * @param fragment_form which represents a Fragment, edited by the user in the dashboard
   * @author Ycreak
   */
  protected request_delete_fragment(fragment_form: FormGroup): void {
    const item_string =
      fragment_form.value.author +
      ', ' +
      fragment_form.value.title +
      ', ' +
      fragment_form.value.editor +
      ': ' +
      fragment_form.value.name;

    this.dialog
      .open_confirmation_dialog('Are you sure you want to DELETE this fragment?', item_string)
      .subscribe((result) => {
        if (result) {
          const fragment = this.convert_fragment_form_to_Fragment(fragment_form);
          this.reset_fragment_form();
          this.api.delete_fragment({
            document_type: 'fragment',
            author: fragment.author,
            title: fragment.title,
            editor: fragment.editor,
            name: fragment.name,
          });
          this.fragment_selected = false;
        }
      });
  }

  /**
   * This function requests the server to link all similar fragments from a given author and title.
   * Linking between authors or titles is only possible manually. Linking is based on similarity and
   * done via the fuzzywuzzy library. See the function within the server for more information.
   * @param column with all necessary data
   * @author CptVickers Ycreak
   */
  protected request_automatic_fragment_linker(column: Column): void {
    this.api.spinner_on();

    const item_string = column.selected_fragment_author + ', ' + column.selected_fragment_title;
    const api_data = new Fragment({});
    api_data.author = column.selected_fragment_author;
    api_data.title = column.selected_fragment_title;

    this.dialog
      .open_confirmation_dialog('Are you sure you want to LINK fragments from this text?', item_string)
      .subscribe((result) => {
        if (result) {
          this.api.automatic_fragment_linker(api_data).subscribe({
            next: (res) => {
              this.api.handle_error_message(res);
              this.api.spinner_off();
            },
            error: (err) => {
              this.api.handle_error_message(err);
            },
          });
        }
      });
  }
}
