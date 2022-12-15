// Library imports
import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { FormControl, FormGroup, FormArray } from '@angular/forms';
import { Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { ElementRef } from '@angular/core';
import { environment } from '@src/environments/environment';

// Component imports
import { ApiService } from '@oscc/api.service';
import { UtilityService } from '@oscc/utility.service';
import { AuthService } from '@oscc/auth/auth.service';
import { DialogService } from '@oscc/services/dialog.service';

// Model imports
import { Fragment } from '@oscc/models/Fragment';
import { Column } from '@oscc/models/Column';
import { User } from '@oscc/models/User';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  animations: [
    // For the User table
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
    trigger('fadeSlideInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('500ms', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
      transition(':leave', [animate('500ms', style({ opacity: 0, transform: 'translateY(10px)' }))]),
    ]),
  ],
})
export class DashboardComponent implements OnInit, OnDestroy, AfterViewInit {
  // For the user table
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) matSort: MatSort;
  private table_sort: any;
  @ViewChild(MatSort) set content(content: Element) {
    this.table_sort = content;
    if (this.table_sort) {
      this.user_table_users.sort = this.table_sort;
    }
  }

  // Fragment referencer variables
  protected referenced_author = '';
  protected referenced_title = '';
  protected referenced_editor = '';
  protected referenced_name = '';

  private fragment_names_subscription: any;
  private fragments_subscription: any;

  hide = true; // Whether to hide passwords in the material form fields

  // We only allow the delete fragment button if one is actually selected.
  fragment_selected = false;

  // User table specific variables
  user_table_columns_to_display: string[] = ['username', 'role'];
  user_table_users: MatTableDataSource<User>;
  user_table_columns_to_displayWithExpand = [...this.user_table_columns_to_display, 'expand'];
  user_table_expanded_element: string | null;

  // List with users shown in the Table
  retrieved_users: User[];

  /**
   * This form represents the Fragment class. It is built in stages by all the fragment tabs on the HTML.
   * After all validators, it will be parsed to a Fragment object. It is used in the Dashboard for the creation
   * and revision of fragments.
   */
  fragment_form = new FormGroup({
    _id: new FormControl(''),
    name: new FormControl('', [Validators.required, Validators.pattern('[0-9-_ ]*')]), // numbers and "-" and "_" allowed.
    author: new FormControl('', [Validators.required, Validators.pattern('[a-zA-Z ]*')]), // alpha characters allowed
    title: new FormControl('', [Validators.required, Validators.pattern('[a-zA-Z ]*')]), // alpha characters allowed
    editor: new FormControl('', [Validators.required, Validators.pattern('[a-zA-Z ]*')]), // alpha characters allowed
    translation: new FormControl(''),
    differences: new FormControl(''),
    commentary: new FormControl(''),
    apparatus: new FormControl(''),
    reconstruction: new FormControl(''),
    // This array is dynamically filled by the function push_fragment_context_to_fragment_form().
    // It will contain multiple FormGroups per context, containing an author, location and text.
    context: new FormArray([]),
    // This array is dynamically filled by the function push_fragment_line_to_fragment_form().
    // It will contain multiple FormGroups per line, containing a line_number and line_text.
    lines: new FormArray([]),
    linked_fragments: new FormArray([]),
    status: new FormControl('', Validators.required),
    published: new FormControl(''),
    lock: new FormControl(''),
  });

  /**
   * This form is used to change the introduction texts for authors and authors+titles
   */
   author_title_introduction_form = new FormGroup({
    author: new FormControl('', [
      Validators.required,
      Validators.pattern('[a-zA-Z ]*')
    ]), // alpha characters allowed
    title: new FormControl('', [
      Validators.required,
      Validators.pattern('[a-zA-Z ]*')
    ]), // alpha characters allowed
    author_introduction: new FormControl(''),
    title_introduction: new FormControl(''),
  });

  /**
   * This form is used to change the password of the selected user.
   * After all validators, it will be parsed to a User object.
   */
  change_password_form = new FormGroup({
    password1: new FormControl('', [Validators.required, Validators.pattern('[a-zA-Z0-9-_]*')]),
    password2: new FormControl('', [Validators.required, Validators.pattern('[a-zA-Z0-9-_]*')]),
  });

  /**
   * This form is used to change the password of the selected user.
   * After all validators, it will be parsed to a User object.
   */
  create_new_user_form = new FormGroup({
    new_user: new FormControl('', [Validators.required, Validators.pattern('[a-zA-Z0-9-_]*')]),
    new_password: new FormControl('', [Validators.required, Validators.pattern('[a-zA-Z0-9-_]*')]),
  });

  table_data_loaded = false; // Returns true if the table has loaded its data
  loading_hint: Observable<unknown>; // Loading hint animation

  // In this object all meta data is stored regarding the currently selected fragment
  selected_fragment_data: Column;
  fragment_referencer: Column;
  selected_introduction_data: Column;

  constructor(
    protected api: ApiService,
    protected utility: UtilityService,
    protected dialog: DialogService,
    protected auth_service: AuthService
  ) {
    // Assign the data to the data source for the table to render
    this.user_table_users = new MatTableDataSource(this.retrieved_users);
  }

  ngOnInit(): void {
    this.loading_hint = this.utility.get_loading_hint(); // Initialize the loading hint
    this.api.request_authors_titles_editors_blob();
    this.request_users();

    // We will store all dashboard data in the following data object
    this.selected_fragment_data = new Column({
      column_id: environment.dashboard_id,
    });
    this.fragment_referencer = new Column({
      column_id: environment.referencer_id,
    });
    this.selected_introduction_data = new Column({
      column_id: 1,  // TODO: This needs to have a certain value, but I'm not sure what.     
    });
  }

  // initiate the table sorting and paginator
  ngAfterViewInit(): void {
    this.user_table_users.paginator = this.paginator;
    this.user_table_users.sort = this.matSort;
    this.expand_user_table_row();

    /** Handle what happens when new fragment names arrive */
    this.fragment_names_subscription = this.api.new_fragment_names_alert.subscribe((column_id) => {
      if (column_id == environment.dashboard_id) {
        this.selected_fragment_data.fragment_names = this.api.fragment_names;
      } else if (column_id == environment.referencer_id) {
        this.fragment_referencer.fragment_names = this.api.fragment_names;
      }
    });

    /** Handle what happens when new fragments arrive */
    this.fragments_subscription = this.api.new_fragments_alert.subscribe((column_id) => {
      if (column_id == environment.dashboard_id) {
        this.convert_Fragment_to_fragment_form(this.api.fragments[0]);
        // Set the data for the drop down menus
        this.selected_fragment_data.author = this.fragment_form.value.author;
        this.selected_fragment_data.title = this.fragment_form.value.title;
        this.selected_fragment_data.editor = this.fragment_form.value.editor;
        this.selected_fragment_data.name = this.fragment_form.value.name;
      }
    });
  }

  ngOnDestroy() {
    this.fragments_subscription.unsubscribe();
    this.fragment_names_subscription.unsubscribe();
  }

  /**
   * Simple test function, can be used for whatever
   * @param thing item to be printed
   * @author Ycreak
   */
  public test(thing): void {
    console.log(this.retrieved_users, thing);
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
    }
    else if (field == 'author_introduction' || field == 'title_introduction') {
      const text = this.author_title_introduction_form.value[field];
      this.dialog.open_wysiwyg_dialog(text).subscribe(result => {
        if (result){ // Pass the accepted changes to the regular form field. 
          this.author_title_introduction_form.patchValue({[field]: result});
        }
      })
    }
    else{ // The other content fields can be updated by just getting their content strings
      this.dialog.open_wysiwyg_dialog(this.fragment_form.value[field]).subscribe((result) => {
        if (result) {
          this.update_form_field('fragment_form', field, result);
        }
      });
    }
  }

  /**
   * Converts the fragment_form (formgroup) to the Fragment object
   * @param fragment_form to be converted
   * @returns Fragment object
   * @author Ycreak
   */
  private convert_fragment_form_to_Fragment(fragment_form: FormGroup): Fragment {
    const new_fragment = new Fragment({});
    new_fragment.set_fragment(fragment_form.value);
    return new_fragment;
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
      'translation',
      'differences',
      'commentary',
      'apparatus',
      'reconstruction',
      'status',
      'lock',
      'published',
    ]) {
      this.update_form_field('fragment_form', item, fragment[item]);
    }

    // Fill the fragment context array
    for (const i in fragment.context) {
      this.push_fragment_context_to_fragment_form(
        fragment.context[i].author,
        fragment.context[i].location,
        fragment.context[i].text
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
   * Function to allow the User table to be filtered indifferently of field
   * @param event that triggered the filtering process
   * @author Ycreak
   */
  protected apply_user_table_filter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.user_table_users.filter = filterValue.trim().toLowerCase();

    if (this.user_table_users.paginator) {
      this.user_table_users.paginator.firstPage();
    }
  }

  /**
   * Function to allow sorting of the User table
   * @param sort object that carries the sorting instructions provided by the Sort event
   * @author CptVickers
   */
  protected sort_user_table(sort: Sort): void {
    const data = this.user_table_users.data.slice();
    if (!sort.active || sort.direction === '') {
      this.user_table_users.data = data;
      return;
    }

    this.user_table_users.data = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'username':
          return compare(a.username, b.username, isAsc);
        case 'role':
          return compare(a.role, b.role, isAsc);
        default:
          return 0;
      }
      function compare(a: number | string, b: number | string, isAsc: boolean) {
        return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
      }
    });
  }

  /**
   * Function to allow automatic expansion of the current user in the users table
   * @author CptVickers
   */
  @ViewChild('userTableElement') elements: ElementRef;
  protected expand_user_table_row(): void {
    // Set the expanded user row to the user that is currently logged in.
    this.user_table_expanded_element = this.auth_service.current_user_name;
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
  private push_fragment_context_to_fragment_form(_author: string, _location: string, _text: string): void {
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
   * Updates a value of a key in the given form
   * @param form what form is to be updated
   * @param key what field is to be updated
   * @param value what value is to be written
   * @author Ycreak
   */
  protected update_form_field(form: string, key: string, value: string): void {
    this[form].patchValue({ [key]: value });
  }

  /**
   * Function to reset the fragment form
   * @author Ycreak
   */
  protected reset_fragment_form(): void {
    // First, remove all data from the form
    this.fragment_form.reset();
    // Second, remove the controls created for the FormArrays
    this.fragment_form.setControl('context', new FormArray([]));
    this.fragment_form.setControl('lines', new FormArray([]));
    this.fragment_form.setControl('linked_fragments', new FormArray([]));
  }

  /**
   * Function to request the introduction text for a given author or author + title.
   * @param column Column object with form data; contains selected author and title data.
   * @author CptVickers
   */
  public request_introduction(column: Column): string {
    let request: Observable<any>;
    if (column.selected_fragment_author && !column.selected_fragment_title) {
      request = this.api.get_author_introduction_text(column);
    }
    else if (column.selected_fragment_author && column.selected_fragment_title) {
      request = this.api.get_title_introduction_text(column);
    }
    else {
      throw Error("Error during introduction text retrieval: undefined author and/or title");
    }

    let result = '';
    request.subscribe({
      next: (data) => {
        result += data;
      },
      error: (err) => {
        result += err; // TODO: Which route do we use to display the errors?
        this.api.handle_error_message(err);
      }});
    return result;
  }

  /**
   * Function to save the introduction text for a given author or author + title.
   * @param field Field indicating which introduction text to save: author introduction or title introduction.
   * @returns A text message indicating success/failure.
   * @author CptVickers
   */
  public request_save_introduction(field: string): string {
    console.log(field)
    let request: Observable<any>;
    if (field != 'author' && field != 'title') {
      throw Error(`Error: attempted to save introduction text for invalid field: ${field}`)
    }
    else if (field == 'author') {
      request = this.api.set_author_introduction_text(this.author_title_introduction_form.value['author_introduction'])
    }
    else if (field == 'title') {
      request = this.api.set_title_introduction_text(this.author_title_introduction_form.value['title_introduction'])
    }

    let result = '';
    request.subscribe({
      next: (data) => {
        result += data;
      },
      error: (err) => {
        result += err; // TODO: Which route do we use to display the errors?
        this.api.handle_error_message(err);
      }});
    return result;
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
            this.api.request_revise_fragment(fragment, environment.dashboard_id);
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
          this.api.request_create_fragment(fragment, environment.dashboard_id);
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
          this.api.request_delete_fragment(
            fragment.author,
            fragment.title,
            fragment.editor,
            fragment.name,
            environment.dashboard_id
          );
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

  //////////////////////////////////////
  // USER RELATED DASHBOARD FUNCTIONS //
  //////////////////////////////////////

  /**
   * This function requests users from the server based on the role of the logged in user.
   * If a user is student, only the student will be retrieved. For teachers, all students will
   * be retrieved in addition to themselves. Administrators will receive all users.
   * @author Ycreak
   */
  private request_users() {
    this.api.spinner_on();
    // We will provide the api with the currently logged in user to check its privileges
    const user = new User({
      username: this.auth_service.current_user_name,
      role: this.auth_service.current_user_role,
    });
    this.api.get_users(user).subscribe({
      next: (data) => {
        this.retrieved_users = data;
        //FIXME: this should be handled somewhere else, preferably by a listener
        // Rebuild the table that displays the users
        this.user_table_users = new MatTableDataSource(this.retrieved_users);
        this.user_table_users.paginator = this.paginator;
        this.user_table_users.sort = this.table_sort;
        this.table_data_loaded = true;
        this.api.spinner_off();
      },
      error: (err) => this.api.handle_error_message(err),
    });
  }

  /**
   * This function requests the API to create a new user given the form. With a username and
   * provided password a new user is requested from the server.
   * @param form_results containing data of the form
   * @author Ycreak
   */
  protected request_create_user(form_results: any) {
    this.api.spinner_on();
    this.dialog
      .open_confirmation_dialog('Are you sure you want to CREATE this user?', form_results.new_user)
      .subscribe((result) => {
        if (result) {
          const user = new User({
            username: form_results.new_user,
            password: form_results.new_password,
          });
          this.api.create_user(user).subscribe({
            next: (res) => {
              this.api.handle_error_message(res), this.request_users();
            },
            error: (err) => this.api.handle_error_message(err),
          });
        }
      });
  }

  /**
   * This function requests the changing of the role of a user.
   * @param user object of the user who's role is to change
   * @param role new role to be given to the user
   * @author Ycreak
   */
  protected request_change_role(user: any) {
    const item_string = user.username + ', ' + user.role;
    this.dialog
      .open_confirmation_dialog('Are you sure you want to CHANGE the role of this user?', item_string)
      .subscribe((result) => {
        if (result) {
          this.api.spinner_on();
          // We update the user role by providing the api with a username and the new role
          this.api.user_update({ username: user.username, role: user.role }).subscribe({
            next: (res) => {
              this.api.handle_error_message(res), this.request_users();
            },
            error: (err) => this.api.handle_error_message(err),
          });
        }
      });
  }

  /**
   * This function requests the changing of the selected user's password. If the dialog is succesful,
   * communication with the server is started. If the passwords do not match, the snackbar is invoked.
   * @param form change_password form with new passwords
   * @param username of the currently selected user in the table
   * @author Ycreak
   */
  protected request_change_password(form: FormGroup, username: string): void {
    if (form.value.password1 == form.value.password2) {
      this.dialog
        .open_confirmation_dialog("Are you sure you want to CHANGE this user's password", username)
        .subscribe((result) => {
          if (result) {
            this.api.spinner_on();
            this.api.user_update({ username: username, password: form.value.password1 }).subscribe({
              next: (res) => this.api.handle_error_message(res),
              error: (err) => this.api.handle_error_message(err),
            });
          }
        });
    } else {
      this.utility.open_snackbar('Passwords do not match.');
    }
  }

  /**
   * This function requests the api to delete a user given their username
   * @param username name of the user who's account is to be deleted
   * @author Ycreak
   */
  protected request_delete_user(user: any): void {
    this.dialog
      .open_confirmation_dialog('Are you sure you want to DELETE this user?', user.username)
      .subscribe((result) => {
        if (result) {
          this.api.spinner_on();
          this.api.delete_user(user).subscribe({
            next: (res) => {
              this.api.handle_error_message(res), this.request_users();
            },
            error: (err) => this.api.handle_error_message(err),
          });
        }
      });
  }
}
