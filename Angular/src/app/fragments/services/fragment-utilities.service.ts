/**
 * This service allows for fragment manipulation within the fragment component
 */
import { Injectable } from '@angular/core';

import { Column } from '../../models/Column';
import { Fragment } from '../../models/Fragment';

import { ApiService } from '../../api.service';
import { UtilityService } from '../../utility.service';

@Injectable({
  providedIn: 'root'
})
export class FragmentUtilitiesService {

  fragment_clicked: boolean = false; // Shows "click a fragment" banner at startup if nothing is yet selected

  constructor(
    private api : ApiService,
    private utility : UtilityService,
  ) { }

  /**
   * This function adds HTML to the lines of the given array. At the moment,
   * it converts white space encoding for every applicable line by looping through
   * all elements in a fragment list.
   * @param array with fragments as retrieved from the server
   * @returns updated array with nice HTML formatting included
   * @author Ycreak
   */
  public add_HTML_to_lines(array: Fragment[]): Fragment[]{        
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
   * Given the author, title and editor, request the names of the fragments from the server.
   * @param column that is to be filled with data
   * @author Ycreak
   */
  public request_fragment_names(column: Column): void {
    this.utility.spinner_on();
    this.api.get_fragment_names(new Fragment({
      author:column.selected_fragment_author, 
      title:column.selected_fragment_title, 
      editor:column.selected_fragment_editor})
    ).subscribe(
      data => {
        column.fragment_names = data.sort(this.utility.sort_array_numerically);
        this.utility.spinner_off(); 
      }
    );
  }

  /**
   * Sorts the given object of fragments on status. We want to display Certa, followed
   * by Incerta and Adespota.
   * @param fragments 
   * @returns fragments in the order we want
   * @author Ycreak
   */    
  public sort_fragments_on_status(fragments: Fragment[]): Fragment[]{
    let normal = this.utility.filter_object_on_key(fragments, 'status', "Certum")
    let incerta = this.utility.filter_object_on_key(fragments, 'status', 'Incertum')
    let adesp = this.utility.filter_object_on_key(fragments, 'status', 'Adesp.')
    // Concatenate in the order we want
    fragments = normal.concat(incerta).concat(adesp)
    return fragments
  }  

}
