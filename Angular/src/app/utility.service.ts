import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilityService {

  constructor() { }

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
    // Show that everything went well
    console.log('merged', array)
    return array;
  }

  // Creates main editor array: the third field has the mainEditor key. Should be named properly.
  public FilterArrayOnKey(array, key){
    return array.filter(x => x[key] == 1);
  }

}


