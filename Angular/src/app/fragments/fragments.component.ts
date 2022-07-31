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
// import { Playground } from './playground.class';

import { Fragment } from '../models/Fragment';
import { Fragment_column } from '../models/Fragment_column';

// FIXME: why do i need to export this class?
export { Multiplayer } from './multiplayer.class';
// export { Playground } from './playground.class';

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
  server_down: boolean = true; // to indicate server failure
  // Objects to store the retrieved authors, books and editors to control server data retrieval 
  // retrieved_authors : object; // JSON that contains all available Authors and their data.
  // retrieved_books : object; // JSON that contains all available Books and their data given a specific editor.
  // retrieved_editors : object; // JSON that contains all available Editors and their data for a specific book.
  // Global Class Variables with text data corresponding to the front-end text fields.
  current_fragment : Fragment;
  fragment_clicked : boolean = false;
  // Variable to store the fragment numbers from a given Author, Book and Editor
  // retrieved_fragment_numbers : object;
  // Object to store all column data. TODO: should be rethought.
   
  columns : Array<Fragment_column> = [];

  //   column3 : {
  //     author : '',
  //     title : '',
  //     editor : '',
  //     fragments : [],
  //   },
  //   column4 : {
  //     author : '',
  //     title : '',
  //     editor : '',
  //     fragments : [],
  //   },
  //   playground : {
  //     author : '',
  //     title : '',
  //     editor : '',
  //     fragments : [],
  //   },
  //   playground2 : {
  //     author : '',
  //     title : '',
  //     editor : '',
  //     fragments : [],
  //   },     
  // }
  // Allows for notes to be added on screen
  // note : string = '';
  // noteArray : Array<string> = [];
  
  constructor(
    private api: ApiService,
    private utility: UtilityService,
    public authService: AuthService,
    public dialog: DialogService,
    private matdialog: MatDialog, 
    public multiplayer: Multiplayer,
    // public playground: Playground,
    ) { }

  ngOnInit(): void {
    // Create an empty current fragment to be filled by clicking
    this.current_fragment = new Fragment({});
    // Create templates for the possible fragment columns
    let column1 = new Fragment_column('ONE', 'Ennius', 'Thyestes', 'TRF');
    let column2 = new Fragment_column('TWO', 'TBA', 'TBA', 'TBA');
    let column3 = new Fragment_column('THREE', 'TBA', 'TBA', 'TBA');
    let column4 = new Fragment_column('FOUR', 'TBA', 'TBA', 'TBA');

    let playground1 = new Fragment_column('PLAY1', 'TBA', 'TBA', 'TBA');
    let playground2 = new Fragment_column('PLAY2', 'TBA', 'TBA', 'TBA');

    // Push these to the columns array
    this.columns.push(column1, column2, column3, column4, playground1, playground2)

    // Request authors for each columns (TODO: this could be nicer)
    this.request_authors(column1)
    this.request_authors(column2)
    this.request_authors(column3)
    this.request_authors(column4)
    this.request_authors(playground1)
    this.request_authors(playground2)


    // Request the fragments for the first column
    this.request_fragments(column1);

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
   * Requests the API function for authors
   * @param author 
   * @returns data -> this.retrieved_books 
   * @author Ycreak
   */
   public request_authors(column){
    this.api.GetAuthors().subscribe(data => {
      this.server_down = false; //FIXME: needs to be handled properly
      // Enter this retrieved data in the correct column
      this.columns.find(i => i.name === column.name).retrieved_authors = data; 
      // this.retrieved_authors = data //FIXME: getting deprecated
    });
  }

  /** Requests the API function for books given the author.
   * @param author 
   * @returns data -> this.retrieved_books 
   * @author Bors & Ycreak
   */
  public request_books(column: Fragment_column){
    this.api.GetBooks(column.author).subscribe(
      data => {
        // this.retrieved_books = data;
        this.columns.find(i => i.name === column.name).retrieved_titles = data; 
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
  public request_editors(column: Fragment_column){
    this.api.GetEditors(column.author, column.title).subscribe(
      data => {
        // this.retrieved_editors = data;
        this.columns.find(i => i.name === column.name).retrieved_editors = data; 
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
  public request_fragments(column){
    this.api.GetFragments(column.author, column.title, column.editor).subscribe(
      data => { 
        let fragment_list = this.create_fragment_list(data);
        // Format the data just how we want it
        fragment_list = this.Add_HTML_to_lines(fragment_list);
        fragment_list = fragment_list.sort(this.utility.SortFragmentsArrayNumerically);
        fragment_list = this.Sort_fragments_on_status(fragment_list);
        // Store it at the correct place
        column.fragments = fragment_list;
        column.fragment_numbers = this.Retrieve_fragment_numbers(fragment_list); // While we are at it, save the fragment numbers
        
        // this.retrieved_fragment_numbers = this.Retrieve_fragment_numbers(fragment_list);
        // Now check if the column already exists. If so, delete it, so we can push a brand new object       
        if(this.columns.length > 0){
          this.columns.splice(this.columns.findIndex(i => i.name === column.name), 1)
        }
        // And now push the     
        this.columns.push(column)
      }
    );  
  }

  /**
   * Creates a list of typescript fragment objects using the json received from the server
   * @param fragment_json which is received from the server
   * @returns list of Fragment objects
   * @author Ycreak
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
      
      // console.log('data', data)
      this.current_fragment.add_content(data);
      this.fragment_clicked = true;
      // console.log(this.current_fragment)
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
  public handle_author_selection(column: Fragment_column, author: string){
    // Set the author for the given column
    this.columns.find(i => i.name === column.name).author = author; 
    this.request_books(column);
  }

  /**
   * Function to handle what happens when a book is selected in HTML.
   * @param column current column in which the action is happening
   * @param book selected by the user
   * @author Ycreak
   */
  public handle_book_selection(column: Fragment_column, title: string){
    this.columns.find(i => i.name === column.name).title = title; 
    this.request_editors(column);
    // this.column_data[column].title = book;
    // this.column_data[column].editor = 'TBA';
    // this.RequestEditors(this.column_data[column].author, book);
  }

  /**
   * Function to handle what happens when an editor is selected in HTML.
   * @param column current column in which the action is happening
   * @param editor selected by the user
   * @author Ycreak
   */
  public handle_editor_selection(column: Fragment_column, editor: string){
    // this.column_data[column].editor = editor;
    this.columns.find(i => i.name === column.name).editor = editor; 
    this.request_fragments(this.columns.find(i => i.name === column.name))
  }

  /**
   * Function to handle what happens when a fragment is selected in HTML.
   * @param column current column in which the action is happening
   * @param fragment selected by the user
   * @author Ycreak
   * TODO: pressed fragment should be an object initialised at startup
   */
  public handle_fragment_click(fragment){
      this.current_fragment = fragment
      // Request content from this fragment
      this.Request_fragment_content(fragment.fragment_id)
      // Request content from its linked fragments
      //TODO:
      
      // The next part handles the colouring of clicked and referenced fragments.
      // First, restore all fragments to their original black colour when a new fragment is clicked
      for(let index in this.columns){
        let fragment_array = this.columns[index].fragments
        for(let fragment in fragment_array){
          fragment_array[fragment].colour = 'black';
        }       
      }
      // Second, colour the clicked fragment
      fragment.colour = '#3F51B5';
      // Third, colour the corresponding ones in the other columns
      for(let index in fragment.linked_fragments){
        let linked_fragment_id = fragment.linked_fragments[index] // Loop through all fragments
				//FIXME: fragment referencing needs to be modeled first!
        let corresponding_fragment = this.columns.find(i => i.name === 'ONE').fragments.find(i => i.fragment_id === linked_fragment_id);
        if(corresponding_fragment) corresponding_fragment.colour = '#FF4081';

        corresponding_fragment = this.columns.find(i => i.name === 'TWO').fragments.find(i => i.fragment_id === linked_fragment_id);
        if(corresponding_fragment) corresponding_fragment.colour = '#FF4081';
        
        corresponding_fragment = this.columns.find(i => i.name === 'THREE').fragments.find(i => i.fragment_id === linked_fragment_id);
        if(corresponding_fragment) corresponding_fragment.colour = '#FF4081';

        corresponding_fragment = this.columns.find(i => i.name === 'FOUR').fragments.find(i => i.fragment_id === linked_fragment_id);
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
    console.log('############ TESTING ############')
    
    console.log(this.columns)
    // console.log(this.columns.find(i => i.name === 'ONE'));
    // console.log(this.columns.find(i => i.name === 'TWO'));

    console.log('############ ####### ############')

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
  
  public get_column_from_columns(name: string) {
    return (this.columns.find(i => i.name === name) || []);
  }

  public add_fragment_to_array(array, fragment_name, source){
    for(let fragment in source){
      if(source[fragment].fragment_name == fragment_name){
        array.push(source[fragment])
      }
    }
    return array
  }

}

// Simple class to open the about information written in said html file.
@Component({
  selector: 'about-dialog',
  templateUrl: '../dialogs/about-dialog.html',
})
export class ShowAboutDialog {}

