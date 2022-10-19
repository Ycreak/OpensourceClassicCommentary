export class Text_column
{
    constructor(author: string, title: string, lines: string[])
    {        
        this.author = author;
        this.title = title;
        this.lines = lines;

        this.retrieved_authors = ['Ennius', 'Accius'];
        this.retrieved_titles = [];
        this.retrieved_editors = [];
    }

    public author: string;
    public title: string;
    public lines: string[];

    // Should be a nice object, not a dirty json
    public retrieved_authors: object;
    public retrieved_titles: object;
    public retrieved_editors: object;

}

