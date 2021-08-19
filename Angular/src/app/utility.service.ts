import { Injectable } from '@angular/core';
import {MatSnackBar} from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class UtilityService {

  constructor(
    private snackBar: MatSnackBar,
  ) { }


    /**
     * Shared Dashboard and Fragments functions
     */

  /**
   * Returns a sorted list of all fragments numbers from a given editor
   * @param editor editor who's fragment numbers have to be retrieved
   * @param array array of all fragments. This is F_Fragments. //TODO: is this true?
   */
    public GetFragmentNumbers(editor: number, array){
      // Initialise list
      let list = [];
      // Push all fragment numbers to a list
      for(let key in array){      
        list.push(array[key].fragmentName);
      } 
      // Only take the unique values from this list
      list = this.uniq(list);
      // Sort list numerically
      return list.sort(this.SortNumeric);    
    }

    // This function merges the multiple lines in a single fragment.
    // The structure looks as follows: Fragment 2, [[1, "hello"],[2,"hi"]]
    public MergeLinesIntoFragment(givenArray){
      let array = [];
      let contentArray = [];
      // For each element in the given array
      for(let element in givenArray){
        // Data needed for proper retrieval
        let fragmentName = givenArray[element].fragmentName
        let lineContent = givenArray[element].lineContent //FIXME: Should be lineContent
        let lineName = givenArray[element].lineName
        let status = givenArray[element].status 
        let buildString = '<p>' + lineName + ': ' + lineContent + '</p>';
        // Turn tabs into HTML tabs
        buildString = this.ConvertWhiteSpace(buildString);
        // Find the element.fragmentName in the array and check whether it exists.
        let currentFragment = array.find(x => x.fragmentName === fragmentName)
        if(currentFragment){ // The current fragmentName is already in the array.
          // Save the content found in a temporary array
          contentArray = currentFragment.content;
          // Delete the entry (to allow it to be recreated after this if)
          array.splice(array.findIndex((x => x.fragmentName === fragmentName)),1);   
        }
        // Push the content (either completely new or with the stored content included)      
        contentArray.push({
          lineName: lineName,
          lineContent: lineContent,
          lineComplete: buildString,
        })
        // Push the created data to the array and empty the used arrays.
        array.push({ fragmentName: givenArray[element].fragmentName, content: contentArray, status: status})
        contentArray = [];
      }
      // Sort the lines in array, needs to be own function
      for(let element in array){
        array[element].content.sort(this.SortFragmentsArrayNumerically);
      }
      
      // Put normal fragments first, then incerta and then adespota. TODO: should be separate function
      let normal = this.FilterObjOnKey(array, 'status', '')
      let incerta = this.FilterObjOnKey(array, 'status', 'Incertum')
      let adesp = this.FilterObjOnKey(array, 'status', 'Adesp.')
      // Concatenate in the order we want (i'm a hacker)
      array = normal.concat(incerta).concat(adesp)
  
      console.log('array', array)
      return array
    }


  /**
  * Sorts array numerically on fragment number
  * @param a
  * @param b
  * @returns sorted array
  * @author Ycreak
  */ // TODO: Complete rewrite. Should put Adesp and Incert. on the bottom. 
  public SortNumeric(a: any, b: any) {
    // Sort array via the number element given.
    // To allow fragments like '350-356' to be ordered.
    const A = Number(a);
    const B = Number(b);

    let comparison = 0;
    if (A > B) {
      comparison = 1;
    } else if (A < B) {
      comparison = -1;
    }
    return comparison;
  }

  /**
  * Sorts array numerically on fragment number
  * @param boolean called from array
  * @returns sorted array.
  * @author Ycreak
  */ // TODO: Should put Adesp and Incert. on the bottom. 
  public SortArrayNumerically(a, b) {
    // Sort array via the number element given.
    // To allow fragments like '350-356' to be ordered.
    const A = Number(a.fragmentName.split("-", 1));
    const B = Number(b.fragmentName.split("-", 1));

    let comparison = 0;
    if (A > B) {
      comparison = 1;
    } else if (A < B) {
      comparison = -1;
    }
    return comparison;
  }

    /** A PARAMETER SHOULD BE GIVEN BUT I AM A WORTHLESS PROGRAMMER xD lineNumber vs fragNumber
  * Sorts array numerically on fragment number
  * @param boolean called from array
  * @returns sorted array.
  * @author Ycreak
  */ // TODO: Should put Adesp and Incert. on the bottom. 
  public SortFragmentsArrayNumerically(a, b) {
    // Sort array via the number element given.
    // To allow fragments like '350-356' to be ordered.
    const A = Number(a.lineName.split("-", 1));
    const B = Number(b.lineName.split("-", 1));

    let comparison = 0;
    if (A > B) {
      comparison = 1;
    } else if (A < B) {
      comparison = -1;
    }
    return comparison;
  }

  /**
   * Check if a json object is actually empty
   * @param obj -- json object to be checked
   * @returns whether obj is an empty json object
   * @author Ycreak, ppbors // Nani?
   */
  public IsEmpty(obj: JSON) : boolean {
    for (var prop in obj) {
      if (obj.hasOwnProperty(prop))
        return false;
    }
    return true;
  }

  public IsEmptyArray(array) : boolean {
    if(Array.isArray(array) && array.length){
      return false;
    }
    else{
      return true;
    }
  }

  // Returns a list of uniq numbers. Used for fragmentnumber lists.
  public uniq(a) {
    return a.sort().filter(function(item, pos, ary) {
        return !pos || item != ary[pos - 1];
    });
  }

  /**
   * Takes a string and looks for whitespace decoding. Converts it to html spans
   * @param string 
   */
  public ConvertWhiteSpace(string: string){
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

  public FilterObjOnKey(array, key, value){
    var temp = array.filter(obj => {
      return obj[key] === value;
    })
    return temp    
  } 

  // Creates main editor array: the third field has the mainEditor key. Should be named properly.
  public FilterArrayOnKey(array, key, value){
    return array.filter(x => x[key] === value);
  }

  public PushToArray(item, array){
    // Simple function to push given item to given array
    array.push(item);
    return array;
  }

  public PopArray(array){
    // Simple function to pop item from given array  
    let _ = array.pop();
    return array;
  }

  public Test(thing){
    console.log('Test output:', thing)
  }

    /**
   * Opens Material popup window with the given message
   * @param message information that is showed in the popup
   */
  public OpenSnackbar(message){
    this.snackBar.open(message, 'Close', {
    });
  }

  /**
   * Function to handle the error err. Calls Snackbar to show it on screen
   * @param err the generated error
   */
  public HandleErrorMessage(err) {
    console.log(err)
    let output = ''
    //TODO: needs to be more sophisticated
    if(err.statusText == 'OK'){
      output = 'Operation succesful.' 
    }
    else{
      output = 'Something went wrong.'
    }
    output = String(err.status) + ': ' + output + ' ' + err.statusText;
    this.OpenSnackbar(output); //FIXME: Spaghetti.
  } 

}


