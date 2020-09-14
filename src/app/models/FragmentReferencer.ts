export class FragmentReferencer
{
    constructor(id: number, bookID: number, editorID: number, fragmentID: number, published: number = null)
    {
        this.id = id;
        this.book = bookID;
        this.editor = editorID;
        this.fragmentNo = fragmentID;
        this.published = published;
    }

    id: number;
    book: number;
    editor: number;
    fragmentNo: number;
    published?: number;
}