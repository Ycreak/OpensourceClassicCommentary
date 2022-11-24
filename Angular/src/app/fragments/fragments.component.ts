// Library imports
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog'; // Library used for interacting with the page
import { TemplateRef, ViewChild } from '@angular/core'; // To allow dialog windows within the current window
import { trigger, transition, style, animate } from '@angular/animations';
import { fromEvent, Observable, Subscription } from "rxjs";
import { CdkDragDrop } from '@angular/cdk/drag-drop';

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
import { Introductions } from '../models/Introductions';

import { Text_column } from '../models/Text_column';
import * as internal from 'stream'; // TODO: What is this?

@Component({
  selector: 'app-fragments',
  templateUrl: './fragments.component.html',
  styleUrls: ['./fragments.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: [
    trigger('fadeSlideInOut', [
      transition(':enter', [
          style({ opacity: 0, transform: 'translateY(10px)' }),
          animate('500ms', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
      transition(':leave', [
          animate('500ms', style({ opacity: 0, transform: 'translateY(10px)' })),
      ]),
  ])
  ],
})
export class FragmentsComponent implements OnInit {

  window_resize_observable$: Observable<Event>
  window_resize_subscription$: Subscription

  //TODO: this should be system wide
  oscc_settings = { 
    dragging_disabled : false, 
    auto_scroll_linked_fragments : false,
    show_headers : true, 
    show_line_names : true, 
  }; 

  // Toggle switches for the HTML columns/modes
  toggle_commentary: boolean = true;
  toggle_playground: boolean = false;
  // Booleans for HTML related items
  spinner: boolean = false; // Boolean to toggle the spinner.
  server_down: boolean = true; // to indicate server failure
  // Global Class Variables with text data corresponding to the front-end text fields.
  current_fragment: Fragment; // Variable to store the clicked fragment and its data
  fragment_clicked: boolean = false; // Shows "click a fragment" banner at startup if nothing is yet selected

  // Object to store all column data: just an array with column data in the form of fragment columns
  columns: Fragment_column[] = [];

  // Data columns
  column1: Fragment_column;
  column2: Fragment_column;
  column3: Fragment_column;
  column4: Fragment_column;
  playground: Fragment_column;
  commentary_column: Fragment_column;

  // We keep track of the number of columns to identify them
  column_identifier: number = 1;

  // List of connected columns to allow dragging and dropping between columns
  connected_columns_list: string[] = [];

  // Boolean to keep track if we are dragging or clicking a fragment within the playground
  playground_dragging: boolean;

  // Variable to keep track of the window width, used to scale the site for small displays
  window_size: number;

  constructor(
    public api: ApiService,
    public utility: UtilityService,
		public auth_service: AuthService,
    public dialog: DialogService,
    private matdialog: MatDialog, 
    ) { }

  ngOnInit(): void {
    // Retrieve the window_size to correctly set the navbar size
    this.window_size = this.retrieve_viewport_size();    

    // Create an empty current_fragment variable to be filled whenever the user clicks a fragment
    // Its data is shown in the commentary column and not used anywhere else
    this.current_fragment = this.utility.create_empty_fragment();
    this.commentary_column = new Fragment_column('255', '', '', '', '');

    // Create templates for the possible fragment columns
    this.column1 = new Fragment_column('1', 'ETT', 'Ennius', 'Thyestes', 'TRF');
    // Push these to the columns array for later use in the HTML component
    this.columns.push(this.column1)
    // Request the fragments for the first column
    this.request_fragments(this.column1);
    this.request_authors(this.column1)
    
    // And for the playground
    this.playground = new Fragment_column('0', 'playground', 'Accius', 'Aegisthus', 'Dangel');
    this.request_authors(this.playground)
    // this.request_fragments(this.playground);

    // Create an observable to check for the changing of window size
    this.window_resize_observable$ = fromEvent(window, 'resize')
    this.window_resize_subscription$ = this.window_resize_observable$.subscribe( evt => {
      // Find the window size. If it is too small, we will abbreviate the title to save space on the navbar
      this.window_size = this.retrieve_viewport_size();    
    })

    // this.column2 = new Fragment_column('2', 'ETR', 'Ennius', 'Thyestes', 'TRF');
    // this.columns.push(this.column2);
    // this.request_authors(this.column2);
    // this.request_fragments(this.column2);
    // this.column_identifier += 1;
    // this.update_connected_columns_list();

  }

  ngOnDestroy() {
    this.window_resize_subscription$.unsubscribe()
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
    this.utility.spinner_on();
    this.api.get_authors().subscribe(data => {
      this.server_down = false; //FIXME: needs to be handled properly
      // Enter this retrieved data in the correct column
      column.retrieved_authors = data;
      this.utility.spinner_off(); 
    });
  }

  /** Requests the API function for titles given the author.
   * @param column: Fragment_column 
   * @returns data -> column.retrieved_authors
   * @author Bors & Ycreak
   */
  private request_titles(column: Fragment_column): void{
    this.utility.spinner_on();
    this.api.get_titles(column.author).subscribe(
      data => {
        column.retrieved_titles = data; 
        this.utility.spinner_off(); 
      }
    );      
  }
  /**
   * Requests the API function for editors given the author and title.
   * @param column: Fragment_column
   * @returns data -> column.retrieved_editors 
   * @author Bors & Ycreak
   */
  private request_editors(column: Fragment_column): void{
    this.utility.spinner_on();
    this.api.get_editors(column.author, column.title).subscribe(
      data => {
        column.retrieved_editors = data;
        this.utility.spinner_off(); 
      }
    );
  }

  /**
   * Requests the API function for fragments given the author, title and editor.
   * @param column: Fragment_column
   * @returns Object with fragments that are sorted numerically and on their status. Also
   *          adds an HTML formatted string to the object for easy printing. Note that the
   *          new data is added to the corresponding field in the provided parameter
   * @author Bors & Ycreak
   */
  private request_fragments(column: Fragment_column): void{
    this.utility.spinner_on();
    
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
          // Store the original order of the fragments in the column object
          column.orig_fragment_order = []; // Clear first
          for (let frag of fragment_list){
            column.orig_fragment_order.push(frag.fragment_name);
          }
          // Now check if the column already exists. If so, replace it with the new object.
          if(this.columns.length > 0){
            this.columns[this.columns.findIndex(i => i.column_id === column.column_id)] = column
          }
        }
        else{
          // In the case of the playground, we want to add the new edition to our playground
          column.fragments = column.fragments.concat(fragment_list);
        }
        this.utility.spinner_off(); 
      }
    );  
  }

  /** 
   * Requests the API function for all content corresponding to the given fragment id.
   * The retrieved data will then be added to the given fragment (by reference) for displaying
   * in the HTML frontend
   * @param fragment_id 
   * @returns fills all content variables with data. e.g. data -> this.f_commentary 
   * @author Bors & Ycreak
   */
  private request_fragment_content(fragment: Fragment): void{   
    this.utility.spinner_on();
    this.api.get_fragment_content(fragment).subscribe(
      data => {     
        this.add_content_to_current_fragment(fragment, data);
        this.utility.spinner_off(); 
    });
  }

  /**
   * Given the author, title and editor, request the names of the fragments from the server.
   * @param column that is to be filled with data
   * @author Ycreak
   */
   public request_fragment_names(column: Fragment_column): void {
    this.utility.spinner_on();
    // Create api/fragment object to send to the server
    let api_data = this.utility.create_empty_fragment();
    api_data.author = column.author; api_data.title = column.title; api_data.editor = column.editor;

    this.api.get_fragment_names(api_data).subscribe(
      data => {
        column.fragment_names = data.sort(this.utility.sort_array_numerically);
        this.utility.spinner_off(); 
      });
  }

  /**
   * Function to handle what happens when a fragment is selected in HTML.
   * @param fragment selected by the user
   * @author Ycreak
   */
   private handle_fragment_click(fragment: Fragment, from_playground: boolean = false): void{
      // If we are currently dragging a fragment in the playground, we do not want the click even to fire.
      if(!this.playground_dragging){

        this.fragment_clicked = true;   
        this.current_fragment = fragment
        // Request content from this fragment
        this.request_fragment_content(fragment)
        // this.request_fragment_content(this.commentary_column.clicked_fragment)
  
        // Reset the commentary column and its linked fragments
        this.commentary_column.linked_fragments_content = [];
  
        // Now retrieve all linked fragments to show their content in the commentary column
        for(let i in fragment.linked_fragments){
          let linked_fragment = this.utility.create_empty_fragment()
          linked_fragment.fragment_id = fragment.linked_fragments[i]
          // Request the fragment
          this.api.get_specific_fragment(linked_fragment).subscribe(
            data => {
              linked_fragment = data;
              // and push it to the commentary column
              this.commentary_column.linked_fragments_content.push(linked_fragment)
              this.utility.spinner_off();
            });
        }
        
        // The next part handles the colouring of clicked and referenced fragments.
        // First, restore all fragments to their original black colour when a new fragment is clicked
        this.colour_fragments_black()
        // Second, colour the clicked fragment
        fragment.colour = '#3F51B5';
        // Lastly, colour the linked fragments
        this.colour_linked_fragments(fragment)

        if(!from_playground && this.oscc_settings.auto_scroll_linked_fragments){ // Only scroll when not in playground
          this.scroll_linked_fragments(fragment)
        }
      }
      else {
        // After a drag, make sure to set the dragging boolean on false again
        this.playground_dragging = false;
      }
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
		// Do the same for the playground
    for(let i in this.playground.fragments){
      this.playground.fragments[i].colour = 'black';
    }   
  }

  /**
   * Simple function to toggle the spinner
   * @author Ycreak
   */
  public toggle_spinner(): void{
    this.spinner = !this.spinner;
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
    let new_fragment_column = new Fragment_column(String(this.column_identifier),'', '', '', '');
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
      return object.column_id === column_id;
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
      return object.column_id === column_id;
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
      this.columns = this.utility.move_element_in_array(this.columns, from_index, to_index)
    }
  }

  /**
   * This function creates a list of connected columns to allow dragging and dropping
   * @author Ycreak
   */
  public update_connected_columns_list(): void{
    this.connected_columns_list = [];
    for (let i of this.columns) {
      this.connected_columns_list.push(String(i.column_id));
    };
  }

  /**
   * This function allows the playground to delete notes and fragements
   * @param column column from which the deletion is to take place
   * @param item either a note or a fragment needs deletion
   */
  public delete_clicked_item_from_playground(column: Fragment_column, item: string): void{
    if(item == 'fragment'){
      const object_index = column.fragments.findIndex(object => {
        return object.fragment_id === column.clicked_fragment.fragment_id;
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

  public scroll_linked_fragments(fragment: Fragment){

    for(let i in fragment.linked_fragments){
      let linked_fragment_id = fragment.linked_fragments[i] 

      // Now, for each fragment that is linked, try to find it in the other columns
      for(let j in this.columns){
        // in each column, take a look in the fragments array to find the linked fragment
        let corresponding_fragment = this.columns[j].fragments.find(i => i.fragment_id === linked_fragment_id);
        // move to this fragment if found
        if(corresponding_fragment) {
          // Scroll to the corresponding element in the found column
          const element = document.getElementById(corresponding_fragment.fragment_id);
          element.scrollIntoView({block: "nearest", behavior: "smooth"}); 
        }
      }    
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
        let corresponding_fragment = this.columns[j].fragments.find(i => i.fragment_id === linked_fragment_id);
        // colour it if found
        if(corresponding_fragment) corresponding_fragment.colour = '#FF4081';
      }
      // Do the same for the playground
      let corresponding_fragment = this.playground.fragments.find(i => i.fragment_id === linked_fragment_id);
      // colour it if found
      if(corresponding_fragment) corresponding_fragment.colour = '#FF4081';
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
   * Function to handle the settings dialog. Will save changes via the oscc_settings object
   * @author Ycreak
   */
  public open_settings(): void {
    this.dialog.open_settings_dialog(this.oscc_settings).subscribe(result => {
      this.oscc_settings.dragging_disabled = result['dragging_disabled']
      this.oscc_settings.auto_scroll_linked_fragments = result['auto_scroll_linked_fragments']
    });
  }

  /**
   * We keep track of dragging and dropping within or between columns. If an edit occurs,
   * we set the corresponding fragment_column boolean 'edited' to true.
   * @param event containing the column identifiers of those that are edited
   * @author Ycreak
   * @TODO: what type is 'event'? CdkDragDrop<string[]> does not allow reading.
   */
  private track_edited_columns(event: any): void {    
    // First, find the corresponding columns in this.columns using the column_id that is used
    // in this.connected_columns_list used by cdkDrag (and encoded in event)
    let edited_column_1 = this.columns.find(i => i.column_id === event.container.id);
    let edited_column_2 = this.columns.find(i => i.column_id === event.previousContainer.id);
    // Next, set the edited flag to true.
    edited_column_1.edited = true;
    edited_column_2.edited = true;
  }

  /**
   * This function opens the requested introduction in a dialog
   * @param requested_introduction string containing the requested introduction
   * @author Ycreak
   * @TODO: this should be moved to the server
   */
  private request_introduction(requested_introduction: string): void {
    let new_introduction = new Introductions();
    let my_introduction = new_introduction.dict[requested_introduction];
    this.dialog.open_custom_dialog(my_introduction);
  }

  /**
   * Test function
   * @author Ycreak
   */  
  private test(thing): void{
    console.log('############ TESTING ############')
    // console.log(this.commentary_column);

    // console.log(this.columns[thing.container.id])
    // console.log(this.columns[thing.previousContainer.id])
    // this.utility.spinner_on()
    // console.log('coord X: ' + (thing.layerX - thing.offsetX))
    // console.log('coord Y: ' + (thing.layerY - thing.offsetY))

    // for (let i in this.playground.fragments){
    //   let fragment_id = this.playground.fragments[i].fragment_id
    //   let element = document.getElementById(fragment_id)
    //   let rect = element.getBoundingClientRect();
    //   console.log(fragment_id, rect.top, rect.right, rect.bottom, rect.left);
    // }

    

    // let box = document.getElementById('233cabdf0f5144d78b82849c8aada6da')
    // box.style.top = '358px';
    // box.style.left = '808px';

    // let x = this.get_offset( document.getElementById(thing) ); 

    // console.log(box)

    // this.column2 = new Fragment_column(2, 'ETR', 'Ennius', 'Thyestes', 'Ribbeck');
    // this.columns.push(this.column2)
    // this.request_authors(this.column2)
    // this.request_fragments(this.column2);
    
    // this.update_connected_columns_list();
    // this.column3 = new Fragment_column(3, 'ETJ', 'Ennius', 'Thyestes', 'Jocelyn');
    // this.column4 = new Fragment_column(4, 'ETV', 'Ennius', 'Thyestes', 'Vahlen');    
    
    // this.columns.push(this.column3)
    // this.columns.push(this.column4)

    // this.request_authors(this.column3)
    // this.request_authors(this.column4)


    // this.request_fragments(this.column3);
    // this.request_fragments(this.column4);


    console.log('############ ####### ############')
  }

    /**
     * Function to check if the fragment has content
     * @param fragment to be checked for content
     * @returns bool true if the fragment has at least one content field that is not empty
     * @author Ycreak
     * TODO: i would like this function to be in Fragment.ts. Is that possible?
     */
     public fragment_has_content(fragment: Fragment){
            
      if( fragment.differences != '' || 
          fragment.apparatus != '' ||
          fragment.translation != '' ||
          fragment.commentary != '' ||
          fragment.reconstruction != ''
      ){
          return true;
      }
      else{
          return false;
      }
  }

  /**
   * This function adds HTML to the lines of the given array. At the moment,
   * it converts white space encoding for every applicable line by looping through
   * all elements in a fragment list.
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
        let line_text = current_fragment.lines[item].text;
        line_text = this.utility.convert_whitespace_encoding(line_text)
        // Now push the updated lines to the correct place
        let updated_lines = {
          'line_number': current_fragment.lines[item].line_number,
          'text': line_text,
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
  private add_single_fragment_to_playground(column: Fragment_column, fragment_name): void{ // FIXME: Deprecated?

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
   * @param fragment wich is to be filled with data from the server
   * @param data which is received from the server
   * @author Ycreak
   */
  private add_content_to_current_fragment(fragment: Fragment, data: Fragment): void{
    for (let item of ['translation', 'differences', 'apparatus', 'commentary',
                      'reconstruction', 'context', 'bibliography']) {       
      if(data[item] != ''){ fragment[item] = data[item]}
    }
  }

  /**
   * Simple function that retrieves the viewport size
   * @returns viewport size as integer
   * @author Ycreak
   * @TODO: move to utilities
   */
   private retrieve_viewport_size(): number {
    try {
      return window.innerWidth
    } catch (exceptionVar) {
      return 1100 // default-ish size
    }
  }

    /**
   * Simple function that generates a gradient color for each
   * fragment in a fragment column.
   * This is to indicate the initial order of the fragments.
   * 
   * Each fragment gets a color chosen from a set color
   * brightness range, though two neighboring fragments can
   * only have a set difference in brightness.
   * @param n_fragments The total number of fragments in the column
   * @param fragment_index The index of the current fragment
   * @returns: Color as HSL value (presented as string)
   * @author CptVickers
   */

    public generate_fragment_gradient_color(n_fragments: number, fragment_index: number){
      let max_brightness: number = 95;
      let min_brightness: number = 20;
      let max_brightness_diff: number = 30;

      let brightness_step = (max_brightness - min_brightness)/n_fragments;
      if (brightness_step > max_brightness_diff){
        brightness_step = max_brightness_diff;
      }
      let calculated_brightness = min_brightness+brightness_step*fragment_index;

      return `HSL(231, 48%, ${calculated_brightness}%)`
    }
}

