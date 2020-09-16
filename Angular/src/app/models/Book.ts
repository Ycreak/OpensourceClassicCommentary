export class Book
{
    constructor(id: number, authorID: number, title: string)
    {
        this.id = id;
        this.author = authorID;
        this.title = title;
    }
    
    id: number;
    author: number;
    title: string;
}