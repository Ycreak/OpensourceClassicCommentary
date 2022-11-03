import { Author } from './Author';
import { Editor } from './Editor';
import { Title } from './Title';

import { Fragment } from './Fragment';

export class Fragment_column
{
    constructor(id: number, name: string, author: string, title: string, editor: string)
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

    column_id : number;
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

    // Whether to show or hide the column
    visible: boolean = true;
}

