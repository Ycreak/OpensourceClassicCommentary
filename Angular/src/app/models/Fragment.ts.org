export class Fragment
{
    constructor(id: number, bookID: number, editorID: number, name: string, lineName: string, lineContent: string, published: number, status: string)
    {
        this.id = id;
        this.book = bookID;
        this.editor = editorID;
        this.fragmentName = name;
        this.lineName = lineName;
        this.lineContent = lineContent;
        this.published = published;
        this.status = status;
    }

    id: number;
    book: number;
    editor: number;
    fragmentName: string;
    lineName: string;
    lineContent: string;
    published?: number;
    status: string;
}