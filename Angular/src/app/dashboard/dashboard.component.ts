// Core system components
import { Component, OnInit} from '@angular/core';
import {Inject} from '@angular/core';
import { Observable } from 'rxjs';

// Service and utility imports
import { ApiService } from '../api.service';
import { UtilityService } from '../utility.service';
import { AuthService } from '../auth/auth.service';
import { DialogService } from '../services/dialog.service';

// To allow the use of forms
import { FormBuilder } from '@angular/forms';
import { ReactiveFormsModule, FormControl, FormGroup, Validators, FormArray } from '@angular/forms';

import {MatButtonModule} from '@angular/material/button';


// Mat imports
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

// Model imports to send to the API. 
import { Author } from '../models/Author';
import { Book } from '../models/Book';
import { Editor } from '../models/Editor';
import { Fragment } from '../models/Fragment';
import { Context } from '../models/Context';
import { Translation } from '../models/Translation';
import { Apparatus } from '../models/Apparatus';
import { Differences } from '../models/Differences';
import { Commentary } from '../models/Commentary';
import { Reconstruction } from '../models/Reconstruction';
// import { Bibliography } from '../models/Bibliography';

// Third party imports
// NPM Library. Hopefully not soon deprecated
import insertTextAtCursor from 'insert-text-at-cursor';

// npm i angular-onscreen-material-keyboard
import { IKeyboardLayouts, keyboardLayouts, MAT_KEYBOARD_LAYOUTS, MatKeyboardModule } from 'angular-onscreen-material-keyboard';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  selected_author : string = 'Ennius';
  selected_book : string = 'Thyestes';
  selected_editor : string = 'TRF';

  retrieved_authors : object;
  retrieved_books : object;
  retrieved_editors : object;

  retrieved_fragment : object;
  retrieved_fragments : object;
  retrieved_fragment_numbers : object;

  fragmentForm: FormGroup;

  possible_status = ['normal', 'incertum', 'adesp.']

  // User dashboard
  isChecked = false;
  temp = ''
  hide : boolean = true;
  change_password_form = this.formBuilder.group({
    password1: '',
    password2: '',
  });

  retrieved_users : object;
  selected_user : string = '';
  user_selected : boolean = false; // controls user deletion button
  new_user : string = '';
  new_user_password : string = '';

  // Whether a fragment is selected
  fragment_selected : boolean = false;
  allow_fragment_creation = false;

  constructor(
    private api: ApiService,
    private utility: UtilityService,
    public dialog: DialogService,
    private formBuilder: FormBuilder,
    public authService: AuthService,
    ) {}
  /**
   * On Init, we just load the list of authors. From here, selection is started
   */
  ngOnInit(): void {
    this.RequestAuthors()
    // this.Request_users()
    // Initialise the fragment form. TODO: can we do this somewhere else?
    this.fragmentForm = this.formBuilder.group({
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
      linked_fragments: '',
      status: '',
      lock: 0,
    });
  }

  /**
   * Simple test function, can be used for whatever
   * @param thing item to be printed
   */
  public Test(thing){
    console.log(thing)
    console.log(this.fragmentForm.value.lock)
  }

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
    this.api.Get_specific_fragment(fragment_id).subscribe(
      data => { 
        this.retrieved_fragment = data;
        this.Update_content_form(this.retrieved_fragment)
        // console.log('selected fragment', data)
      });  
  }

  public Clean_fragment_content(){
    // Clears context and lines
    this.clear_fields()

    this.UpdateForm('fragmentForm','translation', '');
    this.UpdateForm('fragmentForm','differences', '');
    this.UpdateForm('fragmentForm','commentary', '');
    this.UpdateForm('fragmentForm','apparatus', '');
    this.UpdateForm('fragmentForm','reconstruction', '');
  }

  public Update_content_form(fragment){
  
    // FIXME: This should be done using a for loop
    this.UpdateForm('fragmentForm','_id', fragment._id);
    this.UpdateForm('fragmentForm','fragment_name', fragment.fragment_name);
    this.UpdateForm('fragmentForm','author', fragment.author);
    this.UpdateForm('fragmentForm','title', fragment.title);
    this.UpdateForm('fragmentForm','editor', fragment.editor);
    this.UpdateForm('fragmentForm','translation', fragment.translation);
    this.UpdateForm('fragmentForm','differences', fragment.differences);
    this.UpdateForm('fragmentForm','commentary', fragment.commentary);
    this.UpdateForm('fragmentForm','apparatus', fragment.apparatus);
    this.UpdateForm('fragmentForm','reconstruction', fragment.reconstruction);
    this.UpdateForm('fragmentForm','linked_fragments', fragment.linked_fragments);
    this.UpdateForm('fragmentForm','status', fragment.status);
    this.UpdateForm('fragmentForm','lock', fragment.lock);

    for (let item in fragment.context){
      this.addItem2(fragment.context[item].author, fragment.context[item].location, fragment.context[item].text)
    }

    for (let item in fragment.lines){
      this.addItem('line_number', 'text', fragment.lines[item].line_number, fragment.lines[item].text, 'lines')
    }

  }

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

  Reset_form(){
    this.fragmentForm.reset();
    this.clear_fields();
  }

  clear_fields(){
    let context = this.fragmentForm.get('context') as FormArray
    let lines = this.fragmentForm.get('lines') as FormArray

    context.clear()
    lines.clear()
  }

  addItem(field1, field2, content1, content2, target): void {
    let items = this.fragmentForm.get(target) as FormArray;
    items.push(
      
      this.formBuilder.group({
        [field1]: content1,
        [field2]: content2,
      })
      
    );
  }

  addItem2(content1, content2, content3): void {
    let items = this.fragmentForm.get('context') as FormArray;
    items.push(
      
      this.formBuilder.group({
        author: content1,
        location: content2,
        text: content3,
      })
      
    );
  }

  removeItem(target: string, index: number) {
    let items = this.fragmentForm.get(target) as FormArray;
    items.removeAt(index);
  }

  public Request_fragment_lock(form){
    
    let lock_status = (form.lock ? 1 : 0);
        
    this.api.Update_fragment_lock({'fragment_id': form._id, 'lock_status': lock_status}).subscribe(
      res => this.utility.HandleErrorMessage(res), err => this.utility.HandleErrorMessage(err)
    );  
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
  public RequestAuthors(){
    this.api.GetAuthors().subscribe(
      data => this.retrieved_authors = data,
      err => this.utility.HandleErrorMessage(err),
    );      
  }

  public RequestBooks(author: string){
    this.api.GetBooks(author).subscribe(
      data => {
        this.retrieved_books = data;
      }
    );      
  }

  public RequestEditors(author: string, book: string){
    this.api.GetEditors(author, book).subscribe(
      data => {
        this.retrieved_editors = data;
      }
    );
  }

  public Request_fragments(author: string, book: string, editor: string){
    this.api.GetFragments(author, book, editor).subscribe(
      data => { 
        this.retrieved_fragments = data;
        this.retrieved_fragment_numbers = this.Retrieve_fragment_numbers(data);
      });  
  }

  public Request_revise_fragment(fragment){
    // If the fragment is locked and the user is not a teacher, we will not allow this operation.
    if(fragment.lock && !this.authService.is_teacher){
      this.utility.OpenSnackbar('This fragment is locked.')
    }
    else{
      let item_string = fragment.author + ', ' +  fragment.title + ', ' + fragment.editor + ': ' + fragment.fragment_name

      this.dialog.OpenConfirmationDialog('Are you sure you want to REVISE this fragment?', item_string).subscribe(result => {
        if(result){
          this.api.Revise_fragment(fragment).subscribe(
            res => this.utility.HandleErrorMessage(res), err => this.utility.HandleErrorMessage(err)
          );
        }
      });
      this.Reset_form();
    }
  }

  public Request_create_fragment(fragment){
    let item_string = fragment.author + ', ' +  fragment.title + ', ' + fragment.editor + ': ' + fragment.fragment_name

    this.dialog.OpenConfirmationDialog('Are you sure you want to CREATE this fragment?', item_string).subscribe(result => {
      if(result){
        this.api.Create_fragment(fragment).subscribe(
          res => this.utility.HandleErrorMessage(res), err => this.utility.HandleErrorMessage(err)
        );
      }
    });
    // Now reset form and request the fragments again
    this.Reset_form();
    this.Request_fragments(this.selected_author, this.selected_book, this.selected_editor);
  }

  public Request_delete_fragment(fragment){
    let item_string = fragment.author + ', ' +  fragment.title + ', ' + fragment.editor + ': ' + fragment.fragment_name
    
    this.dialog.OpenConfirmationDialog('Are you sure you want to DELETE this fragment?', item_string).subscribe(result => {
      if(result){
        this.api.Delete_fragment({'fragment_id':fragment._id}).subscribe(
          res => this.utility.HandleErrorMessage(res), err => this.utility.HandleErrorMessage(err)
        );
      }
    });
    // Now reset form and request the fragments again
    this.Reset_form();
    this.Request_fragments(this.selected_author, this.selected_book, this.selected_editor);
  }

  // USER DASHBOARD
  public Request_change_password(form){
    if(form.password1 == form.password2){
      this.dialog.OpenConfirmationDialog('Are you sure you want to CHANGE your password', this.authService.logged_user).subscribe(result => {
        if(result){
          this.api.User_change_password({'username':this.authService.logged_user,'new_password':form.password1}).subscribe(
            res => this.utility.HandleErrorMessage(res), err => this.utility.HandleErrorMessage(err)
          );
        }
      });
    }
    else{
      this.utility.OpenSnackbar('Passwords do not match.');
    }
  }

  public Request_users(){
    this.api.Get_users().subscribe(
      data => this.retrieved_users = data,
      err => this.utility.HandleErrorMessage(err),
    );      
  }

  public Request_create_user(new_user, new_password){

    if(new_user == '' || new_password == ''){
      this.utility.OpenSnackbar('Please provide proper details');
    }
    else{
      this.dialog.OpenConfirmationDialog('Are you sure you want to CREATE this user?', new_user).subscribe(result => {
        if(result){
          this.api.Create_user({'username':new_user,'password':new_password}).subscribe(
            res => {
              this.utility.HandleErrorMessage(res),
              this.Request_users();
            },
            err => this.utility.HandleErrorMessage(err)
          );
        }
      });
    }
  }

  public Request_change_role(user, role){
    let item_string = user + ', ' + role;
    this.dialog.OpenConfirmationDialog('Are you sure you want to CHANGE the role of this user?', item_string).subscribe(result => {
      if(result){
        this.api.User_change_role({'username':user,'new_role':role}).subscribe(
          res => {
            this.utility.HandleErrorMessage(res),
            this.Request_users();
          },
          err => this.utility.HandleErrorMessage(err)
        );
      }
    });
  }

  public Request_delete_user(username){
    this.dialog.OpenConfirmationDialog('Are you sure you want to DELETE this user?', username).subscribe(result => {
      if(result){
        this.api.Delete_user({'username':username}).subscribe(
          res => {
            this.utility.HandleErrorMessage(res),
            this.Request_users();
            this.user_selected = false;
          },
          err => this.utility.HandleErrorMessage(err)
        );
      }
    });
  }


}
