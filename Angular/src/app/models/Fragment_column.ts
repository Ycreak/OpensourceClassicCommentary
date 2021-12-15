import { Fragment } from './Fragment';

export class Fragment_column
{
    constructor(name: string, author: string, title: string, editor: string)
    {
        this.name = name;
        
        this.author = author;
        this.title = title;
        this.editor = editor;

        this.retrieved_authors = [];
        this.retrieved_titles = [];
        this.retrieved_editors = [];

    }

    name : string = 'TBA'

    author : string = 'TBA';
    title : string = 'TBA';
    editor : string = 'TBA';

    fragments : Array<Fragment> = [];
    fragment_numbers : Array<string> = [];

    // Should be a nice object, not a dirty json
    retrieved_authors : object;
    retrieved_titles : object;
    retrieved_editors : object;
}

