import { Author } from './Author';
import { Editor } from './Editor';
import { Book } from './Book';

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

    fragments : Fragment[] = [];
    fragment_numbers : string[] = [];

    retrieved_authors : Author[];
    retrieved_titles : Book[];
    retrieved_editors : Editor[];

    note_array : Array<string> = [];

    clicked_fragment : Fragment;
    clicked_note : string;

    // Whether to show or hide the column
    visible: boolean = true;
}

