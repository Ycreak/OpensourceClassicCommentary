import { Fragment } from './Fragment';

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

    column_id : string = ''; // has to be a string for cdkDrag
    type : string = ''; // denotes playground, commentary, text or fragment column

    author : string = '';
    title : string = '';
    editor : string = '';
    fragment_name : string = '';

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

    // Original order of the column fragments
    orig_fragment_order: string[] = [];
}

