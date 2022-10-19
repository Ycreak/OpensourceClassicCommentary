import { Fragment } from './Fragment';

export class Fragment_column
{
    constructor(id: number, name: string, author: string, title: string, editor: string)
    {
        this.id = id
        this.name = name;
        
        this.author = author;
        this.title = title;
        this.editor = editor;

        this.retrieved_authors = [];
        this.retrieved_titles = [];
        this.retrieved_editors = [];

    }

    id : number;
    name : string;

    author : string = 'TBA';
    title : string = 'TBA';
    editor : string = 'TBA';

    fragments : Array<Fragment> = [];
    fragment_numbers : Array<string> = [];

    secondary_fragments : Array<Fragment> = []; // Used for the playground. needs better design

    // Should be a nice object, not a dirty json
    retrieved_authors : object;
    retrieved_titles : object;
    retrieved_editors : object;

    note_array : Array<string> = [];

    // Whether to show or hide the column
    visible: boolean = true;
}

