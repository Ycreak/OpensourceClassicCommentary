import { Fragment } from './Fragment';
import text_cache from './text_cache.json'

/**
 * This class represents a Fragment column, which contains meta data about a column. Most
 * important within a column is the Fragments object, which is a list containing fragments.
 * This class is also used to pass to api request functions as a pass by reference object.
 * It is also used by the playground and the dashboard.
 */
export class Column
{

    constructor( column? : Partial<Column> )
    {
        // Allow the partial initialisation of a fragment object
        Object.assign( this, column );     
    }

    text_cache: any = text_cache;

    column_id : string = ''; // has to be a string for cdkDrag
    type : string = ''; // denotes playground, commentary, text or fragment column

    selected_fragment_author : string = '';
    selected_fragment_title : string = '';
    selected_fragment_editor : string = '';
    selected_fragment_name : string = '';

    fragments : Fragment[] = [];
    fragment_names : string[] = [];

    retrieved_authors : string[] = [];
    retrieved_titles : string[] = [];
    retrieved_editors : string[] = [];
    retrieved_fragment_names : string[] = [];

    note_array : string[] = [];

    clicked_fragment : Fragment;
    linked_fragments_content : Fragment[] = []; //FIXME: needs to be different from Fragment.linked_fragments

    clicked_note : string;

    // Boolean to keep track whether a column has seen a user edit
    edited : boolean = false;

    // Whether to show or hide the column
    visible: boolean = true;

    // Whether the column is newly created. If so, we show 'SELECT TEXT' button instead of the selected data
    new_column : boolean = true;

    // Original order of the column fragments
    original_fragment_order: string[] = [];

    private get_titles(author: string): object {
        let filtered_objects = this.text_cache['cache'].filter(x => x.author == author);
        let title_list = new Set(filtered_objects.map(function (el) { return el.title; }));
        return title_list;
    }

    private get_editors(author: string, title: string): object {
        let filtered_objects = this.text_cache['cache'].filter(x => x.author == author && x.title == title);
        let editor_list = new Set(filtered_objects.map(function (el) { return el.editor; }));
        return editor_list;
    }
}

