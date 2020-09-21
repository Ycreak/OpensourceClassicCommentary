export class Fragment
{
    constructor(id: number, bookID: number, name: string, lineName: string, editorID: number, lineContent: string, published: number, status: string)
    {
        this.id = id;
        this.book = bookID;
        this.fragmentName = name;
        this.lineName = lineName;
        this.editor = editorID;
        this.lineContent = lineContent;
        this.published = published;
        this.status = status;
    }

    id: number;
    book: number;
    fragmentName: string;
    lineName: string;
    editor: number;
    lineContent: string;
    published?: number;
    status: string;
}