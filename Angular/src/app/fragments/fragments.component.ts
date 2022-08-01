// Library imports
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog'; // Library used for interacting with the page
import { TemplateRef, ViewChild } from '@angular/core'; // To allow dialog windows within the current window

// Component imports
import { LoginComponent } from '../login/login.component'

// Service imports
import { ApiService } from '../api.service';
import { DialogService } from '../services/dialog.service';
import { UtilityService } from '../utility.service';
import { AuthService } from '../auth/auth.service';

// Model imports
import { Fragment } from '../models/Fragment';
import { Fragment_column } from '../models/Fragment_column';

@Component({
  selector: 'app-fragments',
  templateUrl: './fragments.component.html',
  styleUrls: ['./fragments.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class FragmentsComponent implements OnInit {
  // Initiate the possibility to call dialogs
  @ViewChild('CallBookSelect') CallBookSelect: TemplateRef<any>;
  @ViewChild('CallAbout') CallAbout: TemplateRef<any>;

  // Toggle switches for the HTML columns/modes
  toggle_column_one: boolean = true;
  toggle_column_two: boolean = false;
  toggle_column_three: boolean = false;
  toggle_column_four: boolean = false;
  toggle_commentary: boolean = true;
  toggle_playground: boolean = false;
  // Booleans for HTML related items
  spinner: boolean = false; // Boolean to toggle the spinner.
  server_down: boolean = true; // to indicate server failure
  // Global Class Variables with text data corresponding to the front-end text fields.
  current_fragment: Fragment; // Variable to store the clicked fragment and its data
  fragment_clicked: boolean = false; // Shows "click a fragment" banner at startup if nothing is yet selected

  // Object to store all column data: just an array with column data in the form of fragment columns
  columns: Array<Fragment_column> = [];
  
  constructor(
    private api: ApiService,
    private utility: UtilityService,
    public authService: AuthService,
    public dialog: DialogService,
    private matdialog: MatDialog, 
    ) { }

  ngOnInit(): void {
    // Create an empty current_fragment variable to be filled whenever the user clicks a fragment
    this.current_fragment = new Fragment({});
    // Create templates for the possible fragment columns
    let column1 = new Fragment_column('ONE', 'Ennius', 'Thyestes', 'TRF');
    let column2 = new Fragment_column('TWO', 'TBA', 'TBA', 'TBA');
    let column3 = new Fragment_column('THREE', 'TBA', 'TBA', 'TBA');
    let column4 = new Fragment_column('FOUR', 'TBA', 'TBA', 'TBA');
    // And two for the playground
    let playground1 = new Fragment_column('PLAY1', 'TBA', 'TBA', 'TBA');
    let playground2 = new Fragment_column('PLAY2', 'TBA', 'TBA', 'TBA');
    // Push these to the columns array for later use in the HTML component
    this.columns.push(column1, column2, column3, column4, playground1, playground2)

    // Request authors for each column (TODO: this could be nicer)
    this.request_authors(column1)
    this.request_authors(column2)
    this.request_authors(column3)
    this.request_authors(column4)
    this.request_authors(playground1)
    this.request_authors(playground2)

    // Request the fragments for the first column
    this.request_fragments(column1);
  }

  //   _____  ______ ____  _    _ ______  _____ _______ _____ 
  //  |  __ \|  ____/ __ \| |  | |  ____|/ ____|__   __/ ____|
  //  | |__) | |__ | |  | | |  | | |__  | (___    | | | (___  
  //  |  _  /|  __|| |  | | |  | |  __|  \___ \   | |  \___ \ 
  //  | | \ \| |___| |__| | |__| | |____ ____) |  | |  ____) |
  //  |_|  \_\______\___\_\\____/|______|_____/   |_| |_____/  
  /**
   * Requests the API function for authors
   * @param column: Fragment_column 
   * @returns data -> column.retrieved_authors
   * @author Ycreak
   */
   private request_authors(column: Fragment_column){
    this.api.get_authors().subscribe(data => {
      this.server_down = false; //FIXME: needs to be handled properly
      // Enter this retrieved data in the correct column
      this.columns.find(i => i.name === column.name).retrieved_authors = data; 
    });
  }

  /** Requests the API function for books given the author.
   * @param column: Fragment_column 
   * @returns data -> column.retrieved_authors
   * @author Bors & Ycreak
   */
  private request_titles(column: Fragment_column){
    this.api.get_titles(column.author).subscribe(
      data => {
        this.columns.find(i => i.name === column.name).retrieved_titles = data; 
      }
    );      
  }
  /**
   * Requests the API function for editors given the author and book.
   * @param column: Fragment_column
   * @returns data -> column.retrieved_editors 
   * @author Bors & Ycreak
   */
  private request_editors(column: Fragment_column){
    this.api.get_editors(column.author, column.title).subscribe(
      data => {
        this.columns.find(i => i.name === column.name).retrieved_editors = data; 
      }
    );
  }

  /**
   * Requests the API function for fragments given the author, book and editor.
   * @param column: Fragment_column
   * @returns Object with fragments that are sorted numerically and on their status. Also
   *          adds an HTML formatted string to the object for easy printing. Note that the
   *          new data is added to the corresponding field in the provided parameter
   * @author Bors & Ycreak
   */
  private request_fragments(column: Fragment_column){
    this.api.get_fragments(column.author, column.title, column.editor).subscribe(
      data => { 
        let fragment_list: Fragment[] = this.create_fragment_list(data);
        // Format the data just how we want it
        fragment_list = this.add_HTML_to_lines(fragment_list);
        fragment_list = fragment_list.sort(this.utility.sort_fragment_array_numerically);
        fragment_list = this.sort_fragments_on_status(fragment_list);
        // Store the formatted data at the correct place
        column.fragments = fragment_list;
        // While we are at it, save the fragment numbers: this is used in the playground to retrieve specific fragments
        column.fragment_numbers = this.retrieve_fragment_numbers(fragment_list); 
        // Now check if the column already exists. If so, delete it, so we can push a brand new object       
        if(this.columns.length > 0){
          this.columns.splice(this.columns.findIndex(i => i.name === column.name), 1)
        }
        // And now push the column with formatted data to the array of columns to be displayed in HTML    
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
  private create_fragment_list(fragment_json: JSON){
    let fragment_list: Fragment[] = [];
    for(let index in fragment_json){
      fragment_list.push(new Fragment(fragment_json[index]))
    }
    return fragment_list
  }

  /** 
   * Requests the API function for all content corresponding to the given fragment id.
   * The retrieved data will then be added to the current_fragment model for displaying
   * in the HTML frontend
   * @param fragment_id 
   * @returns fills all content variables with data. e.g. data -> this.f_commentary 
   * @author Bors & Ycreak
   */
  private request_fragment_content(fragment_id: string){
    this.api.Get_fragment_content(fragment_id).subscribe(data => {     
      this.fragment_clicked = true;
      this.current_fragment.add_content(data);
    });
  }

  /**
   * Given an object with fragments, returns a list of all fragment names.
   * @param fragments: Fragments[], list of all fragments retrieved from the server
   * @returns list of all fragment names 
   * @author Ycreak
   */
  private retrieve_fragment_numbers(fragments){    
    let number_list: string[] = []
    for(let fragment in fragments){
      number_list.push(fragments[fragment].fragment_name)
    }
    return number_list
  }

  /**
   * Function to handle what happens when an author is selected in HTML. 
   * Request for titles given author made to the api via request_titles().
   * @param column current column in which the action is happening
   * @param author selected by the user
   * @author Ycreak
   */
  private handle_author_selection(column: Fragment_column, author: string){
    // Set the author for the given column
    this.columns.find(i => i.name === column.name).author = author; 
    this.request_titles(column);
  }

  /**
   * Function to handle what happens when a title is selected in HTML.
   * Request for editors given author and title made to the api via request_editors()
   * @param column current column in which the action is happening
   * @param title selected by the user
   * @author Ycreak
   */
  private handle_title_selection(column: Fragment_column, title: string){
    // Set the title for the given column
    this.columns.find(i => i.name === column.name).title = title; 
    this.request_editors(column);
  }

  /**
   * Function to handle what happens when an editor is selected in HTML.
   * Request for fragments given author, title and editor made to the api via request_fragments()
   * @param column current column in which the action is happening
   * @param editor selected by the user
   * @author Ycreak
   */
  private handle_editor_selection(column: Fragment_column, editor: string){
    // Set the editor for the given column
    this.columns.find(i => i.name === column.name).editor = editor; 
    this.request_fragments(this.columns.find(i => i.name === column.name))
  }

  /**
   * Function to handle what happens when a fragment is selected in HTML.
   * @param fragment selected by the user
   * @author Ycreak
   */
   private handle_fragment_click(fragment: Fragment){
      this.current_fragment = fragment
      // Request content from this fragment
      this.request_fragment_content(fragment.fragment_id)
      // Request content from its linked fragments
      //TODO:
      
      // The next part handles the colouring of clicked and referenced fragments.
      // First, restore all fragments to their original black colour when a new fragment is clicked
      this.colour_fragments_black()
      // Second, colour the clicked fragment
      fragment.colour = '#3F51B5';
      // Lastly, colour the linked fragments
      this.colour_linked_fragments(fragment)
  }

  /**
   * Colours all fragment titles black
   * @author Ycreak
   */
  private colour_fragments_black(){
    for(let index in this.columns){
      let fragment_array = this.columns[index].fragments
      for(let fragment in fragment_array){
        fragment_array[fragment].colour = 'black';
      }       
    }
  }

  /**
   * Given the current fragment, colour the linked fragments in the other columns
   * @param fragment of which the linked fragments should be coloured
   * @author Ycreak
   */
  private colour_linked_fragments(fragment: Fragment){
    for(let index in fragment.linked_fragments){
      // Loop through all fragments
      let linked_fragment_id = fragment.linked_fragments[index] 
      // Set colours of corresponding fragments from the other columns if found
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
  private login() {
    const dialogRef = this.matdialog.open(LoginComponent, {
      height: '60vh',
      width: '40vw',
    });
  }

  /**
   * Test function
   * @author Ycreak
   */  
  private test(){
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
   private add_HTML_to_lines(array){        
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
   * Sorts the given object of fragments on status. We want to display Certa, followed
   * by Incerta and Adespota.
   * @param fragments 
   * @returns fragments in the order we want
   * @author Ycreak
   */    
  private sort_fragments_on_status(fragments){
    let normal = this.utility.filter_object_on_key(fragments, 'status', "Certum")
    let incerta = this.utility.filter_object_on_key(fragments, 'status', 'Incertum')
    let adesp = this.utility.filter_object_on_key(fragments, 'status', 'Adesp.')
    // Concatenate in the order we want
    fragments = normal.concat(incerta).concat(adesp)
    return fragments
  }
  
  /**
   * This function retrieves the column from the columns object given its name.
   * If no column with the given name is found, an empty list is returned
   * @param name of the requested column
   * @returns requested column object
   * @author Ycreak
   */
  private get_column_from_columns(name: string) {
    return (this.columns.find(i => i.name === name) || []);
  }

  /**
   * Possibility to add fragment objects to a new array for printing in the Playground
   * It takes the given array and tries to add the given fragment_name from the provided source
   * @param array of selected number fragments to which to add another fragment
   * @param fragment_name of which we want to add its object to the array
   * @param source array of all fragments, from which we want one given fragment_name added to array
   * @returns 
   */
  private add_fragment_to_array(array, fragment_name, source){
    for(let fragment in source){
      if(source[fragment].fragment_name == fragment_name){
        array.push(source[fragment])
      }
    }
    return array
  }

}

// Simple component to open the about information written in said html file.
@Component({
  selector: 'about-dialog',
  templateUrl: '../dialogs/about-dialog.html',
})
export class ShowAboutDialog {}

