import { Component, OnInit, ViewEncapsulation } from '@angular/core';

import {LoginComponent} from '../login/login.component'

import { ApiService } from '../api.service';
import { DialogService } from '../services/dialog.service';
import { UtilityService } from '../utility.service';
import { AuthService } from '../auth/auth.service';
import { Multiplayer } from './multiplayer.class';
import { Playground } from './playground.class';

// FIXME: why do i need to export this class?
export { Multiplayer } from './multiplayer.class';
export { Playground } from './playground.class';

// Library used for interacting with the page
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

// To allow dialog windows within the current window
import { TemplateRef, ViewChild } from '@angular/core';
// Imports of different components to be shown within a dialog within the page

@Component({
  selector: 'app-fragments',
  templateUrl: './fragments.component.html',
  styleUrls: ['./fragments.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class FragmentsComponent implements OnInit {

  @ViewChild('CallBookSelect') CallBookSelect: TemplateRef<any>;
  @ViewChild('CallAbout') CallAbout: TemplateRef<any>;

  // Toggle switches
  toggle_column_one: boolean = true;
  toggle_column_two: boolean = false;
  toggle_column_three: boolean = false;
  toggle_column_four: boolean = false;
  toggle_commentary: boolean = true;
  toggle_playground: boolean = false;
  toggle_multiplayer: boolean = false;
  
  spinner: boolean = true; // Boolean to toggle the spinner.
  noCommentary: boolean = false; // Shows banner if no commentary is available.

  authorsJSON : object; // JSON that contains all available Authors and their data.
  editorsJSON : object; // JSON that contains all available Editors and their data for a specific book.
  booksJSON : object; // JSON that contains all available Books and their data given a specific editor.
    
  // Global Class Variables with text data corresponding to the front-end text fields.
  f_commentary : object;
  f_apparatus : object;
  f_translation : object;
  f_context : object;
  f_differences : object;
  f_reconstruction : object;
  // Variables with currentAuthor, Book and Editor. Mostly placeholder data.
  retrieved_author : string = 'Ennius';
  retrieved_book : string = 'Thyestes';
  retrieved_editor : string = 'TRF';
  retrieved_editors : object;
  retrieved_fragments : object;
  retrieved_fragment_numbers : object;

  pressed_fragment_name : string = '';
  pressed_fragment_editor : string = '';

  column_data = {
    column1 : {
      author : 'Ennius',
      book : 'Thyestes',
      editor : 'TRF',
      fragments : '',
    },
    column2 : {
      author : 'Accius',
      book : 'Antigone',
      editor : 'Janssen',
      fragments : '',
    },
    column3 : {
      author : 'Accius',
      book : 'Antigone',
      editor : 'Janssen',
      fragments : '',
    },
    column4 : {
      author : 'Accius',
      book : 'Antigone',
      editor : 'Janssen',
      fragments : '',
    },
    playground : {
      author : 'Accius',
      book : 'Antigone',
      editor : 'Janssen',
      fragments : '',
    },
    playground2 : {
      author : 'Accius',
      book : 'Antigone',
      editor : 'Janssen',
      fragments : '',
    },     
  }
  // Allows for notes to be added on screen
  note : string = '';
  noteArray : Array<string> = [];
  
  constructor(
    private api: ApiService,
    private utility: UtilityService,
    public authService: AuthService,
    public dialog: DialogService,
    private matdialog: MatDialog, 
    public multiplayer: Multiplayer,
    public playground: Playground,
    ) { }

  ngOnInit(): void {
    // Request a list of authors to select a different text    
    this.api.GetAuthors().subscribe(data => this.authorsJSON = data);
    // Retrieves everything surrounding the text. TODO. Needs fixing
    this.RequestEditors(this.retrieved_author, this.retrieved_book);
    this.Request_fragments(this.retrieved_author, this.retrieved_book, this.retrieved_editor, 'column1');
    // When init is done, turn off the loading bar (spinner)
    this.spinner = false;  

    //FIXME: this should be handled within the multiplayer class? It wont call the constructor
    this.multiplayer.InitiateFirestore(this.multiplayer.sessionCode, this.multiplayer.tableName); 
  }

  /**
   * Data request fuctions. These will call the API, which will get the data from the server 
   */
  public RequestBooks(author: string){
    this.api.GetBooks(author).subscribe(
      data => {
        this.booksJSON = data;
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

  public Request_fragments(author: string, book: string, editor: string, column: string){
    this.api.GetFragments(author, book, editor).subscribe(
      data => { 
        data = this.Add_HTML_to_lines(data);
        data = this.Sort_fragments_numerically(data);
        console.log('data1', data)
        data = this.Sort_fragments_on_status(data);
        console.log('data2', data)

        this.column_data[column].fragments = data;
        this.retrieved_fragment_numbers = this.Retrieve_fragment_numbers(data);
      });  
  }

  public Retrieve_fragment_numbers(fragments){    
    let number_list = []

    for(let fragment in fragments){
      number_list.push(fragments[fragment].fragment_name)
    }
    return number_list
  }

  public RequestCommentaries(fragment_id: string){ //TODO: this can be done with a single request!
    // Retrieves Fragment Commentary    
    this.api.GetCommentary(fragment_id).subscribe(data => this.f_commentary = data);
    // Retrieves Fragment Differences
    this.api.GetDifferences(fragment_id).subscribe(data => this.f_differences = data);
    // Retrieves Fragment Context
    this.api.GetContext(fragment_id).subscribe(data => this.f_context = data);
    // Retrieves Fragment Translation
    this.api.GetTranslation(fragment_id).subscribe(data => this.f_translation = data);
    // Retrieves Fragment App. Crit.
    this.api.GetApparatus(fragment_id).subscribe(data => this.f_apparatus = data);
    // Retrieves Fragment Reconstruction
    this.api.GetReconstruction(fragment_id).subscribe(data => this.f_reconstruction = data);
  }

  public Handle_author_selection(column: string, author: string){
    // Simple handler function to handle what should happen when an author is selected
    this.column_data[column].author = author;
    this.column_data[column].book = 'TBA';
    this.column_data[column].editor = 'TBA';
    this.RequestBooks(author);
  }

  public Handle_book_selection(column: string, book: string){
    // Simple handler function to handle what should happen when a book is selected
    this.column_data[column].book = book;
    this.column_data[column].editor = 'TBA';
    this.RequestEditors(this.column_data[column].author, book);
  }

  public Handle_editor_selection(column: string, editor: string){
    // Simple handler function to handle what should happen when an editor is selected
    this.column_data[column].editor = editor;
    this.Request_fragments(this.column_data[column].author, this.column_data[column].book, editor, column)
  }

  public Handle_fragment_click(fragment){
      this.pressed_fragment_name = fragment.fragment_name;
      this.pressed_fragment_editor = fragment.editor
      this.RequestCommentaries(fragment.id)
  }

  public Login() {
    const dialogRef = this.matdialog.open(LoginComponent);
  }

  // Opens dialog to select a new book
  public OpenBookSelect() {
    let dialogRef = this.matdialog.open(this.CallBookSelect); 
  }

  public Test(){
    console.log('TEST', this.column_data)
  }

  public Add_HTML_to_lines(array){        
    // For each element in the given array
    for(let fragment in array){
      // Loop through all fragments      
      let current_fragment =  array[fragment]
      for(let item in current_fragment.lines){
        // Loop through all lines of current fragment
        let line_number = current_fragment.lines[item].line_number;
        let line_text = current_fragment.lines[item].text;
        let line_complete = '<p>' + line_number + ': ' + line_text + '</p>';

        let updated_lines = {
          'line_number': line_number,
          'text': line_text,
          'line_complete': line_complete,
        }
        current_fragment.lines[item] = updated_lines;
      }
    }
    return array
  }

  public Sort_fragments_numerically(fragments){
    // // Sort the lines in array, needs to be own function
    // console.log('inc', fragments)
    // fragments.sort((a,b) => a.fragment_name.localeCompare(b.fragment_name));
    
    fragments.sort(this.utility.SortFragmentsArrayNumerically);

    console.log('sorted', fragments)
    // for(let fragment in fragments){
    //   console.log('fr', fragments[fragment] )
    //   fragments[fragment].sort(this.utility.SortFragmentsArrayNumerically);
    // }
    return fragments
  }
    
  public Sort_fragments_on_status(fragments){
    // // Put normal fragments first, then incerta and then adespota.
    let normal = this.utility.FilterObjOnKey(fragments, 'status', "")
    let incerta = this.utility.FilterObjOnKey(fragments, 'status', 'Incertum')
    let adesp = this.utility.FilterObjOnKey(fragments, 'status', 'Adesp.')

    console.log(normal, incerta, adesp)
    // // Concatenate in the order we want (i'm a hacker)
    fragments = normal.concat(incerta).concat(adesp)

    return fragments
  }  
}

// Simple class to open the about information written in said html file.
@Component({
  selector: 'about-dialog',
  templateUrl: '../dialogs/about-dialog.html',
})
export class ShowAboutDialog {}

@Component({
  selector: 'bibliography-dialog',
  templateUrl: '../dialogs/bibliography-dialog.html',
})
export class ShowBibliographyDialog {}

