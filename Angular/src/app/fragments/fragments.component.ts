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
import { Text_column } from '../models/Text_column';

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
  toggle_commentary: boolean = false;
  toggle_playground: boolean = true;
  // Booleans for HTML related items
  spinner: boolean = false; // Boolean to toggle the spinner.
  server_down: boolean = true; // to indicate server failure
  // Global Class Variables with text data corresponding to the front-end text fields.
  current_fragment: Fragment; // Variable to store the clicked fragment and its data
  fragment_clicked: boolean = false; // Shows "click a fragment" banner at startup if nothing is yet selected

  // Object to store all column data: just an array with column data in the form of fragment columns
  columns: Fragment_column[] = [];

  // text_column: Text_column;
  column1: Fragment_column;
  column2: Fragment_column;

  playground: Fragment_column;

  // We keep track of the number of columns to identify them
  column_identifier: number = 1;

  // List of connected columns to allow dragging and dropping between columns
  connected_columns_list: string[] = [];

  constructor(
    private api: ApiService,
    private utility: UtilityService,
    public auth_service: AuthService,
    public dialog: DialogService,
    private matdialog: MatDialog, 
    ) { }

  ngOnInit(): void {

    // Create an empty current_fragment variable to be filled whenever the user clicks a fragment
    // Its data is shown in the commentary column and not used anywhere else
    this.current_fragment = this.utility.create_empty_fragment();

    // Create templates for the possible fragment columns
    this.column1 = new Fragment_column(1, 'ETT', 'Ennius', 'Thyestes', 'TRF');
    this.request_authors(this.column1)

    // this.column2 = new Fragment_column(2, 'ETR', 'Ennius', 'Thyestes', 'Ribbeck');

    // And two for the playground
    this.playground = new Fragment_column(0, 'playground', '', '', '');
    this.request_authors(this.playground)

    // let playground2 = new Fragment_column('PLAY2', 'TBA', 'TBA', 'TBA');
    
    // Push these to the columns array for later use in the HTML component
    this.columns.push(this.column1)
    // this.columns.push(this.column2)

    // Request the fragments for the first column
    this.request_fragments(this.column1);
    // this.request_fragments(this.column2);

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
   private request_authors(column: Fragment_column): void{
    this.api.get_authors().subscribe(data => {
      this.server_down = false; //FIXME: needs to be handled properly
      // Enter this retrieved data in the correct column
      column.retrieved_authors = data; 
    });
  }

  /** Requests the API function for books given the author.
   * @param column: Fragment_column 
   * @returns data -> column.retrieved_authors
   * @author Bors & Ycreak
   */
  private request_titles(column: Fragment_column): void{
    this.api.get_titles(column.author).subscribe(
      data => {
        column.retrieved_titles = data; 
      }
    );      
  }
  /**
   * Requests the API function for editors given the author and book.
   * @param column: Fragment_column
   * @returns data -> column.retrieved_editors 
   * @author Bors & Ycreak
   */
  private request_editors(column: Fragment_column): void{
    this.api.get_editors(column.author, column.title).subscribe(
      data => {
        column.retrieved_editors = data; 
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
  private request_fragments(column: Fragment_column): void{
    
    let api_data = this.utility.create_empty_fragment();
    api_data.author = column.author; api_data.title = column.title; api_data.editor = column.editor;

    this.api.get_fragments(api_data).subscribe(
      fragment_list => { 
        // Format the data just how we want it
        fragment_list = this.add_HTML_to_lines(fragment_list);
        fragment_list = fragment_list.sort(this.utility.sort_fragment_array_numerically);
        fragment_list = this.sort_fragments_on_status(fragment_list);
        // Store the formatted data at the correct place
        if(column.name != 'playground'){
          column.fragments = fragment_list;
          // Now check if the column already exists. If so, replace it with the new object.
          if(this.columns.length > 0){
            this.columns[this.columns.findIndex(i => i.id === column.id)] = column
          }
        }
        else{
          // In the case of the playground, we want to add the new edition to our playground
          column.fragments = column.fragments.concat(fragment_list);
        }
        
      }
    );  
  }

  /** 
   * Requests the API function for all content corresponding to the given fragment id.
   * The retrieved data will then be added to the current_fragment model for displaying
   * in the HTML frontend
   * @param fragment_id 
   * @returns fills all content variables with data. e.g. data -> this.f_commentary 
   * @author Bors & Ycreak
   */
  private request_fragment_content(fragment_id: string): void{
    let api_data = this.utility.create_empty_fragment(); 
    api_data.id = fragment_id;

    this.api.get_fragment_content(api_data).subscribe(data => {     
      this.fragment_clicked = true;
      this.add_content_to_current_fragment(data);
    });
  }

  /**
   * Given the author, title and editor, request the names of the fragments from the server.
   * @param author author of the fragment
   * @param title title of the fragment
   * @param editor editor of the fragment
   * @author Ycreak
   */
   public request_fragment_names(column: Fragment_column): void {
    // Create api/fragment object to send to the server
    let api_data = this.utility.create_empty_fragment();
    api_data.author = column.author; api_data.title = column.title; api_data.editor = column.editor;

    this.api.get_fragment_names(api_data).subscribe(
      data => {
        column.fragment_numbers = data;
      });
  }

  // /**
  //  * Given an object with fragments, returns a list of all fragment names.
  //  * @param fragments: Fragments[], list of all fragments retrieved from the server
  //  * @returns list of all fragment names 
  //  * @author Ycreak
  //  */
  // private retrieve_fragment_numbers(fragments): string[]{    
  //   let number_list: string[] = []
  //   for(let fragment in fragments){
  //     number_list.push(fragments[fragment].fragment_name)
  //   }
  //   return number_list
  // }

  /**
   * Function to handle what happens when an author is selected in HTML. 
   * Request for titles given author made to the api via request_titles().
   * @param column current column in which the action is happening
   * @param author selected by the user
   * @author Ycreak
   */
  private handle_author_selection(column: Fragment_column, author: string): void{
    // Set the author for the given column
    column.author = author; 
    this.request_titles(column)    
  }

  /**
   * Function to handle what happens when a title is selected in HTML.
   * Request for editors given author and title made to the api via request_editors()
   * @param column current column in which the action is happening
   * @param title selected by the user
   * @author Ycreak
   */
  private handle_title_selection(column: Fragment_column, title: string): void{
    // Set the title for the given column
    column.title = title; 
    this.request_editors(column)
  }

  /**
   * Function to handle what happens when an editor is selected in HTML.
   * Request for fragments given author, title and editor made to the api via request_fragments()
   * @param column current column in which the action is happening
   * @param editor selected by the user
   * @author Ycreak
   */
  private handle_editor_selection(column: Fragment_column, editor: string): void{
    // Set the editor for the given column
    column.editor = editor; 
    // Only retrieve fragments on editor selection if we are not in the playground
    if(column.name != 'playground'){ 
      this.request_fragments(column);
    }
    else{
      // request a list of fragment names
      this.request_fragment_names(column)
      console.log(column.fragment_numbers)
    }
  }

  /**
   * Function to handle what happens when a fragment is selected in HTML.
   * @param fragment selected by the user
   * @author Ycreak
   */
   private handle_fragment_click(fragment: Fragment): void{
      this.current_fragment = fragment
      // Request content from this fragment
      this.request_fragment_content(fragment.id)
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
  private colour_fragments_black(): void{
    for(let index in this.columns){
      let fragment_array = this.columns[index].fragments
      for(let fragment in fragment_array){
        fragment_array[fragment].colour = 'black';
      }       
    }
  }

  /**
   * This function adds a new column to the columns array
   * @author Ycreak
   */
  public add_column(): void{
    //TODO: shall we create a limit? like no more than 100,000 columns?
    // First, increment the column_identifier to create a new and unique id
    this.column_identifier += 1;

    // Create new column with the appropriate name. TODO: create better identifiers than simple integers
    let new_fragment_column = new Fragment_column(this.column_identifier,'', '', '', '');
    this.columns.push(new_fragment_column)    
    this.request_authors(new_fragment_column);
    // And update the connected columns list
    this.update_connected_columns_list()
  }

  /**
   * This function deletes a column from this.columns given its name
   * @param column_id of column that is to be closed
   * @author Ycreak
   */
  public close_column(column_id): void{
    const object_index = this.columns.findIndex(object => {
      return object.id === column_id;
    });    
    this.columns.splice(object_index, 1);
    // And update the connected columns list
    this.update_connected_columns_list()
  }

  /**
   * This function moves a column inside this.columns to allow the user to move columns
   * around on the frontend.
   * @param column_id of column that is to be moved
   * @param direction of movement
   * @author Ycreak
   */
   public move_column(column_id, direction): void{
    // First get the current index of the column we want to move
    const from_index = this.columns.findIndex(object => {
      return object.id === column_id;
    });
    // Next, generate the new index when the column would be moved
    let to_index = 0;
    if(direction == 'left'){
      to_index = from_index - 1;
    }
    else{
      to_index = from_index + 1;
    }
    // If this next location is valid, move the column to that location, otherwise do nothing
    if (to_index >= 0 && to_index < this.columns.length){
      this.columns = this.move_element_in_array(this.columns, from_index, to_index)
    }
  }

  /**
   * This function creates a list of connected columns to allow dragging and dropping
   * @author Ycreak
   */
  public update_connected_columns_list(): void{
    this.connected_columns_list = [];
    for (let i of this.columns) {
      this.connected_columns_list.push(String(i.id));
    };
  }
  /**
   * This function moves an element within an array from the given location to the given new location
   * @param arr in which the moving should be done
   * @param from_index element's index that is to be moved
   * @param to_index index to where the element is to be moved
   * @returns updated array
   * @author Ycreak
   */
  public move_element_in_array(arr, from_index, to_index): Array<any> {
      var element = arr[from_index];
      arr.splice(from_index, 1);
      arr.splice(to_index, 0, element);
      return arr
  }

  /**
   * This function allows the playground to delete notes and fragements
   * @param column column from which the deletion is to take place
   * @param item either a note or a fragment needs deletion
   */
  public delete_clicked_item_from_playground(column: Fragment_column, item: string): void{
    if(item == 'fragment'){
      const object_index = column.fragments.findIndex(object => {
        return object.id === column.clicked_fragment.id;
      });    
      column.fragments.splice(object_index, 1);
    }
    else{ // it is a note
      const object_index = column.note_array.findIndex(object => {
        return object === column.clicked_note;
      });    
      column.note_array.splice(object_index, 1);
    }
  }

  /**
   * Given the current fragment, colour the linked fragments in the other columns
   * @param fragment of which the linked fragments should be coloured
   * @author Ycreak
   */
  private colour_linked_fragments(fragment: Fragment): void{
    // Loop through all fragments the linked fragments
    for(let i in fragment.linked_fragments){
      let linked_fragment_id = fragment.linked_fragments[i] 

      // Now, for each fragment that is linked, try to find it in the other columns
      for(let j in this.columns){
        // in each column, take a look in the fragments array to find the linked fragment
        let corresponding_fragment = this.columns[j].fragments.find(i => i.id === linked_fragment_id);
        // colour it if found
        if(corresponding_fragment) corresponding_fragment.colour = '#FF4081';
      }
    }
  }

  /**
   * Function to handle the login dialog
   * @author Ycreak
   */
  public login(): void{
    const dialogRef = this.matdialog.open(LoginComponent, {
      height: '60vh',
      width: '40vw',
    });
  }

  /**
   * Test function
   * @author Ycreak
   */  
  private test(thing): void{
    console.log('############ TESTING ############')
    console.log(thing)
    console.log('############ ####### ############')

  }

  /**
   * This function adds HTML to the lines of the given array. Simply put, it inserts every
   * line number and its content in an HTML paragraph for easy insertion in HTML.
   * @param array with fragments as retrieved from the server
   * @returns updated array with nice HTML formatting included
   * @author Ycreak
   */
   private add_HTML_to_lines(array: Fragment[]): Fragment[]{        
    // For each element in the given array
    for(let fragment in array){
      // Loop through all fragments      
      let current_fragment = array[fragment]
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
  private sort_fragments_on_status(fragments: Fragment[]): Fragment[]{
    let normal = this.utility.filter_object_on_key(fragments, 'status', "Certum")
    let incerta = this.utility.filter_object_on_key(fragments, 'status', 'Incertum')
    let adesp = this.utility.filter_object_on_key(fragments, 'status', 'Adesp.')
    // Concatenate in the order we want
    fragments = normal.concat(incerta).concat(adesp)
    return fragments
  }
  
  /**
   *
   */
  private add_single_fragment_to_playground(column: Fragment_column, fragment_name): void{

    // First, retrieve the fragment from the database
    let api_data = this.utility.create_empty_fragment();
    api_data.author = column.author; api_data.title = column.title; api_data.editor = column.editor; api_data.fragment_name = fragment_name;
    // Next, format the fragment and push it to the list
    this.api.get_specific_fragment(api_data).subscribe(
      fragment => {
        //FIXME: this could be more elegant. But the idea is that we need to add HTML. However,
        // the function add_HTML_to_lines expects a list. This list always has one element.
        let html_fragment_list = this.add_HTML_to_lines([fragment]);
        column.fragments.push(html_fragment_list[0])
      });
  }

  /**
   * Adds the JSON with fragment content retrieved from the server to the corresponding
   * fields of our current_fragment object for viewing in the Commentary column in HTML.
   * An entry should not be made if the received field is empty to prevent empty expansion panels
   * @param fragment 
   * @author Ycreak
   * TODO: this should be done with a nice for-loop. See convert_Fragment_to_fragment_form in Dashboard
   */
  private add_content_to_current_fragment(fragment): void{
    if(fragment['translation'] != ''){ this.current_fragment.translation = fragment['translation']}
    if(fragment['differences'] != ''){ this.current_fragment.differences = fragment['differences']}
    if(fragment['apparatus'] != ''){ this.current_fragment.apparatus = fragment['apparatus']}
    if(fragment['commentary'] != ''){ this.current_fragment.commentary = fragment['commentary']}
    if(fragment['reconstruction'] != ''){ this.current_fragment.reconstruction = fragment['reconstruction']}
    if(fragment['context'] != ''){ this.current_fragment.context = fragment['context']}
    if(fragment['bibliography'] != ''){ this.current_fragment.bibliography = fragment['bibliography']}
}

}

// Simple component to open the about information written in said html file.
@Component({
  selector: 'about-dialog',
  templateUrl: '../dialogs/about-dialog.html',
})
export class ShowAboutDialog {}

