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
import { Bibliography } from '../models/Bibliography';

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
  // JSON that contain all retrieved data. Does what it says on the tin. //FIXME: Type
  authorsJSON; 
  editorsJSON; 
  // mainEditorsJSON : JSON; 
  booksJSON;
  // bibJSON;
  // Data variables holding the corresponding retrieved data. //FIXME: Type
  // F_Fragments;
  // F_Context;
  // F_Commentary;
  // F_Apparatus;
  // F_Translation;
  // F_Differences;
  // F_ReferencerID;
  // F_Reconstruction;
  // // Lists to store temporary data
  // selectedEditorArray = [];
  // fragmentNumberList = [];
  // lineNumberList = [];
  // These variables hold the selected items //FIXME: Type

  // current_author : string = 'Ennius';
  // current_book : string = 'Thyestes';
  // current_editor : string = 'TRF';
  // current_editors : object;
  // current_fragment : JSON;

  retrieved_author : string = 'Ennius';
  retrieved_book : string = 'Thyestes';
  retrieved_editor : string = 'TRF';
  retrieved_editors : object;
  retrieved_fragments : object;
  retrieved_fragment_numbers : object;

  requested_fragment : string = '';
  retrieved_fragment : object;

  fragmentForm: FormGroup;


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
    this.api.GetAuthors().subscribe(data => this.authorsJSON = data); //FIXME: should be requestAuthors?
  
    // this.api.Get_specific_fragment('f6b02690600d32acf283f1cb120134b5').subscribe(
    //   data => { 
    //     this.retrieved_fragment = data;
    //     this.Update_content_form(this.retrieved_fragment)
    //     // console.log('selected fragment', data)
    //   }); 
      
    this.fragmentForm = this.formBuilder.group({
      _id: '',
      fragment_name: '',
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
    });

  }



  /**
   * Updates a value of a key in the given form
   * @param form what form is to be updated
   * @param key what field is to be updated
   * @param value what value is to be written
   */
  public UpdateForm(form, key, value) {
    this[form].patchValue({[key]: value});
  }
  /**
   * Simple test function, can be used for whatever
   * @param thing item to be printed
   */
  public Test(){
    console.log('test', this.fragmentForm.value.context)
  }

  public RequestBooks(author: string){
    this.api.GetBooks(author).subscribe(
      data => {
        this.booksJSON = data;
        console.log('book', data)
      }
    );      
  }

  public RequestEditors(author: string, book: string){
    this.api.GetEditors(author, book).subscribe(
      data => {
        this.retrieved_editors = data;
        console.log('edit', this.retrieved_editors)
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
    // Now, get this fragment from the server TODO:
    this.api.Get_specific_fragment(fragment_id).subscribe(
      data => { 
        this.retrieved_fragment = data;
        this.Update_content_form(this.retrieved_fragment)
        console.log('selected fragment', data)
      });  
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
    // this.UpdateForm('fragmentForm','context', fragment.context);
    // this.UpdateForm('fragmentForm','lines', fragment.lines);
    this.UpdateForm('fragmentForm','linked_fragments', fragment.linked_fragments);
    this.UpdateForm('fragmentForm','status', fragment.status);
  
    for (let item in fragment.context){
      this.addItem2(fragment.context[item].author, fragment.context[item].location, fragment.context[item].text)
    }

    for (let item in fragment.lines){
      this.addItem('line_number', 'text', fragment.lines[item].line_number, fragment.lines[item].text, 'lines')
    }

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

  public Request_revise_fragment(fragment){
    this.api.Revise_fragment(fragment).subscribe(
      res => this.utility.HandleErrorMessage(res), err => this.utility.HandleErrorMessage(err)
    );   
  }

  public Request_create_fragment(fragment){
    this.api.Create_fragment(fragment).subscribe(
      res => this.utility.HandleErrorMessage(res), err => this.utility.HandleErrorMessage(err)
    );
  }

  public Request_delete_fragment(fragment){
    this.api.Delete_fragment({fragment_id:fragment._id}).subscribe(
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
      data => this.authorsJSON = data,
      err => this.utility.HandleErrorMessage(err),
    );      
  }

  // /**
  //  * Requests all fragments from a given book
  //  * @param book number of book who's fragments are requested
  //  */
  // public RequestFragments(editor: string){
  //   this.api.GetFragments(this.current_author, this.current_book, editor).subscribe(
  //     data => this.F_Fragments = data,
  //     err => this.utility.HandleErrorMessage(err),
  //   );  
  // }

}
