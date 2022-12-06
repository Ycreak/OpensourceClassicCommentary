// Library imports
import { Component, OnInit, Inject } from '@angular/core';
import { ViewChild } from '@angular/core';
import { Observable, delay } from 'rxjs';
import { UntypedFormBuilder, FormControl, FormGroup, FormArray } from '@angular/forms';
import { UntypedFormControl, UntypedFormGroup, Validators, UntypedFormArray } from '@angular/forms';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatCell, MatCellDef, MatRow, MatTableDataSource } from '@angular/material/table';
import { animate, animation, state, style, transition, trigger } from '@angular/animations';

// Component imports
import { ApiService } from '../api.service';
import { UtilityService } from '../utility.service';
import { AuthService } from '../auth/auth.service';
import { DialogService } from '../services/dialog.service';

// Model imports 
import { Fragment } from '../models/Fragment';
import { Column } from '../models/Column';

import { User } from '../models/User';
// import { shareReplay } from 'rxjs/operators';
// import { MatGridTileHeaderCssMatStyler } from '@angular/material/grid-list';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  animations: [ // For the User table
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
      transition(':leave', [
          animate('500ms', style({ opacity: 0, transform: 'translateY(10px)' })),
      ]),
    ])
  ],
})
export class DashboardComponent implements OnInit {

  // For the user table
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) matSort: MatSort;
  private sort: any;
  @ViewChild(MatSort) set content(content: Element) {
    this.sort = content;
    if (this.sort) {
      this.user_table_users.sort = this.sort
    }
  }

  hide: boolean = true; // Whether to hide passwords in the material form fields

  // We only allow the delete fragment button if one is actually selected.
  fragment_selected: boolean = false;

  // User table specific variables
  user_table_columns_to_display: string[] = ['username', 'role'];
  user_table_users: MatTableDataSource<User>;
  user_table_columns_to_displayWithExpand = [...this.user_table_columns_to_display, 'expand'];
  user_table_expanded_element: User | null;

  // List with users shown in the Table  
  retrieved_users: User[];
  
  retrieved_bibliography_authors: object;
  retrieved_author_bibliography: object;

  /** 
   * This form represents the Fragment class. It is built in stages by all the fragment tabs on the HTML.
   * After all validators, it will be parsed to a Fragment object. It is used in the Dashboard for the creation
   * and revision of fragments.
   */
  fragment_form = new FormGroup({
    fragment_id: new FormControl(''),

    fragment_name: new FormControl('', [
      Validators.required,
      Validators.pattern('[0-9-_ ]*')
    ]), // numbers and "-" and "_" allowed.
    author: new FormControl('', [
      Validators.required,
      Validators.pattern('[a-zA-Z ]*')
    ]), // alpha characters allowed
    title: new FormControl('', [
      Validators.required,
      Validators.pattern('[a-zA-Z ]*')
    ]), // alpha characters allowed
    editor: new FormControl('', [
      Validators.required,
      Validators.pattern('[a-zA-Z ]*')
    ]), // alpha characters allowed
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

    linked_bib_entries: new FormArray([]),

    status: new FormControl('', Validators.required),
    published: new FormControl(''),
    lock: new FormControl(''),
  });

  /** 
   * This form is used to change the password of the selected user. 
   * After all validators, it will be parsed to a User object. 
   */
  change_password_form = new FormGroup({
    password1: new FormControl('', [
      Validators.required,
      Validators.pattern('[a-zA-Z0-9-_]*')
    ]),
    password2: new FormControl('', [
      Validators.required,
      Validators.pattern('[a-zA-Z0-9-_]*')
    ]),
  });

  /** 
   * This form is used to change the password of the selected user. 
   * After all validators, it will be parsed to a User object. 
   */
  create_new_user_form = new FormGroup({
    new_user: new FormControl('', [
      Validators.required,
      Validators.pattern('[a-zA-Z0-9-_]*')
    ]),
    new_password: new FormControl('', [
      Validators.required,
      Validators.pattern('[a-zA-Z0-9-_]*')
    ]),
  });

  /** 
   * This form is used for the creation of a bibliography entry. 
   * After all validators, it will be parsed to a Bib object. 
   */
  bibliography_form: UntypedFormGroup = this.formBuilder.group({ //TODO: Validators
    _id: '',
    bib_entry_type: 'book', // Book is default on page load
    author: '',
    title: '',
    year: '',
    series: '',
    number: '',
    location: '',
    edition: '',
    journal: '',
    volume: '',
    pages: '',
  });

  // Bibliography author selection
  bibliography_author_selection_form = new UntypedFormControl();
  bibliography_author_selection_form_options: string[] = [];
  bibliography_author_selection_form_filtered_options: Observable<string[]>;
  bibliography_form_selected_type = new UntypedFormControl(0);
  bib_entry_selected: boolean = false;

  table_data_loaded: boolean = false // Returns true if the table has loaded its data
  loading_hint: Observable<unknown> // Loading hint animation

  // In this object all meta data is stored regarding the currently selected fragment
  selected_fragment_data: Column;
  linked_fragment_data: Column;

  // To convert a form to an object
  // this.converted_fragment_form = {...this.converted_fragment_form,...this.fragment_form.value}
  // converted_fragment_form: Fragment;

  constructor(
    public api: ApiService,
    public utility: UtilityService,
    public dialog: DialogService,
    private formBuilder: UntypedFormBuilder,
    public auth_service: AuthService,
  ) {

    // Assign the data to the data source for the table to render
    this.user_table_users = new MatTableDataSource(this.retrieved_users);
  }

  /**
   * On Init, we just load the list of authors. From here, selection is started
   */
  ngOnInit(): void {
    this.loading_hint = this.utility.get_loading_hint() // Initialize the loading hint
    this.request_users()
    
    // We will store all dashboard data in the following data object
    this.selected_fragment_data = new Column();
    this.linked_fragment_data = new Column();

    
    this.api.request_authors(this.selected_fragment_data);
    this.api.request_authors(this.linked_fragment_data);

    // this.retrieve_requested_fragment('Ennius', 'Thyestes', 'TRF', '134')
    // this.request_bibliography_authors()

    // this.bibliography_author_selection_form_filtered_options = this.bibliography_author_selection_form.valueChanges.pipe(
    //   startWith(''),
    //   map(value => this.filter_autocomplete_options(value)),
    // );
    
  }


  // initiate the table sorting and paginator
  public ngAfterViewInit(): void {
    this.user_table_users.paginator = this.paginator;
    this.user_table_users.sort = this.matSort;
  }

  /**
   * Simple test function, can be used for whatever
   * @param thing item to be printed
   * @author Ycreak
   */
  public test(thing): void {
    console.log(this.retrieved_users)
  }

  /**
   * This function requests a wysiwyg dialog to handle data updating to the fragment_form.
   * It functions by providing the field of fragment_form which is to be updated by the editor.
   * The dialog is called provided the config of the editor and the string to be edited. An edited string
   * is returned by the dialog service
   * @param field from fragment_form which is to be send and updated
   * @author Ycreak
   */
  public request_wysiwyg_dialog(field: string, index: number = 0): void{  
    if(field == 'context'){
      // For the context, retrieve the context text field from the fragment form and pass that to the dialog
      let form_array_field = this.fragment_form.value.context[index].text;
      this.dialog.open_wysiwyg_dialog(form_array_field).subscribe(result => {
        if (result){ // Result will only be provided when the user has acceped the changes
          // Now update the correct field. This is done by getting the FormArray and patching the correct
          // FormGroup within this array. This is to ensure dynamic updating on the frontend
          let context_array = this.fragment_form.controls["context"] as FormArray;
          context_array.controls[index].patchValue({['text']: result});
        }
      });
    }
    else{ // The other content fields can be updated by just getting their content strings
      this.dialog.open_wysiwyg_dialog(this.fragment_form.value[field]).subscribe(result => {
        if (result){
          this.update_form_field('fragment_form', field, result)
        }
      });
    }
  }

  /**
   * This function takes the Typescript Fragment object retrieved from the server and uses
   * its data fields to fill in the fragment_form. 
   * @param fragment Fragment object that is to be parsed into the fragment_form
   * @author Ycreak
   */
  public convert_Fragment_to_fragment_form(fragment: Fragment): void {
    // This functions updates the fragment_form with the provided fragment
    for (let item of ['fragment_id', 'fragment_name', 'author', 'title',
                      'editor', 'translation', 'differences', 'commentary',
                      'apparatus', 'reconstruction', 'status', 'lock',
                      'published']) {
                        
      this.update_form_field('fragment_form', item, fragment[item]);
    }
    
    // Fill the fragment context array
    for (let i in fragment.context) {
      this.push_fragment_context_to_fragment_form(
        fragment.context[i].author,
        fragment.context[i].location,
        fragment.context[i].text
      );
    }
    // Fill the fragment lines array
    for (let i in fragment.lines) {
      this.push_fragment_line_to_fragment_form(
        fragment.lines[i].line_number,
        fragment.lines[i].text);
    }
    // Fill the linked fragment array
    for (let i in fragment.linked_fragments) {
      this.push_linked_fragments_to_fragment_form(
        fragment.linked_fragments[i]);
    }
  }

  /**
   * Function to allow the User table to be filtered indifferently of field
   * @param event that triggered the filtering process
   * @author Ycreak
   */
  public apply_user_table_filter(event: Event): void {
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
  public sort_user_table(sort: Sort): void {
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
   * @param element user table element that needs to be expanded
   * @author CptVickers
   */
  public expand_user_table_row(element: any): void {
    if (element['username']) { // Check if element has the expected attributes
      this.user_table_expanded_element = element
    }
  }

  /**
   * This function creates a form group containing a single line of a fragment and pushes
   * it to the fragment_form, specifically to the lines FormArray.
   * @param line_number given number of the fragment
   * @param text with string containing the lines content
   * @author Ycreak
   */
  public push_fragment_line_to_fragment_form(line_number: string, text: string): void {
    // First, create a form group to represent a line
    let new_line = new FormGroup({
      line_number: new FormControl(line_number),
      text: new FormControl(text),
    });
    // Next, push the created form group to the lines FormArray    
    let fragment_lines_array = this.fragment_form.get('lines') as FormArray;
    fragment_lines_array.push(new_line);
  }

  /**
   * This function creates a form group containing a single linked fragment and pushes
   * it to the fragment_form, specifically to the linked_fragment FormArray.
   * @param linked_fragment_id given id of the linked fragment
   * @author Ycreak
   */
   public push_linked_fragments_to_fragment_form(linked_fragment_id: string): void {
    // First, create a form group to represent a line
    let new_linked_fragment = new FormGroup({
      linked_fragment_id: new FormControl(linked_fragment_id),
    });
    // Next, push the created form group to the lines FormArray    
    let linked_fragments_array = this.fragment_form.get('linked_fragments') as FormArray;
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
  public push_fragment_context_to_fragment_form(_author: string, _location: string, _text: string): void {
    // First, create a form group to represent a context
    let new_context = new FormGroup({
      author: new FormControl(_author),
      location: new FormControl(_location),
      text: new FormControl(_text),
    });
    // Next, push the created form group to the context FormArray    
    let fragment_context_array = this.fragment_form.get('context') as FormArray;
    fragment_context_array.push(new_context);
  }

  /**
   * Pushes the id of the referenced fragment to the Fragment_form
   * @param column Fragment_column object with all necessary data
   * @author Ycreak
   */
   public add_referenced_fragment_to_Fragment_form(column: Column): void {
    this.api.get_specific_fragment(column).subscribe(
      fragment => {
        this.push_linked_fragments_to_fragment_form(fragment.fragment_id)
      });
  }

  /**
   * Updates a value of a key in the given form
   * @param form what form is to be updated
   * @param key what field is to be updated
   * @param value what value is to be written
   * @author Ycreak
   */
  public update_form_field(form: string, key: string, value: string): void {
    this[form].patchValue({ [key]: value });
  }

  /**
   * Function to reset the fragment form
   * @author Ycreak
   */
  public reset_fragment_form(): void {
    // First, remove all data from the form
    this.fragment_form.reset();
    // Second, remove the controls created for the FormArrays
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
  public remove_form_item_from_form_array(form_name: string, target: string, index: number): void {
    let form_array_in_question = this[form_name].get(target) as FormArray;
    form_array_in_question.removeAt(index);
  }

  //   _____  ______ ____  _    _ ______  _____ _______ _____ 
  //  |  __ \|  ____/ __ \| |  | |  ____|/ ____|__   __/ ____|
  //  | |__) | |__ | |  | | |  | | |__  | (___    | | | (___  
  //  |  _  /|  __|| |  | | |  | |  __|  \___ \   | |  \___ \ 
  //  | | \ \| |___| |__| | |__| | |____ ____) |  | |  ____) |
  //  |_|  \_\______\___\_\\____/|______|_____/   |_| |_____/                                                    

  /**
   * Loads the specified fragment into the dashboard as a form
   * @param column with all relevant data
   * @author Ycreak CptVickers
   */
    public retrieve_requested_fragment(column: Column): void {
      this.utility.toggle_spinner();
      // Reset the fragment_form to allow a clean insertion of the requested fragment
      this.reset_fragment_form();

      this.api.get_fragments(new Fragment({author:column.author, title:column.title, editor:column.editor, fragment_name:column.fragment_name})).subscribe(
        data => {
          
          let fragment_list = this.api.convert_fragment_json_to_typescript(data);
          let fragment = fragment_list[0]; // We only retrieved one single fragment

          this.convert_Fragment_to_fragment_form(fragment);
          // Also update the selection fields
          column.author = fragment.author;
          column.title = fragment.title;
          column.editor = fragment.editor;
          column.fragment_name = fragment.fragment_name;
          this.utility.toggle_spinner();
        });
    }

  /**
   * This function requests the api to revise the fragment given the fragment_form.
   * @param fragment_form which represents a Fragment, edited by the user in the dashboard
   * @author Ycreak
   */
  public request_revise_fragment(fragment_form: FormGroup): void {
    // If the fragment is locked and the user is not a teacher, we will not allow this operation.
    if (fragment_form.value.lock == 'locked' && this.auth_service.current_user_role != 'teacher') {
      this.utility.open_snackbar('This fragment is locked.')
    }
    else {
      // Update the column information with the possibly updated values from the fragment_form
      this.selected_fragment_data.author = fragment_form.value.author;
      this.selected_fragment_data.title = fragment_form.value.title;
      this.selected_fragment_data.editor = fragment_form.value.editor;
      this.selected_fragment_data.fragment_name = fragment_form.value.fragment_name;

      let item_string = fragment_form.value.author + ', ' + fragment_form.value.title + ', ' + fragment_form.value.editor + ': ' + fragment_form.value.fragment_name

      this.dialog.open_confirmation_dialog('Are you sure you want to REVISE this fragment?', item_string).subscribe(result => {
        if (result) {
          this.utility.spinner_on();

          this.api.revise_fragment(fragment_form.value).subscribe({
            next: (res) => {
              this.utility.handle_error_message(res);
              this.fragment_selected = true;
              // It might be possible we have created a new author, title or editor. Retrieve the lists again
              this.api.request_authors(this.selected_fragment_data);
              this.api.request_titles(this.selected_fragment_data);
              this.api.request_editors(this.selected_fragment_data)
              // After creation, refresh the list of fragment names so the new one appears directly
              this.api.request_fragment_names(this.selected_fragment_data);
              // Also, retrieve that revised fragment so we can continue editing!
              this.retrieve_requested_fragment(this.selected_fragment_data);
              this.utility.spinner_off();
            },
            error: (err) => this.utility.handle_error_message(err)
          });
        }
      });
    }
  }

  /**
   * Given the fragment_form which represents a Fragment, this function requests the api to create a
   * new fragment. NB: this only uses the provided meta data to create a new fragment.
   * @param fragment_form which represents a Fragment, edited by the user in the dashboard
   * @author Ycreak
   */
  public request_create_fragment(fragment_form: FormGroup): void {
    // Update the column information with the possibly updated values from the fragment_form
    this.selected_fragment_data.author = fragment_form.value.author;
    this.selected_fragment_data.title = fragment_form.value.title;
    this.selected_fragment_data.editor = fragment_form.value.editor;
    this.selected_fragment_data.fragment_name = fragment_form.value.fragment_name;
    
    let item_string = fragment_form.value.author + ', ' + fragment_form.value.title + ', ' + fragment_form.value.editor + ': ' + fragment_form.value.fragment_name
    
    this.dialog.open_confirmation_dialog('Are you sure you want to CREATE this fragment?', item_string).subscribe(result => {
      if (result) {
        this.utility.spinner_on();
        this.api.create_fragment(fragment_form.value).subscribe({
          next: (res) => {
            this.utility.handle_error_message(res);
            this.fragment_selected = true;
            // It might be possible we have created a new author, title or editor. Retrieve the lists again
            this.api.request_authors(this.selected_fragment_data);
            this.api.request_titles(this.selected_fragment_data);
            this.api.request_editors(this.selected_fragment_data)
            // After creation, refresh the list of fragment names so the new one appears directly
            this.api.request_fragment_names(this.selected_fragment_data);
            // Also, retrieve that revised fragment so we can continue editing!
            this.retrieve_requested_fragment(this.selected_fragment_data);
            this.utility.spinner_off();
          },
          error: (err) => this.utility.handle_error_message(err),
        });
      }
    });
  }

  /**
   * Given the fragment_form which represents a Fragment, this function requests the api to delete the
   * selected fragment. This is done via its id.
   * @param fragment_form which represents a Fragment, edited by the user in the dashboard
   * @author Ycreak
   */
  public request_delete_fragment(fragment_form: FormGroup): void {
    
    let item_string = fragment_form.value.author + ', ' + fragment_form.value.title + ', ' + fragment_form.value.editor + ': ' + fragment_form.value.fragment_name
    
    this.dialog.open_confirmation_dialog('Are you sure you want to DELETE this fragment?', item_string).subscribe(result => {
      if (result) {
        this.utility.spinner_on();
        this.api.delete_fragment(fragment_form.value).subscribe({
          next: (res) => {
            this.utility.handle_error_message(res);
            // Reset the fragment_data object and start anew.
            this.selected_fragment_data = new Column();
            
            this.api.request_authors(this.selected_fragment_data)
            // Lastly, reset the fragment form
            this.reset_fragment_form();
            this.fragment_selected = false;
            this.utility.spinner_off();
          }, 
          error: (err) => this.utility.handle_error_message(err)
        });
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
  public request_automatic_fragment_linker(column: Column): void {
    this.utility.spinner_on();
    
    let item_string = column.author + ', ' + column.title;
    let api_data = this.utility.create_empty_fragment(); 
    api_data.author = column.author; api_data.title = column.title;

    this.dialog.open_confirmation_dialog('Are you sure you want to LINK fragments from this text?', item_string).subscribe(result => {
      if (result) {
        this.api.automatic_fragment_linker(api_data).subscribe({
          next: (res) => {
            this.utility.handle_error_message(res);
            this.utility.spinner_off();
          },
          error: (err) => {
            this.utility.handle_error_message(err);
          }
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
  public request_users() {
    this.utility.spinner_on();
    // We will provide the api with the currently logged in user to check its privileges
    let api_data = this.utility.create_empty_user(); 
    api_data.role = this.auth_service.current_user_role; api_data.username = this.auth_service.current_user_name;
    
    this.api.get_users(api_data).subscribe({
      next: (data) => {
        this.retrieved_users = data;

        //FIXME: this should be handled somewhere else, preferably by a listener
        // Rebuild the table that displays the users
        this.user_table_users = new MatTableDataSource(this.retrieved_users);
        this.user_table_users.paginator = this.paginator;
        this.user_table_users.sort = this.sort;
        this.table_data_loaded = true
        this.utility.spinner_off();
      },
      error: (err) => this.utility.handle_error_message(err),
    });
  }

  /**
   * This function requests the API to create a new user given the form. With a username and 
   * provided password a new user is requested from the server.
   * @param form_results containing data of the form
   * @author Ycreak
   */
  public request_create_user(form_results) {
    this.utility.spinner_on();
    this.dialog.open_confirmation_dialog('Are you sure you want to CREATE this user?', form_results.new_user).subscribe(result => {
      if (result) {
        let api_data = this.utility.create_empty_user();
        api_data.username = form_results.new_user; api_data.password = form_results.new_password

        this.api.create_user(api_data).subscribe({
          next: (res) => {
            this.utility.handle_error_message(res),
              this.request_users();
          },
          error: (err) => this.utility.handle_error_message(err)
        });
      }
    });
  }

  /**
   * This function requests the changing of the role of a user. 
   * @param user name of the user who's role is to change
   * @param role new role to be given to the user
   * @author Ycreak
   */
  public request_change_role(user) {
    let item_string = user.username + ', ' + user.role;
    this.dialog.open_confirmation_dialog('Are you sure you want to CHANGE the role of this user?', item_string).subscribe(result => {
      if (result) {
        this.utility.spinner_on();
        // We update the user role by providing the api with a username and the new role
        this.api.user_update({username:user.username, role:user.role}).subscribe({
          next: (res) => {
            this.utility.handle_error_message(res),
              this.request_users();
          },
          error: (err) => this.utility.handle_error_message(err)
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
   public request_change_password(form: FormGroup, username: string): void {
     
     if (form.value.password1 == form.value.password2) {
       this.dialog.open_confirmation_dialog("Are you sure you want to CHANGE this user's password", username).subscribe(result => {
         if (result) {
          this.utility.spinner_on();
          this.api.user_update({username:username, password:form.value.password1}).subscribe({
            next: (res) => this.utility.handle_error_message(res), 
            error: (err) => this.utility.handle_error_message(err)
          }
          );
        }
      });
    }
    else {
      this.utility.open_snackbar('Passwords do not match.');
    }
  }

  /**
   * This function requests the api to delete a user given their username
   * @param username name of the user who's account is to be deleted
   * @author Ycreak
   */
  public request_delete_user(user): void {
    this.dialog.open_confirmation_dialog('Are you sure you want to DELETE this user?', user.username).subscribe(result => {
      if (result) {        
        this.utility.spinner_on();
        this.api.delete_user(user).subscribe({
          next: (res) => {
            this.utility.handle_error_message(res),
              this.request_users();
          },
          error:(err) => this.utility.handle_error_message(err)
        });
      }
    });
  }

  //////////////////////////////////////////////
  // BIBLIOGRAPHY RELATED DASHBOARD FUNCTIONS //
  //////////////////////////////////////////////
  public push_bibliography_reference(bib_entry) {
    let bibliography_references = this.fragment_form.get('linked_bib_entries') as UntypedFormArray;
    bibliography_references.push(
      this.formBuilder.group({
        bib_id: bib_entry.id,
        author: bib_entry.author,
        title: bib_entry.title,
        year: bib_entry.year,
      })
    );
  }

  /** 
   * Filters the list of authors based on the user's search input
   * @param value user input
   * @return bibliography authors that match the user's input
   * @author Ycreak CptVickers
   */
  private filter_autocomplete_options(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.bibliography_author_selection_form_options.filter(option => option.toLowerCase().includes(filterValue));
  }

  /**
   * When changing the entry type for bibliographies, this function makes sure the type
   * is communicated with the bibliography form.
   * @author Ycreak, CptVickers
   * @param tab_change_event angular event that gives the bibliography type to be changed to.
   */
  public on_bibliography_tab_change(tab_change_event: MatTabChangeEvent): void {
    this.update_form_field('bibliography_form', 'bib_entry_type', tab_change_event.tab.textLabel.toLowerCase())
  }

  public add_bibliography_entry_to_fragment(bib_entry, fragment) {
    console.log('bib', bib_entry.id)
    console.log('frg', fragment.id)

    console.log(this.fragment_form.value)

  }



  /**
   * When a bibliography entry is selected by the user, put all relevant data in the fields for easy
   * revision.
   * @param bib_entry with data for the selected entry
   * @author Ycreak, CptVickers
   */
  public handle_bib_entry_selection(bib_entry) {

    console.log(bib_entry.bib_entry_type)
    // Jump automatically to the correct tab. FIXME: this works buggy
    if (bib_entry.bib_entry_type == 'book') this.bibliography_form_selected_type.setValue(0);
    if (bib_entry.bib_entry_type == 'article') this.bibliography_form_selected_type.setValue(1);

    this.update_form_field('bibliography_form', '_id', bib_entry.id);
    this.update_form_field('bibliography_form', 'author', bib_entry.author);
    this.update_form_field('bibliography_form', 'title', bib_entry.title);
    this.update_form_field('bibliography_form', 'year', bib_entry.year);
    this.update_form_field('bibliography_form', 'series', bib_entry.series);
    this.update_form_field('bibliography_form', 'number', bib_entry.number);
    this.update_form_field('bibliography_form', 'loction', bib_entry.location);
    this.update_form_field('bibliography_form', 'editon', bib_entry.edition);
    this.update_form_field('bibliography_form', 'journal', bib_entry.journal);
    this.update_form_field('bibliography_form', 'volume', bib_entry.volume);
    this.update_form_field('bibliography_form', 'pages', bib_entry.pages);


  }

  /**
   * Converts JSON into a angular list
   * @param authors_json json object from the server
   * @returns angular list with bibliography author names
   * @author Ycreak
   */
  public push_bibliography_authors_in_list(authors_json) {
    let author_list: string[] = [];

    for (let author in authors_json) {
      author_list.push(authors_json[author].name);
    }
    return author_list
  }

  /**
   * Requests a list of authors from the bibliography database. Puts it in bibliography_author_selection_form_options for
   * use in the autocomplete module
   * @author Ycreak
   */
  public request_bibliography_authors() {
    this.api.get_bibliography_authors().subscribe({
      next: (data) => {
        this.bibliography_author_selection_form_options = this.push_bibliography_authors_in_list(data); //TODO: this need to be handled with a model
      },
      error: (err) => this.utility.handle_error_message(err)
    });
  }

  public request_bibliography_from_author(author) {
    this.api.get_bibliography_from_author(author).subscribe(
      data => {
        this.retrieved_author_bibliography = data;
      });
  }

  /**
   * This function request bibliography entries given its id. It then updates the fields
   * corresponding to this id for the Fragment Bibliography tab to use.
   * @param id identifier of the bibliography document
   * @author Ycreak, CptVickers
   */
  public request_bibliography_from_id(id) {
    this.api.get_bibliography_from_id(id).subscribe(
      data => {
        let temp; // simple object to access Python JSON (TODO: needs to be Angular model)
        temp = data;
        let linked_bib_entries = this.fragment_form.get('linked_bib_entries') as UntypedFormArray;
        // Find the entry with our id
        let index = linked_bib_entries.value.findIndex(x => x.bib_id === id);
        // Add the data retrieved to the corresponding fields
        linked_bib_entries.at(index).get('author').setValue(temp.author);
        linked_bib_entries.at(index).get('title').setValue(temp.title);
        linked_bib_entries.at(index).get('year').setValue(temp.year);
      });
  }

  public request_revise_bibliography_entry(bibliography) {

    let item_string = bibliography.author + ', ' + bibliography.title

    this.dialog.open_confirmation_dialog('Are you sure you want to REVISE this bibliography entry?', item_string).subscribe(result => {
      if (result) {
        this.api.revise_bibliography_entry(bibliography).subscribe({
          next: (res) => {
            this.utility.handle_error_message(res),
              this.request_bibliography_authors();  // After a succesful response, retrieve the authors again.
          }, 
          error: (err) => this.utility.handle_error_message(err)
        });
      }
    });
    // this.reset_form('bib_form');
  }

  public request_create_bibliography_entry(bibliography) {

    let item_string = bibliography.author + ', ' + bibliography.title

    this.dialog.open_confirmation_dialog('Are you sure you want to CREATE this bibliography entry?', item_string).subscribe(result => {
      if (result) {
        this.api.create_bibliography_entry(bibliography).subscribe({
          next: (res) => {
            this.utility.handle_error_message(res),
              this.request_bibliography_authors();  // After a succesful response, retrieve the authors again.
          }, 
          error: (err) => this.utility.handle_error_message(err)
        });
      }
    });
    // this.reset_form('bib_form');
  }

  public request_delete_bibliography_entry(bibliography) {
    let item_string = bibliography.author + ', ' + bibliography.title

    this.dialog.open_confirmation_dialog('Are you sure you want to DELETE this bibliography entry?', item_string).subscribe(result => {
      if (result) {
        this.api.delete_bibliography_entry({ '_id': bibliography.id }).subscribe({
          next: (res) => {
            this.utility.handle_error_message(res),
              this.request_bibliography_authors();  // After a succesful response, retrieve the authors again.
          }, 
          error: (err) => this.utility.handle_error_message(err)
        });
      }
    });
    // this.reset_form('bib_form');
    this.bib_entry_selected = false;
  }

  

}