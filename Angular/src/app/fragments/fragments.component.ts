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
import { Column } from '../models/Column';
import { Introductions } from '../models/Introductions';

import { Text_column } from '../models/Text_column';
import * as internal from 'stream'; // TODO: What is this?
import { DateAdapter } from '@angular/material/core';

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
    fragment_order_gradient : false,
    auto_scroll_linked_fragments : false,
    show_headers : true, 
    show_line_names : true, 
  }; 

  // Toggle switches for the HTML columns/modes
  commentary_enabled: boolean = true;
  playground_enabled: boolean = false;
  // Booleans for HTML related items
  spinner: boolean = false; // Boolean to toggle the spinner.
  server_down: boolean = true; // to indicate server failure
  // Global Class Variables with text data corresponding to the front-end text fields.
  current_fragment: Fragment; // Variable to store the clicked fragment and its data
  fragment_clicked: boolean = false; // Shows "click a fragment" banner at startup if nothing is yet selected

  // Object to store all column data: just an array with column data in the form of fragment columns
  columns: Column[] = [];

  // Data columns
  column1: Column;
  column2: Column;
  column3: Column;
  column4: Column;
  playground: Column;
  commentary_column: Column;

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
    this.window_size = this.utility.retrieve_viewport_size();    

    // Create an empty current_fragment variable to be filled whenever the user clicks a fragment
    // Its data is shown in the commentary column and not used anywhere else
    this.current_fragment = this.utility.create_empty_fragment();
    this.commentary_column = new Column({column_id:'255'});

    // Create templates for the possible fragment columns
    this.column1 = new Column({column_id:'1', author:'Ennius', title:'Thyestes', editor:'TRF'});
    // Push these to the columns array for later use in the HTML component
    this.columns.push(this.column1)
    // Request the fragments for the first column
    this.request_fragments(this.column1);
    this.api.request_authors(this.column1);
    // this.column1.author = 'Ennius'
    
    // And for the playground
    this.playground = new Column({column_id:'0', type:'playground'});
    this.api.request_authors(this.playground)
    // this.request_fragments(this.playground);

    // Create an observable to check for the changing of window size
    this.window_resize_observable$ = fromEvent(window, 'resize')
    this.window_resize_subscription$ = this.window_resize_observable$.subscribe( evt => {
      // Find the window size. If it is too small, we will abbreviate the title to save space on the navbar
      this.window_size = this.utility.retrieve_viewport_size();    
    })

    this.column2 = new Column({column_id:'2', author:'Ennius', title:'Thyestes', editor:'Jocelyn'});
    this.columns.push(this.column2)
    this.request_fragments(this.column2);
    this.api.request_authors(this.column2);
    this.column_identifier += 1;
    this.update_connected_columns_list();

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
   * @param column: Column 
   * @returns data -> column.retrieved_authors
   * @author Ycreak
   */
   private request_authors(column: Column): void{
    this.utility.spinner_on();

    this.api.get_authors(new Fragment()).subscribe(
      data => {
      // Enter this retrieved data in the correct column
      column.retrieved_authors = data;
      this.utility.spinner_off(); 
    });
  }

  /** Requests the API function for titles given the author.
   * @param column: Column 
   * @returns data -> column.retrieved_authors
   * @author Bors & Ycreak
   */
  private request_titles(column: Column): void{    
    this.utility.spinner_on();
    this.api.get_titles(new Fragment({author:column.author})).subscribe(
      data => {
        column.retrieved_titles = data; 
        this.utility.spinner_off(); 
      }
    );      
  }
  /**
   * Requests the API function for editors given the author and title.
   * @param column: Column
   * @returns data -> column.retrieved_editors 
   * @author Bors & Ycreak
   */
  private request_editors(column: Column): void{   
    this.utility.spinner_on();
    this.api.get_editors(new Fragment({author:column.author, title:column.title})).subscribe(
      data => {
        column.retrieved_editors = data;
        this.utility.spinner_off(); 
      }
    );
  }

  /**
   * Requests the API function for fragments given the author, title and editor.
   * @param column: Column
   * @returns Object with fragments that are sorted numerically and on their status. Also
   *          adds an HTML formatted string to the object for easy printing. Note that the
   *          new data is added to the corresponding field in the provided parameter
   * @author Bors & Ycreak
   */
  private request_fragments(column: Column): void{
    this.utility.spinner_on();
    
    this.api.get_fragments(new Fragment({author:column.author, title:column.title, editor:column.editor})).subscribe(
      data => {
        //TODO: can this be done automatically within the API?
        let fragment_list = this.api.convert_fragment_json_to_typescript(data);
        // Format the data just how we want it
        fragment_list = this.add_HTML_to_lines(fragment_list);
        fragment_list = fragment_list.sort(this.utility.sort_fragment_array_numerically);
        fragment_list = this.sort_fragments_on_status(fragment_list);
        // Store the formatted data at the correct place
        if(column.type != 'playground'){
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
   * Given the author, title and editor, request the names of the fragments from the server.
   * @param column that is to be filled with data
   * @author Ycreak
   */
   public request_fragment_names(column: Column): void {
    this.utility.spinner_on();
    this.api.get_fragment_names(new Fragment({author:column.author, title:column.title, editor:column.editor})).subscribe(
      data => {
        column.fragment_names = data.sort(this.utility.sort_array_numerically);
        this.utility.spinner_off(); 
      });
  }

  /**
   * Function to handle what happens when an editor is selected in HTML.
   * @param fragment selected by the user
   * @author Ycreak
   */
  private handle_editor_click(column): void {
    column.edited = false;
    // If we are in the playground, we request fragment names. Else we request fragments.
    if ( column.type == 'playground' ) {
      this.request_fragment_names(column)
    }
    else{
      this.request_fragments(column)
    }
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
          
        // Reset the commentary column and its linked fragments
        this.commentary_column.linked_fragments_content = [];
  
        // Now retrieve all linked fragments to show their content in the commentary column
        for(let i in fragment.linked_fragments){
          let linked_fragment = this.utility.create_empty_fragment()
          linked_fragment.fragment_id = fragment.linked_fragments[i]
          // Request the fragment
          //TODO: migrate
          // this.api.get_specific_fragment(linked_fragment).subscribe(
          //   data => {
          //     linked_fragment = data;
          //     // and push it to the commentary column
          //     this.commentary_column.linked_fragments_content.push(linked_fragment)
          //     this.utility.spinner_off();
          //   });
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
   * This function adds a new column to the columns array
   * @author Ycreak
   */
  public add_column(): void{
    //TODO: shall we create a limit? like no more than 100,000 columns?
    // First, increment the column_identifier to create a new and unique id
    this.column_identifier += 1;

    // Create new column with the appropriate name. TODO: create better identifiers than simple integers
    let new_Column = new Column({column_id:String(this.column_identifier)});

    this.columns.push(new_Column)    
    this.api.request_authors(new_Column);
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
  public delete_clicked_item_from_playground(column: Column, item: string): void{
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
    });
  }

  /**
   * Function to handle the settings dialog. Will save changes via the oscc_settings object
   * @author Ycreak
   */
  public open_settings(): void {
    this.dialog.open_settings_dialog(this.oscc_settings).subscribe((result) => {
      if ( result ) {
        this.oscc_settings.dragging_disabled = result['dragging_disabled'];
        this.oscc_settings.fragment_order_gradient = result['fragment_order_gradient'];
        this.oscc_settings.auto_scroll_linked_fragments = result['auto_scroll_linked_fragments'];
      }
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
   * Simple function to toggle the playground column
   * @author Ycreak
   */
  private toggle_playground(): void {
    this.playground_enabled = !this.playground_enabled;
  }

  /**
   * Simple function to toggle the commentary column
   * @author Ycreak
   */
  private toggle_commentary(): void {
    this.commentary_enabled = !this.commentary_enabled;
  }

  /**
   * Test function
   * @author Ycreak
   */  
  public test(thing): void{
    console.log('############ TESTING ############')
    console.log(this.column1);

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

    // this.column2 = new Column(2, 'ETR', 'Ennius', 'Thyestes', 'Ribbeck');
    // this.columns.push(this.column2)
    // this.request_authors(this.column2)
    // this.request_fragments(this.column2);
    
    // this.update_connected_columns_list();
    // this.column3 = new Column(3, 'ETJ', 'Ennius', 'Thyestes', 'Jocelyn');
    // this.column4 = new Column(4, 'ETV', 'Ennius', 'Thyestes', 'Vahlen');    
    
    // this.columns.push(this.column3)
    // this.columns.push(this.column4)

    // this.request_authors(this.column3)
    // this.request_authors(this.column4)


    // this.request_fragments(this.column3);
    // this.request_fragments(this.column4);


    console.log('############ ####### ############')
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
  private add_single_fragment_to_playground(column: Column, fragment_name): void{ // FIXME: Deprecated?
    // format the fragment and push it to the list
    this.api.get_fragments(new Fragment({author:column.author, title:column.title, editor:column.editor, fragment_name:column.fragment_name})).subscribe(
      fragments => {
        let fragment_list = this.api.convert_fragment_json_to_typescript(fragments);
        //FIXME: this could be more elegant. But the idea is that we need to add HTML. However,
        // the function add_HTML_to_lines expects a list. This list always has one element.
        let html_fragment_list = this.add_HTML_to_lines([fragment_list[0]]);
        column.fragments.push(html_fragment_list[0])
      });
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
      if (this.oscc_settings.fragment_order_gradient == true){
        let max_hue: number = 360;
        let min_hue: number = 0;
        let max_hue_diff: number = 30;
  
        let hue_step = (max_hue - min_hue)/n_fragments;
        if (hue_step > max_hue_diff){
          hue_step = max_hue_diff;
        }
        let calculated_hue = min_hue+hue_step*fragment_index;
  
        return `HSL(${calculated_hue}, 48%, 50%)`
      }
      else{
        return 'transparent'
      }
    }
}

