export class Fragment2
{
    constructor(fragment_name: string, author: string, book: string, editor: string, status: string)
    {
        this.fragment_name = fragment_name;
        this.author = author;
        this.book = book;
        this.editor = editor;
        this.status = status;
    }

    fragment_name : string;
    author : string;
    book : string;
    editor : string;
    translation : string;
    differences : string;
    apparatus : string;
    commentary : string;
    reconstruction : string;
    status : string;
    context : object;
    lines : object;
    linked_fragments : object;
}

