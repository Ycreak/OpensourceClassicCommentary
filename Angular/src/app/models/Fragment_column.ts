import { Author } from './Author';
import { Editor } from './Editor';
import { Title } from './Title';

import { Fragment } from './Fragment';

/**
 * This class represents a Fragment column, which contains meta data about a column. Most
 * important within a column is the Fragments object, which is a list containing fragments.
 * This class is also used to pass to api request functions as a pass by reference object.
 * It is also used by the playground and the dashboard.
 */
export class Fragment_column
{
    constructor(id: string, name: string, author: string, title: string, editor: string)
    {
        this.column_id = id
        this.name = name;
        
        this.author = author;
        this.title = title;
        this.editor = editor;

        this.retrieved_authors = [];
        this.retrieved_titles = [];
        this.retrieved_editors = [];
    }

    column_id : string; // has to be a string for cdkDrag
    name : string;

    author : string;
    title : string;
    editor : string;
    fragment_name : string;

    fragments : Fragment[] = [];
    fragment_names : string[] = [];

    retrieved_authors : Author[];
    retrieved_titles : Title[];
    retrieved_editors : Editor[];
    retrieved_fragment_names : string[];

    note_array : Array<string> = [];

    clicked_fragment : Fragment;
    linked_fragments_content : Fragment[] = []; //FIXME: needs to be different from Fragment.linked_fragments

    clicked_note : string;

    // Boolean to keep track whether a column has seen an edit
    edited : boolean = false;

    // Whether to show or hide the column
    visible: boolean = true;
}

