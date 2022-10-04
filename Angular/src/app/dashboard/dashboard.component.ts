// Library imports
import { Component, OnInit} from '@angular/core';
import { AfterViewInit, ViewChild } from '@angular/core';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import { FormBuilder } from '@angular/forms';
import { ReactiveFormsModule, FormControl, FormGroup, Validators, FormArray } from '@angular/forms';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';

// Component imports
import { ApiService } from '../api.service';
import { UtilityService } from '../utility.service';
import { AuthService } from '../auth/auth.service';
import { DialogService } from '../services/dialog.service';

// Model imports 
import { Fragment } from '../models/Fragment';

// Third party imports
// import insertTextAtCursor from 'insert-text-at-cursor';
// import { IKeyboardLayouts, keyboardLayouts, MAT_KEYBOARD_LAYOUTS, MatKeyboardModule } from 'angular-onscreen-material-keyboard';
// To install the onscreen keyboard: $ npm i angular-onscreen-material-keyboard

export interface UserData {
  username: string;
  role: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  
  displayedColumns: string[] = ['username', 'role']; //['id', 'name', 'progress', 'fruit'];
  dataSource: MatTableDataSource<UserData>;

  selected_author: string = '';
  selected_book: string = '';
  selected_editor: string = '';
  selected_fragment : string;

  retrieved_authors: object;
  retrieved_books: object;
  retrieved_editors: object;

  retrieved_fragment: Fragment;
  retrieved_fragments: object;
  retrieved_fragment_numbers: object;

  retrieved_bibliography_authors: object;
  retrieved_author_bibliography: object;

  // Forms
  fragmentForm: FormGroup = this.formBuilder.group({
    _id: '',
    fragment_name: '', //['', Validators.required],
    author: '',
    title: '',
    editor: '',
    translation: '',
    differences: '',
    commentary: '',
    apparatus: '',
    reconstruction: '',
    context: this.formBuilder.array([ ]),
    lines: this.formBuilder.array([ ]),
    linked_fragments: this.formBuilder.array([ ]),
    linked_bib_entries: this.formBuilder.array([ ]),
    status: '',
    lock: 0,
  });

  bibliography_form : FormGroup = this.formBuilder.group({
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

  pointer_editor : string;

  spinner_active : boolean = false;

  // User dashboard
  isChecked = false;
  temp = ''
  hide : boolean = true;
  change_password_form = this.formBuilder.group({
    password1: '',
    password2: '',
  });

  retrieved_users : UserData[]; 
  selected_user : string = '';
  user_selected : boolean = false; // controls user deletion button
  new_user : string = '';
  new_user_password : string = '';

  // Whether a fragment is selected
  fragment_selected : boolean = false;
  allow_fragment_creation = false;

  // Bibliography author selection
  bibliography_author_selection_form = new FormControl();
  bibliography_author_selection_form_options: string[] = [];
  bibliography_author_selection_form_filtered_options: Observable<string[]>;
  bibliography_form_selected_type = new FormControl(0);
  bib_entry_selected : boolean = false;

  constructor(
    private api: ApiService,
    private utility: UtilityService,
    public dialog: DialogService,
    private formBuilder: FormBuilder,
    public authService: AuthService,
    ) {

    // Assign the data to the data source for the table to render
    this.dataSource = new MatTableDataSource(this.retrieved_users);
    }

    public ngAfterViewInit() {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }

    public applyFilter(event: Event) {
      const filterValue = (event.target as HTMLInputElement).value;
      this.dataSource.filter = filterValue.trim().toLowerCase();
  
      if (this.dataSource.paginator) {
        this.dataSource.paginator.firstPage();
      }
    }

  /**
   * On Init, we just load the list of authors. From here, selection is started
   */
  ngOnInit(): void {
    this.RequestAuthors()
    this.Request_users()
    // this.request_bibliography_authors()

    // this.bibliography_author_selection_form_filtered_options = this.bibliography_author_selection_form.valueChanges.pipe(
    //   startWith(''),
    //   map(value => this.filter_autocomplete_options(value)),
    // );
  }


  /**
   * Simple test function, can be used for whatever
   * @param thing item to be printed
   */
  public Test(thing){
    console.log(this.retrieved_users)

    // console.log(this.bibliography_author_selection_form_options)
    // console.log(this.retrieved_fragment)
    
    // let current_fragment = new Fragment({});

    // current_fragment.author = 'Ennius'
    // current_fragment.title = 'Thyestes'

    // console.log(current_fragment)

    // this.Request_automatic_fragment_linker(current_fragment)


  }

  // /** Builds and returns a new User. */
  // public createNewUser(id: number): UserData {
  //   const name =
  //     NAMES[Math.round(Math.random() * (NAMES.length - 1))] +
  //     ' ' +
  //     NAMES[Math.round(Math.random() * (NAMES.length - 1))].charAt(0) +
  //     '.';

  //   return {
  //     id: id.toString(),
  //     name: name,
  //     progress: Math.round(Math.random() * 100).toString(),
  //     fruit: FRUITS[Math.round(Math.random() * (FRUITS.length - 1))],
  //   };
  // }

  public Retrieve_fragment_numbers(fragments){    
    let number_list = []

    for(let fragment in fragments){
      number_list.push(fragments[fragment].fragment_name)
    }
    // Sort the list and return it
    number_list.sort(this.utility.SortNumeric);

    return number_list
  }

  public Retrieve_requested_fragment(fragments, fragment_number){
    let fragment_id = ''

    for(let fragment in fragments){
      if(fragments[fragment].fragment_name == fragment_number){
        fragment_id = fragments[fragment].id
      }
    }
    // Now, get this fragment from the server
    this.api.get_specific_fragment(fragment_id).subscribe(
      data => { 
        this.retrieved_fragment = data;
        this.selected_fragment = fragment_number;
        this.Update_content_form(this.retrieved_fragment);

    });
  }

  public Clean_fragment_content(){
    // Clears context and lines
    this.Clear_fields()

    this.UpdateForm('fragmentForm','translation', '');
    this.UpdateForm('fragmentForm','differences', '');
    this.UpdateForm('fragmentForm','commentary', '');
    this.UpdateForm('fragmentForm','apparatus', '');
    this.UpdateForm('fragmentForm','reconstruction', '');
  }

  public Update_content_form(fragment){
    // This functions updates the fragmentForm with the provided fragment
    // FIXME: This should be done using a for loop
    this.UpdateForm('fragmentForm','_id', fragment.id);
    this.UpdateForm('fragmentForm','fragment_name', fragment.fragment_name);
    this.UpdateForm('fragmentForm','author', fragment.author);
    this.UpdateForm('fragmentForm','title', fragment.title);
    this.UpdateForm('fragmentForm','editor', fragment.editor);
    this.UpdateForm('fragmentForm','translation', fragment.translation);
    this.UpdateForm('fragmentForm','differences', fragment.differences);
    this.UpdateForm('fragmentForm','commentary', fragment.commentary);
    this.UpdateForm('fragmentForm','apparatus', fragment.apparatus);
    this.UpdateForm('fragmentForm','reconstruction', fragment.reconstruction);
    this.UpdateForm('fragmentForm','status', fragment.status);
    this.UpdateForm('fragmentForm','lock', fragment.lock);

  

    // Fill the fragment context array
    for (let item in fragment.context){
      let items = this.fragmentForm.get('context') as FormArray;
      items.push(
        this.formBuilder.group({
          author: fragment.context[item].author,
          location: fragment.context[item].location,
          text: fragment.context[item].text,
        })
      );
    }
    // Fill the fragment lines array
    for (let item in fragment.lines){
      let items = this.fragmentForm.get('lines') as FormArray;
      items.push(
        this.formBuilder.group({
          'line_number': fragment.lines[item].line_number,
          'text': fragment.lines[item].text,
        })
      );
    }
    // Fill the linked fragment array
    for (let item in fragment.linked_fragments){
      let items = this.fragmentForm.get('linked_fragments') as FormArray;
      items.push(
        this.formBuilder.group({
          fragment_id: fragment.linked_fragments[item],
        })
      );
    }

    for (let item in fragment.linked_bib_entries){

      // Request additional data from this item
      this.request_bibliography_from_id(fragment.linked_bib_entries[item])

      let items = this.fragmentForm.get('linked_bib_entries') as FormArray;
      items.push(
        this.formBuilder.group({
          bib_id: fragment.linked_bib_entries[item],
          author: '',
          title: '',
          year: '',
        })
      );
    }
  }

////////////////////////////////////////////////////////////////////////////

  public Push_fragment_line(line_number, text){
    let fragment_lines = this.fragmentForm.get('lines') as FormArray;
    fragment_lines.push(
      this.formBuilder.group({
        line_number: line_number,
        text: text,
      })
    );
  }

  public Push_fragment_context(author, location, text){
    let fragment_context = this.fragmentForm.get('context') as FormArray;
    fragment_context.push(
      this.formBuilder.group({
        author: author,
        location: location,
        text: text,
      })
    );
  }

  public push_bibliography_reference(bib_entry){
    let bibliography_references = this.fragmentForm.get('linked_bib_entries') as FormArray;
    bibliography_references.push(
      this.formBuilder.group({
        bib_id: bib_entry._id,
        author: bib_entry.author,
        title: bib_entry.title,
        year: bib_entry.year,
      })
    );
  }

  // DEPRECATED
  // public Push_fragment_link(author, title, editor ,fragment_name, fragment_id){
  //   let fragment_link = this.fragmentForm.get('linked_fragments') as FormArray;
  //   fragment_link.push(
  //     this.formBuilder.group({
  //       author: author,
  //       title: title,
  //       editor: editor,
  //       fragment_name: fragment_name,
  //       fragment_id: fragment_id,
  //     })
  //   );    
  // }  
  // FORM RELATED FUNCTIONS
  /**
   * Updates a value of a key in the given form
   * @param form what form is to be updated
   * @param key what field is to be updated
   * @param value what value is to be written
   */
  public UpdateForm(form, key, value) {
    this[form].patchValue({[key]: value});
  }

  public Reset_form(){
    this.fragmentForm.reset();
    this.bibliography_form.reset();
    this.Clear_fields();
  }

  public Clear_fields(){
    let context = this.fragmentForm.get('context') as FormArray
    let lines = this.fragmentForm.get('lines') as FormArray
    let linked_fragments = this.fragmentForm.get('linked_fragments') as FormArray
    let linked_bib_entries = this.fragmentForm.get('linked_bib_entries') as FormArray

    context.clear()
    lines.clear()
    linked_fragments.clear()
    linked_bib_entries.clear()
  }


  public Remove_form_item(target: string, index: number) {
    let items = this.fragmentForm.get(target) as FormArray;
    items.removeAt(index);
  }

  // public Request_fragment_lock(form){
    
  //   let lock_status = (form.lock ? 1 : 0);
        
  //   this.api.update_fragment_lock({'id': form._id, 'lock': lock_status}).subscribe(
  //     res => this.utility.handle_error_message(res), err => this.utility.handle_error_message(err)
  //   );  
  // }

//   _____  ______ ____  _    _ ______  _____ _______ _____ 
//  |  __ \|  ____/ __ \| |  | |  ____|/ ____|__   __/ ____|
//  | |__) | |__ | |  | | |  | | |__  | (___    | | | (___  
//  |  _  /|  __|| |  | | |  | |  __|  \___ \   | |  \___ \ 
//  | | \ \| |___| |__| | |__| | |____ ____) |  | |  ____) |
//  |_|  \_\______\___\_\\____/|______|_____/   |_| |_____/                                                    

  /**
   * Requests all authors from the database. No parameters needed
   */
  public RequestAuthors(){
    this.api.get_authors().subscribe(
      data => this.retrieved_authors = data,
      err => this.utility.handle_error_message(err),
    );      
  }

  public RequestBooks(author: string){
    this.api.get_titles(author).subscribe(
      data => {
        this.retrieved_books = data;
      }
    );      
  }

  public RequestEditors(author: string, book: string){
    this.api.get_editors(author, book).subscribe(
      data => {
        this.retrieved_editors = data;
      }
    );
  }

  public Request_fragments(author: string, book: string, editor: string){
    this.api.get_fragments(author, book, editor).subscribe(
      data => { 
        this.retrieved_fragments = data;
        this.retrieved_fragment_numbers = this.Retrieve_fragment_numbers(data);
      });  
  }

  public Request_revise_fragment(fragment){
    // If the fragment is locked and the user is not a teacher, we will not allow this operation.
        
    if(fragment.lock && !this.authService.is_teacher){
      this.utility.open_snackbar('This fragment is locked.')
    }
    else{
      let item_string = fragment.author + ', ' +  fragment.title + ', ' + fragment.editor + ': ' + fragment.fragment_name

      this.dialog.open_confirmation_dialog('Are you sure you want to REVISE this fragment?', item_string).subscribe(result => {
        if(result){
          this.api.revise_fragment(fragment).subscribe(
            res => {
              this.utility.handle_error_message(res);
            }, 
            err => this.utility.handle_error_message(err)
          );
        }
      });
      this.Reset_form();
    }
  }

  public Request_create_fragment(fragment){
    let item_string = fragment.author + ', ' +  fragment.title + ', ' + fragment.editor + ': ' + fragment.fragment_name

    this.dialog.open_confirmation_dialog('Are you sure you want to CREATE this fragment?', item_string).subscribe(result => {
      if(result){
        this.api.create_fragment(fragment).subscribe(
          res => this.utility.handle_error_message(res), err => this.utility.handle_error_message(err)
        );
      }
    });
    // Now reset form and request the fragments again
    this.Reset_form();
    this.Request_fragments(this.selected_author, this.selected_book, this.selected_editor);
  }

  public Request_delete_fragment(fragment){
    let item_string = fragment.author + ', ' +  fragment.title + ', ' + fragment.editor + ': ' + fragment.fragment_name
    
    this.dialog.open_confirmation_dialog('Are you sure you want to DELETE this fragment?', item_string).subscribe(result => {
      if(result){
        this.api.delete_fragment({'id':fragment.id}).subscribe(
          res => this.utility.handle_error_message(res), err => this.utility.handle_error_message(err)
        );
      }
    });
    // Now reset form and request the fragments again
    this.Reset_form();
    this.fragment_selected = false;
    this.Request_fragments(this.selected_author, this.selected_book, this.selected_editor);
  }

  // public Request_automatic_fragment_linker(author, title){
    
  //   let item_string = author + ', ' +  title;
    
  //   let fragment = new Fragment({});
  //   fragment.author = author;
  //   fragment.title = title;

  //   this.dialog.open_confirmation_dialog('Are you sure you want to LINK fragments from this text?', item_string).subscribe(result => {
  //     if(result){
  //       this.spinner_active = true;
  //       this.api.automatic_fragment_linker(fragment).subscribe(
  //         res => {
  //           this.utility.handle_error_message(res),
  //           this.spinner_active = false;
  //         }, 
  //         err => {
  //           this.utility.handle_error_message(err),
  //           this.spinner_active = false;
  //         },
  //       );
  //     }
  //   });
  // }

  public add_bibliography_entry_to_fragment(bib_entry, fragment){
    console.log('bib', bib_entry._id)
    console.log('frg', fragment._id)

    console.log(this.fragmentForm.value)

  }

    //////////////////////////////////////////////
   // BIBLIOGRAPHY RELATED DASHBOARD FUNCTIONS //
  //////////////////////////////////////////////
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
    this.UpdateForm('bibliography_form', 'bib_entry_type', tab_change_event.tab.textLabel.toLowerCase())
  }
  
  /**
   * When a bibliography entry is selected by the user, put all relevant data in the fields for easy
   * revision.
   * @param bib_entry with data for the selected entry
   * @author Ycreak, CptVickers
   */
  public handle_bib_entry_selection(bib_entry){

    console.log(bib_entry.bib_entry_type)
    // Jump automatically to the correct tab. FIXME: this works buggy
    if (bib_entry.bib_entry_type == 'book') this.bibliography_form_selected_type.setValue(0);
    if (bib_entry.bib_entry_type == 'article') this.bibliography_form_selected_type.setValue(1);

    this.UpdateForm('bibliography_form','_id', bib_entry._id);
    this.UpdateForm('bibliography_form','author', bib_entry.author);
    this.UpdateForm('bibliography_form','title', bib_entry.title);
    this.UpdateForm('bibliography_form','year', bib_entry.year);
    this.UpdateForm('bibliography_form','series', bib_entry.series);
    this.UpdateForm('bibliography_form','number', bib_entry.number);
    this.UpdateForm('bibliography_form','loction', bib_entry.location);
    this.UpdateForm('bibliography_form','editon', bib_entry.edition);
    this.UpdateForm('bibliography_form','journal', bib_entry.journal);
    this.UpdateForm('bibliography_form','volume', bib_entry.volume);
    this.UpdateForm('bibliography_form','pages', bib_entry.pages);


  }

  /**
   * Converts JSON into a angular list
   * @param authors_json json object from the server
   * @returns angular list with bibliography author names
   * @author Ycreak
   */
  public push_bibliography_authors_in_list(authors_json){
    let author_list: string[] = [];
    
    for(let author in authors_json){
      author_list.push(authors_json[author].name);
    }
    return author_list
  }
  
  /**
   * Requests a list of authors from the bibliography database. Puts it in bibliography_author_selection_form_options for
   * use in the autocomplete module
   * @author Ycreak
   */
  public request_bibliography_authors(){
    this.api.get_bibliography_authors().subscribe(
      data => {
        this.bibliography_author_selection_form_options = this.push_bibliography_authors_in_list(data); //TODO: this need to be handled with a model
      },
      err => this.utility.handle_error_message(err),
    );      
  }

  public request_bibliography_from_author(author){
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
  public request_bibliography_from_id(id){
    this.api.get_bibliography_from_id(id).subscribe(
      data => {
        let temp; // simple object to access Python JSON (TODO: needs to be Angular model)
        temp = data;       
        let linked_bib_entries = this.fragmentForm.get('linked_bib_entries') as FormArray;
        // Find the entry with our id
        let index = linked_bib_entries.value.findIndex(x => x.bib_id === id);
        // Add the data retrieved to the corresponding fields
        linked_bib_entries.at(index).get('author').setValue(temp.author);
        linked_bib_entries.at(index).get('title').setValue(temp.title);
        linked_bib_entries.at(index).get('year').setValue(temp.year);
      });  
  }

  public request_revise_bibliography_entry(bibliography){       
        
    let item_string = bibliography.author + ', ' +  bibliography.title

    this.dialog.open_confirmation_dialog('Are you sure you want to REVISE this bibliography entry?', item_string).subscribe(result => {
      if(result){
        this.api.revise_bibliography_entry(bibliography).subscribe(
          res => {
            this.utility.handle_error_message(res),
            this.request_bibliography_authors();  // After a succesful response, retrieve the authors again.
          }, err => this.utility.handle_error_message(err)
        );
      }
    });
    this.Reset_form();
  }

  public request_create_bibliography_entry(bibliography){

    let item_string = bibliography.author + ', ' +  bibliography.title

    this.dialog.open_confirmation_dialog('Are you sure you want to CREATE this bibliography entry?', item_string).subscribe(result => {
      if(result){
        this.api.create_bibliography_entry(bibliography).subscribe(
          res => {
            this.utility.handle_error_message(res),
            this.request_bibliography_authors();  // After a succesful response, retrieve the authors again.
          }, err => this.utility.handle_error_message(err)
        );
      }
    });
    this.Reset_form();
  }

  public request_delete_bibliography_entry(bibliography){
    let item_string = bibliography.author + ', ' +  bibliography.title
    
    this.dialog.open_confirmation_dialog('Are you sure you want to DELETE this bibliography entry?', item_string).subscribe(result => {
      if(result){
        this.api.delete_bibliography_entry({'_id':bibliography._id}).subscribe(
          res => {
            this.utility.handle_error_message(res),
            this.request_bibliography_authors();  // After a succesful response, retrieve the authors again.
          }, err => this.utility.handle_error_message(err)        );
      }
    });
    this.Reset_form();
    this.bib_entry_selected = false;
  }

    //////////////////////////////////////
   // USER RELATED DASHBOARD FUNCTIONS //
  //////////////////////////////////////
  public Request_change_password(form){
    if(form.password1 == form.password2){
      this.dialog.open_confirmation_dialog('Are you sure you want to CHANGE your password', this.authService.logged_user).subscribe(result => {
        if(result){
          this.api.user_change_password({'username':this.authService.logged_user,'new_password':form.password1}).subscribe(
            res => this.utility.handle_error_message(res), err => this.utility.handle_error_message(err)
          );
        }
      });
    }
    else{
      this.utility.open_snackbar('Passwords do not match.');
    }
  }

  public Request_users(){
    this.api.get_users().subscribe(
      data => {
        this.retrieved_users = data;
        // Rebuild the table that displays the users
        this.dataSource = new MatTableDataSource(this.retrieved_users);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
      err => this.utility.handle_error_message(err),
    );      
  }

  public Request_create_user(new_user, new_password){

    if(new_user == '' || new_password == ''){
      this.utility.open_snackbar('Please provide proper details');
    }
    else{
      this.dialog.open_confirmation_dialog('Are you sure you want to CREATE this user?', new_user).subscribe(result => {
        if(result){
          this.api.create_user({'username':new_user,'password':new_password}).subscribe(
            res => {
              this.utility.handle_error_message(res),
              this.Request_users();
            },
            err => this.utility.handle_error_message(err)
          );
        }
      });
    }
  }

  public Request_change_role(user, role){
    let item_string = user + ', ' + role;
    this.dialog.open_confirmation_dialog('Are you sure you want to CHANGE the role of this user?', item_string).subscribe(result => {
      if(result){
        this.api.user_change_role({'username':user,'new_role':role}).subscribe(
          res => {
            this.utility.handle_error_message(res),
            this.Request_users();
          },
          err => this.utility.handle_error_message(err)
        );
      }
    });
  }

  public Request_delete_user(username){
    this.dialog.open_confirmation_dialog('Are you sure you want to DELETE this user?', username).subscribe(result => {
      if(result){
        this.api.delete_user({'username':username}).subscribe(
          res => {
            this.utility.handle_error_message(res),
            this.Request_users();
            this.user_selected = false;
          },
          err => this.utility.handle_error_message(err)
        );
      }
    });
  }


}
