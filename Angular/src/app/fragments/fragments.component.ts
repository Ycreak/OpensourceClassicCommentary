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

  // Toggle switches for the HTML columns/modes
  toggle_column_one: boolean = true;
  toggle_column_two: boolean = false;
  toggle_column_three: boolean = false;
  toggle_column_four: boolean = false;
  toggle_commentary: boolean = true;
  toggle_playground: boolean = false;
  toggle_multiplayer: boolean = false;
  // Booleans for HTML related items
  spinner: boolean = false; // Boolean to toggle the spinner.
  noCommentary: boolean = false; // Shows banner if no commentary is available.
  // Objects to store the retrieved authors, books and editors to control server data retrieval 
  retrieved_authors : object; // JSON that contains all available Authors and their data.
  retrieved_books : object; // JSON that contains all available Books and their data given a specific editor.
  retrieved_editors : object; // JSON that contains all available Editors and their data for a specific book.
  // Global Class Variables with text data corresponding to the front-end text fields.
  f_commentary : object;
  f_apparatus : object;
  f_translation : object;
  f_context : object;
  f_differences : object;
  f_reconstruction : object;
  // Variable to store the fragment numbers from a given Author, Book and Editor
  retrieved_fragment_numbers : object;
  // Data regarding the currently pressed fragment. TODO: Should be done in a nice object.
  pressed_fragment_name : string = 'TBA';
  pressed_fragment_editor : string = 'TBA';
  // Object to store all column data. TODO: should be rethought.
  column_data : object = {
    column1 : {
      author : 'Ennius',
      book : 'Thyestes',
      editor : 'TRF',
      fragments : '',
    },
    column2 : {
      author : '',
      book : '',
      editor : '',
      fragments : '',
    },
    column3 : {
      author : '',
      book : '',
      editor : '',
      fragments : '',
    },
    column4 : {
      author : '',
      book : '',
      editor : '',
      fragments : '',
    },
    playground : {
      author : '',
      book : '',
      editor : '',
      fragments : '',
    },
    playground2 : {
      author : '',
      book : '',
      editor : '',
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
    this.api.GetAuthors().subscribe(data => this.retrieved_authors = data);
    // Retrieves everything surrounding the text.
    this.RequestEditors('Ennius', 'Thyestes'); // Retrieve at default the Ennius' Thyestes text.
    this.Request_fragments('Ennius', 'Thyestes', 'TRF', 'column1');
    //FIXME: this should be handled within the multiplayer class? It wont call the constructor
    this.multiplayer.InitiateFirestore(this.multiplayer.sessionCode, this.multiplayer.tableName); 
  }

  //   _____  ______ ____  _    _ ______  _____ _______ _____ 
  //  |  __ \|  ____/ __ \| |  | |  ____|/ ____|__   __/ ____|
  //  | |__) | |__ | |  | | |  | | |__  | (___    | | | (___  
  //  |  _  /|  __|| |  | | |  | |  __|  \___ \   | |  \___ \ 
  //  | | \ \| |___| |__| | |__| | |____ ____) |  | |  ____) |
  //  |_|  \_\______\___\_\\____/|______|_____/   |_| |_____/  
  /**
   * Requests the API function for books given the author.
   * @param author 
   * @returns data -> this.retrieved_books 
   * @author Bors & Ycreak
   */
  public RequestBooks(author: string){
    this.api.GetBooks(author).subscribe(
      data => {
        this.retrieved_books = data;
      }
    );      
  }
  /**
   * Requests the API function for editors given the author and book.
   * @param author
   * @param book 
   * @returns data -> this.retrieved_editors 
   * @author Bors & Ycreak
   */
  public RequestEditors(author: string, book: string){
    this.api.GetEditors(author, book).subscribe(
      data => {
        this.retrieved_editors = data;
      }
    );
  }

  /**
   * Requests the API function for fragments given the author, book and editor.
   * @param author
   * @param book
   * @param editor 
   * @returns Object with fragments that are sorted numerically and on their status. Also
   *          adds an HTML formatted string to the object for easy printing.
   * @author Bors & Ycreak
   */
  public Request_fragments(author: string, book: string, editor: string, column: string){
    this.api.GetFragments(author, book, editor).subscribe(
      data => { 
        // Format the data just how we want it
        data = this.Add_HTML_to_lines(data);
        data = data.sort(this.utility.SortFragmentsArrayNumerically);
        data = this.Sort_fragments_on_status(data);
        // Store it at the correct place
        this.column_data[column].fragments = data;
        // While we are at it, save the fragment numbers
        this.retrieved_fragment_numbers = this.Retrieve_fragment_numbers(data);
      });  
  }

  /** 
   * Requests the API function for all content corresponding to the given fragment id.
   * @param fragment_id 
   * @returns fills all content variables with data. e.g. data -> this.f_commentary 
   * @author Bors & Ycreak
   * TODO: this can be done with a single request
   */
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

  /**
   * Given an object with fragments, returns a list of all fragment names.
   * @param fragments object 
   * @returns list of all fragment names 
   * @author Ycreak
   */
  public Retrieve_fragment_numbers(fragments){    
    let number_list = []
    for(let fragment in fragments){
      number_list.push(fragments[fragment].fragment_name)
    }
    return number_list
  }

  /**
   * Function to handle what happens when an author is selected in HTML.
   * @param column current column in which the action is happening
   * @param author selected by the user
   * @author Ycreak
   */
  public Handle_author_selection(column: string, author: string){
    this.column_data[column].author = author;
    this.column_data[column].book = 'TBA';
    this.column_data[column].editor = 'TBA';
    this.RequestBooks(author);
  }

  /**
   * Function to handle what happens when a book is selected in HTML.
   * @param column current column in which the action is happening
   * @param book selected by the user
   * @author Ycreak
   */
  public Handle_book_selection(column: string, book: string){
    this.column_data[column].book = book;
    this.column_data[column].editor = 'TBA';
    this.RequestEditors(this.column_data[column].author, book);
  }

  /**
   * Function to handle what happens when an editor is selected in HTML.
   * @param column current column in which the action is happening
   * @param editor selected by the user
   * @author Ycreak
   */
  public Handle_editor_selection(column: string, editor: string){
    this.column_data[column].editor = editor;
    this.Request_fragments(this.column_data[column].author, this.column_data[column].book, editor, column)
  }

  /**
   * Function to handle what happens when a fragment is selected in HTML.
   * @param column current column in which the action is happening
   * @param fragment selected by the user
   * @author Ycreak
   * TODO: pressed fragment should be an object initialised at startup
   */
  public Handle_fragment_click(fragment){
      this.pressed_fragment_name = fragment.fragment_name;
      this.pressed_fragment_editor = fragment.editor;
      this.RequestCommentaries(fragment.id)
  }

  /**
   * Function to handle the login dialog
   * @author Ycreak
   */
  public Login() {
    const dialogRef = this.matdialog.open(LoginComponent);
  }

  /**
   * Test function
   * @author Ycreak
   */  
  public Test(){
    console.log('TEST', this.column_data)
  }

  /**
   * This function adds HTML to the lines of the given array. Simply put, it inserts every
   * line number and its content in an HTML paragraph for easy insertion in HTML.
   * @param array with fragments as retrieved from the server
   * @returns updated array with nice HTML formatting included
   * @author Ycreak
   */
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
        // Now push the updated lines to the correct place
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

  /**
   * Sorts the given object of fragments on status. First we want those without a specified
   * status, then we want those that are incertum and lastly those that are adespota.
   * @param fragments 
   * @returns fragments in the order we want
   * @author Ycreak
   */    
  public Sort_fragments_on_status(fragments){
    let normal = this.utility.FilterObjOnKey(fragments, 'status', "")
    let incerta = this.utility.FilterObjOnKey(fragments, 'status', 'Incertum')
    let adesp = this.utility.FilterObjOnKey(fragments, 'status', 'Adesp.')
    // Concatenate in the order we want (i'm a hacker)
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

