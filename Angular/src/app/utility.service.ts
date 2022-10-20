import { Injectable } from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';
import {CdkDragDrop, moveItemInArray, transferArrayItem, CdkDragEnd} from '@angular/cdk/drag-drop';

// Model imports 
import { Fragment } from './models/Fragment';
import { User } from './models/User';


@Injectable({
  providedIn: 'root'
})
export class UtilityService {

  constructor(
    private snackBar: MatSnackBar,
  ) { }

  /** Sorts array numerically on fragment number
  * @param boolean called from array
  * @param field on which to perform the comparison TODO:
  * @returns sorted array.
  * @author Ycreak
  */ 
  public sort_fragment_array_numerically(a, b) {
    // Sort array via the number element given.
    // To allow fragments like '350-356' to be ordered.
    const A = Number(a.fragment_name.split("-", 1));
    const B = Number(b.fragment_name.split("-", 1));

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
  }
  
  /**
   * Allows a fragment to be moved and dropped to create a custom ordering
   * @param event what happens to the column
   * @author Ycreak
   */
  public drop(event: CdkDragDrop<string[]>) {
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
    return new Fragment('', '', '', '', '', '', '', '', '', '', [], '', [], [], 0, []);
  }

  /**
   * Create an empty user to work with
   * @returns user object that is completely empty
   * @author Ycreak
   */
   public create_empty_user(): User {
    return new User('', '', '');
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

  public PopArray(array){
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

}


