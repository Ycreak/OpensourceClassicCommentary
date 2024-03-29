import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UtilityService {
  constructor(private snackBar: MatSnackBar) {}

  public sort_object_list_on_string_value(a: string, b: string, key: string) {
    if (a[key] < b[key]) {
      return -1;
    }
    if (a[key] > b[key]) {
      return 1;
    }
    return 0;
  }

  /** Sorts array numerically on fragment number
   * @param boolean called from array
   * @param field on which to perform the comparison
   * @returns sorted array.
   * @author Ycreak
   */
  public sort_fragment_array_numerically(a: any, b: any) {
    // Sort array via the number element given.
    // To allow fragments like '350-356' to be ordered.
    const A = Number(a.name.split('-', 1));
    const B = Number(b.name.split('-', 1));

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
    const A = Number(a.split('-', 1));
    const B = Number(b.split('-', 1));

    let comparison = 0;
    if (A > B) {
      comparison = 1;
    } else if (A < B) {
      comparison = -1;
    }
    return comparison;
  }

  /**
   * This function filters the given array on the given key if it is equal to the provided value
   * @param array to be filtered
   * @param key within the array to be filtered
   * @param value which should equal to the field to enable filtering
   * @returns the filtered array
   * @author Ycreak
   */
  public filter_object_on_key(array, key, value): Array<any> {
    const filtered_array = array.filter((obj) => {
      return obj[key] === value;
    });
    return filtered_array;
  }

  /**
   * Filters a list of objects on the object filter specified
   * @param array (list) with objects
   * @param filter (object)
   * @return list
   * @author Ycreak
   */
  public filter_array(array: Array<any>, filters: any) {
    const filter_keys = Object.keys(filters);
    return array.filter((item: any) => {
      // Check all filter criteria
      return filter_keys.every((key) => {
        // Ignore non-existent properties
        if (!Object.prototype.hasOwnProperty.call(item, key)) return true;
        // Compare values
        return item[key] === filters[key];
      });
    });
  }

  /**
   * Returns a unique list of the given key over a list of objects
   * @param list (array) with objects
   * @param key (string) of which values to create a Set
   * @return list of unique values
   * @author Ycreak
   */
  public get_set_of_key_values_from_object_list(list: any, key: string): string[] {
    return Array.from(
      new Set(
        list.map(function (el: any) {
          return el[key];
        })
      )
    );
  }

  /**
   * Opens Material popup window with the given message
   * @param message information that is showed in the popup
   * @author Ycreak
   */
  public open_snackbar(message): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
    });
  }

  /**
   * Function that adds a subscribable loading hint to the dashboard component
   * @author CptVickers
   */
  public get_loading_hint(): Observable<string> {
    const loading_hint = new Observable<string>((subscriber) => {
      function f() {
        subscriber.next('Loading data');
        setTimeout(function () {
          subscriber.next('Loading data.');
        }, 500);
        setTimeout(function () {
          subscriber.next('Loading data..');
        }, 1000);
        setTimeout(function () {
          subscriber.next('Loading data...');
        }, 1500);
      }
      f();
      const loading_hint_generator = setInterval(f, 2000);
      return function unsubscribe() {
        clearInterval(loading_hint_generator);
        subscriber.complete();
      };
    });
    return loading_hint;
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
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
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
   * Function to push an item to an array
   * @param item to be pushed
   * @param array to be extended
   * @returns new array with item pushed
   * @author Ycreak
   */
  public push_to_array(item: any, array: Array<any>): Array<any> {
    array.push(item);
    return array;
  }

  /**
   * Function to pop an item from an array
   * @param array to be popped
   * @returns new array with item popped
   * @author Ycreak
   */
  public pop_array(array: any) {
    array.pop();
    return array;
  }

  public is_empty_array(array: Array<any>): boolean {
    if (Array.isArray(array) && array.length) {
      return false;
    } else {
      return true;
    }
  }

  public is_array(x: any) {
    return Array.isArray(x);
  }

  /**
   * Checks if given object is a string
   */
  public is_string(x: any) {
    return Object.prototype.toString.call(x) === '[object String]';
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
    const element = arr[from_index];
    arr.splice(from_index, 1);
    arr.splice(to_index, 0, element);
    return arr;
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
   * Test function
   * @author Ycreak
   */
  private test(thing): void {
    console.log('############ TESTING ############');
    console.log(thing);
    console.log('############ ####### ############');
  }

  /**
   * Searches an array of objects based on the given object as filter. Returns all objects
   * that fit the filter description.
   * @param array of objects that needs filtering
   * @param search_object that functions as filter
   * @return array with objects based on filter
   * @author Ycreak
   */
  public filter_array_on_object(array: any, search_object: any) {
    return array.filter((el: any) => {
      return Object.entries(search_object).every(([key, value]) => String(el[key]).includes(String(value)));
    });
  }
}
