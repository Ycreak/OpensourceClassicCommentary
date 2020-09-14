export class Editor
{
    constructor(id: number, bookID: number, name: string, defaultEditor: number)
    {
        this.id = id;
        this.book = bookID;
        this.editorName = name;
        this.defaultEditor = defaultEditor;
    }

    id: number;
    book: number;
    editorName: string;
    defaultEditor?: number;
}