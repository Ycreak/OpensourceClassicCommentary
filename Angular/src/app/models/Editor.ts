export class Editor
{
    constructor(id: number, bookID: number, name: string, MainEditor: number)
    {
        this.id = id;
        this.book = bookID;
        this.name = name;
        this.MainEditor = MainEditor;
    }

    id: number;
    book: number;
    name: string;
    MainEditor?: number;
}