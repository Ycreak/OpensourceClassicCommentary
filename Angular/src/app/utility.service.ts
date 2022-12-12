import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import {CdkDragDrop, moveItemInArray, transferArrayItem, CdkDragEnd} from '@angular/cdk/drag-drop';

// Model imports 
import { Fragment } from './models/Fragment';
import { User } from './models/User';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class UtilityService {

  spinner: boolean = false;

  constructor(
    private snackBar: MatSnackBar,
  ) { }

  /** Sorts array numerically on fragment number
  * @param boolean called from array
  * @param field on which to perform the comparison
  * @returns sorted array.
  * @author Ycreak
  */ 
  public sort_fragment_array_numerically(a, b) {
    // Sort array via the number element given.
    // To allow fragments like '350-356' to be ordered.   
    const A = Number(a.name.split("-", 1));
    const B = Number(b.name.split("-", 1));

    let comparison = 0;
    if (A > B) {
      comparison = 1;
    } else if (A < B) {
      comparison = -1;
    }
    return comparison;
  }

  /** Sorts array numerically
  * @param boolean called from array
  * @param field on which to perform the comparison
  * @returns sorted array.
  * @author Ycreak
  */ 
   public sort_array_numerically(a, b) {
    // Sort array via the number element given.
    // To allow fragments like '350-356' to be ordered.
    const A = Number(a.split("-", 1));
    const B = Number(b.split("-", 1));

    let comparison = 0;
    if (A > B) {
      comparison = 1;
    } else if (A < B) {
      comparison = -1;
    }
    return comparison;
  }


  /**
   * Takes a string and looks for whitespace decoding. Converts it to html spans
   * @param string that needs whitespaces converted to html spans
   * @returns string with whitespaces converted to html spans
   * @author Ycreak
   */
  public convert_whitespace_encoding(string: string): string{
    // Find fish hooks with number in between.
    const matches = string.match(/<(\d+)>/);
    // If found, replace it with the correct whitespace number
    if (matches) {
        console.log(matches);
        // Create a span with the number of indents we want. Character level.
        // matches[0] contains including fish hooks, matches[1] only number
        let replacement = '<span style="padding-left:' + matches[1] + 'ch;"></span>'
        string = string.replace(matches[0], replacement);       
    }  
    return string
  }

  /**
   * This function filters the given array on the given key if it is equal to the provided value
   * @param array to be filtered
   * @param key within the array to be filtered
   * @param value which should equal to the field to enable filtering
   * @returns the filtered array
   * @author Ycreak
   */
  public filter_object_on_key(array, key, value): Array<any>{
    let filtered_array = array.filter(obj => {
      return obj[key] === value;
    })
    return filtered_array    
  } 

  /**
   * Opens Material popup window with the given message
   * @param message information that is showed in the popup
   * @author Ycreak
   */
  public open_snackbar(message): void{
    this.snackBar.open(message, 'Close', {
      duration: 5000
    });
  }

  /**
   * Function to handle the error err. Calls Snackbar to show it on screen
   * @param err the generated error
   * @author Ycreak
   */
  public handle_error_message(err): void {
    let output = '';
    
    console.log(err)

    if (err.ok){
      output = err.status + ': ' + err.body;
    }
    else{
      output = err.status + ': ' + err.error;
    }    
    this.open_snackbar(output);
    this.spinner_off()
  }

  /**
   * Function that adds a subscribable loading hint to the dashboard component
   * @author CptVickers
   */
   public get_loading_hint(): Observable<string> {
    let loading_hint = new Observable<string>((subscriber) => {
      function f() {
        subscriber.next("Loading data");
        setTimeout(function() {subscriber.next("Loading data.")}, 500);
        setTimeout(function() {subscriber.next("Loading data..")}, 1000);
        setTimeout(function() {subscriber.next("Loading data...")}, 1500);
      }
      f();
      const loading_hint_generator = setInterval(f, 2000);
      return function unsubscribe() {
        clearInterval(loading_hint_generator);
        subscriber.complete();
      }
    })
    return loading_hint
  }
  
  /**
   * Allows a fragment to be moved and dropped to create a custom ordering
   * @param event what happens to the column
   * @author Ycreak
   */
  public drop(event: CdkDragDrop<string[]>) {
    
    // console.log(event)
    
    if (event.container === event.previousContainer) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
  }

  /**
   * Capitalizes the first letter of each given word
   * @param word the word to be capitalized
   * @returns string that is capitalized
   * @author CptVickers
   */
  public capitalize_word(word: string): string {
    if (!word) return word;
    return word[0].toUpperCase() + word.substr(1).toLowerCase();
  }

  /**
   * Create an empty fragment to work with
   * @returns Fragment object that is completely empty
   * @author Ycreak
   */
  public create_empty_fragment(): Fragment {
    //TODO: there should be a proper javascript way to do this
    return new Fragment();
  }

  /**
   * Create an empty user to work with
   * @returns user object that is completely empty
   * @author Ycreak
   */
  public create_empty_user(): User {
    return new User();
  }

  /**
   * Function to push an item to an array
   * @param item to be pushed
   * @param array to be extended
   * @returns new array with item pushed
   * @author Ycreak
   */
  public push_to_array(item, array): Array<any>{
    array.push(item);
    return array;
  }

  /**
   * Function to pop an item from an array
   * @param array to be popped
   * @returns new array with item popped
   * @author Ycreak
   */
  public pop_array(array){
    let _ = array.pop();
    return array;
  }

  /// TEXT COMPONENT
  /**
   * Check if a json object is actually empty
   * @param obj -- json object to be checked
   * @returns whether obj is an empty json object
   * @author Ycreak, ppbors // Nani?
   */
   public is_empty(obj: JSON): boolean {
    for (var prop in obj) {
      if (obj.hasOwnProperty(prop))
        return false;
    }
    return true;
  }

  public is_empty_array(array): boolean {
    if(Array.isArray(array) && array.length){
      return false;
    }
    else{
      return true;
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
   * Simple function to toggle the spinner
   * @author Ycreak
   */
  public spinner_on(): void{
    this.spinner = true;
  }

  /**
   * Simple function to toggle the spinner
   * @author Ycreak
   */
     public spinner_off(): void{
      this.spinner = false;
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

  // private get_offset( el ) {
  //   var _x = 0;
  //   var _y = 0;
  //   while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
  //       _x += el.offsetLeft - el.scrollLeft;
  //       _y += el.offsetTop - el.scrollTop;
  //       el = el.offsetParent;
  //   }
  //   return { top: _y, left: _x };
  // }

  /**
   * Simple function that retrieves the viewport size
   * @returns viewport size as integer
   * @author Ycreak
   */
   public retrieve_viewport_size(): number {
    try {
      return window.innerWidth
    } catch (e) {
      return 1100 // default-ish size
    }
  }

}


