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
}
