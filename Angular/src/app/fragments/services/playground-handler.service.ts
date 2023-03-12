/**
 * This service allows for playground manipulation within the fragment component
 */

import { Injectable } from '@angular/core';

import { Column } from '../../models/Column';
import { Fragment } from '../../models/Fragment';

import { ApiService } from '../../api.service';
import { UtilityService } from '../../utility.service';
import { FragmentUtilitiesService } from './fragment-utilities.service';

@Injectable({
  providedIn: 'root'
})
export class PlaygroundHandlerService {

  // Playground column that keeps all data related to said playground
  playground: Column;
  // Boolean to keep track if we are dragging or clicking a fragment within the playground
  playground_dragging: boolean;
  
  constructor(
    private api : ApiService,
    private utility : UtilityService,
    private fragment_utilities : FragmentUtilitiesService,
  ) { 

    // And for the playground
    this.playground = new Column({column_id:'0', type:'playground'});
    this.api.request_authors(this.playground)
  }

  /**
   * This function allows the playground to delete notes and fragements
   * @param column column from which the deletion is to take place
   * @param item either a note or a fragment needs deletion
   * @author Ycreak
   */
  public delete_clicked_item_from_playground(column: Column, item: string): void{
    if(item == 'fragment'){
      const object_index = column.fragments.findIndex(object => {
        return object._id === column.clicked_fragment._id;
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
   * @param column to which the fragment is to be added
   * @author Ycreak
   */
  public add_single_fragment(column: Column, fragment_name: string): void {
    // format the fragment and push it to the list
    this.api.get_fragments(new Fragment({
      author:column.selected_fragment_author,
      title:column.selected_fragment_title, 
      editor:column.selected_fragment_editor, 
      name:fragment_name
    })).subscribe(
      fragments => {
        let fragment_list = this.api.convert_fragment_json_to_typescript(fragments);
        //FIXME: this could be more elegant. But the idea is that we need to add HTML. However,
        // the function add_HTML_to_lines expects a list. This list always has one element.
        let html_fragment_list = this.fragment_utilities.add_HTML_to_lines([fragment_list[0]]);
        column.fragments.push(html_fragment_list[0])
      }
    );
  }

}
