// Library imports
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog'; // Library used for interacting with the page
import { TemplateRef, ViewChild } from '@angular/core'; // To allow dialog windows within the current window

// Imports of components, models and services
import {LoginComponent} from '../login/login.component'
import { ApiService } from '../api.service';
import { DialogService } from '../services/dialog.service';
import { UtilityService } from '../utility.service';
import { AuthService } from '../auth/auth.service';
import { Multiplayer } from './multiplayer.class';
import { Playground } from './playground.class';

import { Fragment } from '../models/Fragment';

// FIXME: why do i need to export this class?
export { Multiplayer } from './multiplayer.class';
export { Playground } from './playground.class';

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
  toggle_column_two: boolean = true;
  toggle_column_three: boolean = true;
  toggle_column_four: boolean = false;
  toggle_commentary: boolean = false;
  toggle_playground: boolean = false;
  toggle_multiplayer: boolean = false;
  // Booleans for HTML related items
  spinner: boolean = false; // Boolean to toggle the spinner.
  server_down: boolean = true; // to indicate server failure
  // Objects to store the retrieved authors, books and editors to control server data retrieval 
  retrieved_authors : object; // JSON that contains all available Authors and their data.
  retrieved_books : object; // JSON that contains all available Books and their data given a specific editor.
  retrieved_editors : object; // JSON that contains all available Editors and their data for a specific book.
  // Global Class Variables with text data corresponding to the front-end text fields.
  current_fragment : Fragment;
  fragment_clicked : boolean = false;
  // Variable to store the fragment numbers from a given Author, Book and Editor
  retrieved_fragment_numbers : object;
  // Object to store all column data. TODO: should be rethought.
  column_data : object = {
    column1 : {
      author : '',
      book : '',
      editor : '',
      fragments : [],
    },
    column2 : {
      author : '',
      book : '',
      editor : '',
      fragments : [],
    },
    column3 : {
      author : '',
      book : '',
      editor : '',
      fragments : [],
    },
    column4 : {
      author : '',
      book : '',
      editor : '',
      fragments : [],
    },
    playground : {
      author : '',
      book : '',
      editor : '',
      fragments : [],
    },
    playground2 : {
      author : '',
      book : '',
      editor : '',
      fragments : [],
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
    // Create an empty current fragment to be filled by clicking
    this.current_fragment = new Fragment({});
    // Request a list of authors to select a different text    
    this.api.GetAuthors().subscribe(data => this.retrieved_authors = data);
    // Retrieves everything surrounding the text.
    this.RequestEditors('Ennius', 'Thyestes'); // Retrieve at default the Ennius' Thyestes text.
    // this.Request_fragments('Ennius', 'Thyestes', 'TRF', 'column1');
    // this.Request_fragments('Ennius', 'Thyestes', 'Ribbeck', 'column2');
    // this.Request_fragments('Ennius', 'Thyestes', 'Jocelyn', 'column3');
    // this.Request_fragments('Ennius', 'Thyestes', 'Vahlen', 'column4');
    this.Request_fragments('Accius', 'Aegisthus', 'Dangel', 'column1');
    this.Request_fragments('Accius', 'Aegisthus', 'Ribbeck', 'column2');
    this.Request_fragments('Accius', 'Aegisthus', 'Warmington', 'column3');
    //FIXME: this should be handled within the multiplayer class? It wont call the constructor
    // this.multiplayer.InitiateFirestore(this.multiplayer.sessionCode, this.multiplayer.tableName); 
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
        this.server_down = false; //FIXME: needs to be handled properly
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
        let fragment_list = this.create_fragment_list(data);
        // Format the data just how we want it
        fragment_list = this.Add_HTML_to_lines(fragment_list);
        fragment_list = fragment_list.sort(this.utility.SortFragmentsArrayNumerically);
        fragment_list = this.Sort_fragments_on_status(fragment_list);
        // Store it at the correct place
        this.column_data[column].fragments = fragment_list;
        // While we are at it, save the fragment numbers
        this.retrieved_fragment_numbers = this.Retrieve_fragment_numbers(fragment_list);
      }
    );  
  }

  /**
   * Creates a list of typescript fragment objects using the json received from the server
   * @param fragment_json which is received from the server
   * @returns list of Fragment objects
   */
  public create_fragment_list(fragment_json: JSON){
    let fragment_list = [];
    for(let index in fragment_json){
      fragment_list.push(new Fragment(fragment_json[index]))
    }
    return fragment_list
  }

  /** 
   * Requests the API function for all content corresponding to the given fragment id.
   * @param fragment_id 
   * @returns fills all content variables with data. e.g. data -> this.f_commentary 
   * @author Bors & Ycreak
   * TODO: this can be done with a single request. Needs redesign with nice models to solve current problems.
   */
  public Request_fragment_content(fragment_id: string){
    this.api.Get_fragment_content(fragment_id).subscribe(data => {     
      this.current_fragment.add_content(data);
      this.fragment_clicked = true;
    });
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
      this.current_fragment = fragment

      // console.log(fragment)
      // Request content from this fragment
      this.Request_fragment_content(fragment.fragment_id)

      // Request content from its linked fragments
      //TODO:

      // Reset fragment linking for all fragments
      for(let index in this.column_data){
        let fragment_array = this.column_data[index].fragments
        for(let fragment in fragment_array){
          fragment_array[fragment].colour = 'black';
        }
      }
      
      // Colour the clicked fragment
      fragment.colour = '#3F51B5';


      // And the corresponding ones in the other columns
      for(let index in fragment.linked_fragments){
        let linked_fragment_id = fragment.linked_fragments[index] //.fragment_id //# new referencer format
        console.log(linked_fragment_id)

				//FIXME: fragment referencing needs to be modeled first!
        let corresponding_fragment = this.column_data['column1'].fragments.find(i => i.fragment_id === linked_fragment_id);
        if(corresponding_fragment) corresponding_fragment.colour = '#FF4081';

        corresponding_fragment = this.column_data['column2'].fragments.find(i => i.fragment_id === linked_fragment_id);
        if(corresponding_fragment) corresponding_fragment.colour = '#FF4081';
        
        corresponding_fragment = this.column_data['column3'].fragments.find(i => i.fragment_id === linked_fragment_id);
        if(corresponding_fragment) corresponding_fragment.colour = '#FF4081';

        corresponding_fragment = this.column_data['column4'].fragments.find(i => i.fragment_id === linked_fragment_id);
        if(corresponding_fragment) corresponding_fragment.colour = '#FF4081';

      }
  }

  /**
   * Function to handle the login dialog
   * @author Ycreak
   */
  public Login() {
    const dialogRef = this.matdialog.open(LoginComponent, {
      height: '60vh',
      width: '40vw',
    });
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
        line_text = this.utility.convert_whitespace_encoding(line_text)
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
    let normal = this.utility.FilterObjOnKey(fragments, 'status', "Certum")
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


// export class Fragment_column {
// 	constructor(){}

// 	author : '',
// 	book : '',
// 	editor : '',
// 	fragments : [],

// 	public AddFragmentToArray(array, fragment_name, fragments){
// 		for(let fragment in fragments){
// 			if(fragments[fragment].fragment_name == fragment_name){
// 				array.push(fragments[fragment])
// 			}
// 		}
// 		return array
// 	}

// }


