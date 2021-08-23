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
  columnOneToggle: boolean = true;
  columnTwoToggle: boolean = false; // Boolean to toggle between 2 and 3 column mode.
  columnThreeToggle: boolean = true;
  fourColumnMode: boolean = false;
  playground_column: boolean = false;
  multiplayer_column: boolean = false;
  
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
  current_author : string = 'Ennius';
  current_book : string = 'Thyestes';
  current_editor : string = 'TRF';
  current_editors : object;
  current_fragment : string = '0';


  pressed_fragment_name : string = '';
  pressed_fragment_editor : string = '';

  primary_fragments : object;
  secondary_fragments : object;

  selectedEditor : number;
  selectedFragment : number;
  selectedLine : number;

  // Allows for notes to be added on screen
  note : string = '';
  noteArray : Array<string> = [];

  // This array contains all the information from a specific book. Functions can use this data.
  selectedEditorArray = [];
  mainEditorArray = [];
  
  // Four column mode variables
  editor1 = [];
  editor2 = [];
  editor3 = [];
  editor4 = [];

  // Used as the identifier of a fragment
  referencer : number = 0;
   
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
    this.RequestEditors(this.current_author, this.current_book);
    this.Request_primary_column(this.current_author, this.current_book, this.current_editor);
    // When init is done, turn off the loading bar (spinner)
    this.spinner = false;  

    //FIXME: this should be handled within the multiplayer class? It wont call the constructor
    this.multiplayer.InitiateFirestore(this.multiplayer.sessionCode, this.multiplayer.tableName); 
  }

  /**
   * Data request fuctions. These will call the API, which will get the data from the server 
   */
  public RequestEditors(author: string, book: string){
    this.api.GetEditors(author, book).subscribe(
      data => {
        this.current_editors = data;
      }
    );
  }

  public Request_primary_column(author: string, book: string, editor: string){
    this.api.GetFragments(author, book, editor).subscribe(
      data => { this.primary_fragments = data; });  
  }

  public Request_secondary_column(author: string, book: string, editor: string){
    this.api.GetFragments(author, book, editor).subscribe(
      data => { this.secondary_fragments = data; });  
  }

  public RequestBooks(author: string){
    this.api.GetBooks(author).subscribe(
      data => {
        this.booksJSON = data;
      }
    );      
  }

  public RequestCommentaries(fragment_id: string){
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

  public Login() {
    const dialogRef = this.matdialog.open(LoginComponent);
  }

  // Opens dialog to select a new book
  public OpenBookSelect() {
    let dialogRef = this.matdialog.open(this.CallBookSelect); 
  }

  public Test(){
    console.log(this.f_context)
    // let item = this.api.Couch()
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

