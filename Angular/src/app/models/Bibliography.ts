// This feels so clunky.
export class Bibliography
{

    constructor(
        id: number,
        text: number,
        editors: string,
        author: string,
        title: string,
        article: string,
        journal: string,
        volume: string,
        chapterTitle: string,
        pages: string,
        place: string,
        year: string,
        website: string,
        url: string,
        consultDate: string,
        )
    {
        this.id = id;
        this.text = text;
        this.editors = editors
        this.author = author
        this.title = title
        this.article = article
        this.journal = journal
        this.volume = volume
        this.chapterTitle = chapterTitle
        this.pages = pages
        this.place = place
        this.year = year
        this.website = website
        this.url = url
        this.consultDate = consultDate
    }

    id: number;
    text?: number;

    editors: string;
    author: string;
    title: string;
    article: string;
    journal: string;
    volume: string;
    chapterTitle: string;
    pages: string;
    place: string;
    year: string;
    website: string;
    url: string;
    consultDate: string;
}