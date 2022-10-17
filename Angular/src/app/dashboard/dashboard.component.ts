// Library imports
import { Component, OnInit } from '@angular/core';
import { ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { UntypedFormBuilder, FormControl, FormGroup, FormArray } from '@angular/forms';
import { UntypedFormControl, UntypedFormGroup, Validators, UntypedFormArray } from '@angular/forms';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { animate, state, style, transition, trigger } from '@angular/animations';

// Component imports
import { ApiService } from '../api.service';
import { UtilityService } from '../utility.service';
import { AuthService } from '../auth/auth.service';
import { DialogService } from '../services/dialog.service';

// Model imports 
import { Fragment } from '../models/Fragment';
import { User } from '../models/User';
import { Author } from '../models/Author';
import { Book } from '../models/Book';
import { Editor } from '../models/Editor';

// Third party imports. TODO: These should be fixed again.
// import insertTextAtCursor from 'insert-text-at-cursor';
// import { IKeyboardLayouts, keyboardLayouts, MAT_KEYBOARD_LAYOUTS, MatKeyboardModule } from 'angular-onscreen-material-keyboard';
// To install the onscreen keyboard: $ npm i angular-onscreen-material-keyboard

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
  ],
})
export class DashboardComponent implements OnInit {

  // For the user table
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  spinner_active: boolean = false;
  hide: boolean = true; // Whether to hide passwords in the material form fields

  // We only allow the delete fragment button if one is actually selected.
  fragment_selected: boolean = false;

  // User table specific variables
  user_table_columns_to_display: string[] = ['username', 'role'];
  user_table_users: MatTableDataSource<User>;
  user_table_columns_to_displayWithExpand = [...this.user_table_columns_to_display, 'expand'];
  user_table_expanded_element: User | null;

  // These variables keep track of the selected author, title and editor for communication with the server.
  selected_author: string;
  selected_book: string;
  selected_editor: string;

  // These variables are used to fill the drop down menus with authors, titles and editors. 
  retrieved_authors: Author[];
  retrieved_books: Book[];
  retrieved_editors: Editor[];
  retrieved_fragment_names: string[];

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
    published: new FormControl('unpublished'),
    lock: new FormControl('unlocked'),
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

  constructor(
    private api: ApiService,
    private utility: UtilityService,
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
    this.request_authors()
    this.request_users()

    // this.request_bibliography_authors()

    // this.bibliography_author_selection_form_filtered_options = this.bibliography_author_selection_form.valueChanges.pipe(
    //   startWith(''),
    //   map(value => this.filter_autocomplete_options(value)),
    // );
  }

  // initiate the table sorting and paginator
  public ngAfterViewInit() {
    this.user_table_users.paginator = this.paginator;
    this.user_table_users.sort = this.sort;
  }

  /**
   * Simple test function, can be used for whatever
   * @param thing item to be printed
   * @author Ycreak
   */
  public test(thing) {
    console.log(this.retrieved_fragment_names)
    // let temp = new Fragment;
    // temp.author = 'luukie'

    // console.log(temp)
    // console.log(this.fragment_form.value)
  }

  /**
   * This function takes the Typescript Fragment object retrieved from the server and uses
   * its data fields to fill in the fragment_form. 
   * @param fragment Fragment object that is to be parsed into the fragment_form
   * @author Ycreak
   */
  public convert_Fragment_to_fragment_form(fragment: Fragment): void {
    // This functions updates the fragment_form with the provided fragment
    let fragment_items: string[] = ['fragment_name', 'author', 'title', 'editor', 'translation',
      'differences', 'commentary', 'apparatus', 'reconstruction', 'status', 'lock', 'published']

    for (let item in fragment_items) {
      this.update_form_field('fragment_form', fragment_items[item], fragment[fragment_items[item]]);
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
      continue
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
   * Requests all authors from the database. No parameters needed
   */
  public request_authors(): void {
    this.api.get_authors().subscribe(
      data => this.retrieved_authors = data,
      err => this.utility.handle_error_message(err),
    );
  }

  /**
   * Requests the titles by the given author. Result is written
   * to this.retrieved_books.
   * @param author name of the author who's books are to be retrieved
   * @author Ycreak
   */
  public request_books(author: string): void {
    this.api.get_titles(author).subscribe(
      data => {
        this.retrieved_books = data;
      }
    );
  }

  /**
   * Requests the editors by the given author and book title. Result is written
   * to this.retrieved_editors.
   * @param author name of the author who's books are to be retrieved
   * @param book name of the title who's editors are to be retrieved
   * @author Ycreak
   */
  public request_editors(author: string, book: string): void {
    this.api.get_editors(author, book).subscribe(
      data => {
        this.retrieved_editors = data;
      }
    );
  }

  /**
   * Loads the specified fragment into the dashboard as a form
   * @param author author of the fragment
   * @param title title of the fragment
   * @param editor editor of the fragment
   * @param fragment_name name of the fragment
   * @author Ycreak CptVickers
   */
    public retrieve_requested_fragment(author: string, title: string, editor: string, fragment_name: string): void {
      // Create api/fragment object to send to the server
      let api_data = this.utility.create_empty_fragment();
      api_data.author = author; api_data.title = title; api_data.editor = editor; api_data.fragment_name = fragment_name;

      this.api.get_specific_fragment(api_data).subscribe(
        fragment => {
          this.convert_Fragment_to_fragment_form(fragment);
        });
    }

  /**
   * Given the author, title and editor, request the names of the fragments from the server.
   * @param author author of the fragment
   * @param title title of the fragment
   * @param editor editor of the fragment
   * @author Ycreak
   */
   public request_fragment_names(author: string, title: string, editor: string): void {
    // Create api/fragment object to send to the server
    let api_data = this.utility.create_empty_fragment();
    api_data.author = author; api_data.title = title; api_data.editor = editor;

    this.api.get_fragment_names(api_data).subscribe(
      data => {
        this.retrieved_fragment_names = data;
      });
  }

  /**
   * This function requests the api to revise the fragment given the fragment_form.
   * @param fragment_form which represents a Fragment, edited by the user in the dashboard
   * @author Ycreak
   * TODO: should we parse the formgroup to a Fragment object?
   */
  public request_revise_fragment(fragment_form: FormGroup): void {
    // If the fragment is locked and the user is not a teacher, we will not allow this operation.

    if (fragment_form.value.lock){ //&& !this.auth_service.current_user.role == 'teacher') {
      this.utility.open_snackbar('This fragment is locked.')
    }
    else {
      let item_string = fragment_form.value.author + ', ' + fragment_form.value.title + ', ' + fragment_form.value.editor + ': ' + fragment_form.value.fragment_name

      this.dialog.open_confirmation_dialog('Are you sure you want to REVISE this fragment?', item_string).subscribe(result => {
        if (result) {
          this.api.revise_fragment(fragment_form).subscribe(
            res => {
              this.utility.handle_error_message(res);
            },
            err => this.utility.handle_error_message(err)
          );
        }
      });
      this.reset_fragment_form();
    }
  }

  /**
   * Given the fragment_form which represents a Fragment, this function requests the api to create a
   * new fragment. NB: this only uses the provided meta data to create a new fragment.
   * @param fragment_form which represents a Fragment, edited by the user in the dashboard
   * @author Ycreak
   * TODO: should we parse the formgroup to a Fragment object?
   */
  public request_create_fragment(fragment_form: FormGroup): void {
    let item_string = fragment_form.value.author + ', ' + fragment_form.value.title + ', ' + fragment_form.value.editor + ': ' + fragment_form.value.fragment_name

    this.dialog.open_confirmation_dialog('Are you sure you want to CREATE this fragment?', item_string).subscribe(result => {
      if (result) {
        this.api.create_fragment(fragment_form).subscribe(
          res => this.utility.handle_error_message(res), err => this.utility.handle_error_message(err)
        );
      }
    });
    // Now reset form and request the fragments again
    this.request_fragment_names(this.selected_author, this.selected_book, this.selected_editor);
    let saved_new_fragment: [string, string, string, string];
    //FIXME: CptVickers, this is not very OOP of you.
    saved_new_fragment = [fragment_form.value.author, fragment_form.value.title, fragment_form.value.editor, fragment_form.value.fragment_name];
    this.reset_fragment_form();
    this.retrieve_requested_fragment(...saved_new_fragment);
    this.fragment_selected = true;
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
        this.api.delete_fragment(fragment_form).subscribe(
          res => this.utility.handle_error_message(res), err => this.utility.handle_error_message(err)
        );
      }
    });
    // Now reset form and request the fragments again to refresh the list, now without the deleted fragment
    this.reset_fragment_form();
    this.fragment_selected = false;
    this.request_fragment_names(this.selected_author, this.selected_book, this.selected_editor);
  }

  /**
   * This function requests the server to link all similar fragments from a given author and title. 
   * Linking between authors or titles is only possible manually. Linking is based on similarity and
   * done via the fuzzywuzzy library. See the function within the server for more information.
   * @param author name of the author who's fragments are to be linked between editions
   * @param title name of the title who's fragments are to be linked between editions
   * @author CptVickers Ycreak
   */
  public request_automatic_fragment_linker(author: string, title: string): void {
    let item_string = author + ', ' + title;
    let api_data = this.utility.create_empty_fragment(); 
    api_data.author = author; api_data.title = title;

    this.dialog.open_confirmation_dialog('Are you sure you want to LINK fragments from this text?', item_string).subscribe(result => {
      if (result) {
        this.spinner_active = true;
        this.api.automatic_fragment_linker(api_data).subscribe(
          res => {
            this.utility.handle_error_message(res),
              this.spinner_active = false;
          },
          err => {
            this.utility.handle_error_message(err),
              this.spinner_active = false;
          },
        );
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
   * TODO: provide this.api.get_users with the logged in user. The server should then decide
   * what information is provided to the frontend.
   */
  public request_users() {
    // We will provide the api with the currently logged in user to check its privileges
    let api_data = this.utility.create_empty_user(); 
    api_data.role = this.auth_service.current_user_role; api_data.username = this.auth_service.current_user_name;
    
    this.api.get_users(api_data).subscribe(
      data => {
        this.retrieved_users = data;
        console.log(this.retrieved_users)

        //FIXME: this should be handled somewhere else, preferably by a listener
        // Rebuild the table that displays the users
        this.user_table_users = new MatTableDataSource(this.retrieved_users);
        this.user_table_users.paginator = this.paginator;
        this.user_table_users.sort = this.sort;
      },
      err => this.utility.handle_error_message(err),
    );
  }

  /**
   * This function requests the API to create a new user given the form. With a username and 
   * provided password a new user is requested from the server.
   * @param form_results containing data of the form
   * @author Ycreak
   */
  public request_create_user(form_results) {
    this.dialog.open_confirmation_dialog('Are you sure you want to CREATE this user?', form_results.new_user).subscribe(result => {
      if (result) {
        let api_data = this.utility.create_empty_user();
        api_data.username = form_results.new_user; api_data.new_password = form_results.new_password

        this.api.create_user(api_data).subscribe(
          res => {
            this.utility.handle_error_message(res),
              this.request_users();
          },
          err => this.utility.handle_error_message(err)
        );
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
        let api_data = this.utility.create_empty_user();
        api_data.username = user.username; api_data.new_role = user.role

        this.api.user_change_role(api_data).subscribe(
          res => {
            this.utility.handle_error_message(res),
              this.request_users();
          },
          err => this.utility.handle_error_message(err)
        );
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
          let api_data = this.utility.create_empty_user();
          api_data.username = username; api_data.new_password = form.value.password1
  
          this.api.user_change_password(api_data).subscribe(
            res => this.utility.handle_error_message(res), err => this.utility.handle_error_message(err)
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
        this.api.delete_user(user).subscribe(
          res => {
            this.utility.handle_error_message(res),
              this.request_users();
          },
          err => this.utility.handle_error_message(err)
        );
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
        bib_id: bib_entry._id,
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
    console.log('bib', bib_entry._id)
    console.log('frg', fragment._id)

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

    this.update_form_field('bibliography_form', '_id', bib_entry._id);
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
    this.api.get_bibliography_authors().subscribe(
      data => {
        this.bibliography_author_selection_form_options = this.push_bibliography_authors_in_list(data); //TODO: this need to be handled with a model
      },
      err => this.utility.handle_error_message(err),
    );
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
        this.api.revise_bibliography_entry(bibliography).subscribe(
          res => {
            this.utility.handle_error_message(res),
              this.request_bibliography_authors();  // After a succesful response, retrieve the authors again.
          }, err => this.utility.handle_error_message(err)
        );
      }
    });
    // this.reset_form('bib_form');
  }

  public request_create_bibliography_entry(bibliography) {

    let item_string = bibliography.author + ', ' + bibliography.title

    this.dialog.open_confirmation_dialog('Are you sure you want to CREATE this bibliography entry?', item_string).subscribe(result => {
      if (result) {
        this.api.create_bibliography_entry(bibliography).subscribe(
          res => {
            this.utility.handle_error_message(res),
              this.request_bibliography_authors();  // After a succesful response, retrieve the authors again.
          }, err => this.utility.handle_error_message(err)
        );
      }
    });
    // this.reset_form('bib_form');
  }

  public request_delete_bibliography_entry(bibliography) {
    let item_string = bibliography.author + ', ' + bibliography.title

    this.dialog.open_confirmation_dialog('Are you sure you want to DELETE this bibliography entry?', item_string).subscribe(result => {
      if (result) {
        this.api.delete_bibliography_entry({ '_id': bibliography._id }).subscribe(
          res => {
            this.utility.handle_error_message(res),
              this.request_bibliography_authors();  // After a succesful response, retrieve the authors again.
          }, err => this.utility.handle_error_message(err));
      }
    });
    // this.reset_form('bib_form');
    this.bib_entry_selected = false;
  }




}
