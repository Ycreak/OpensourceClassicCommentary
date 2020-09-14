export class Context
{
    constructor(id: number, fragmentID: number, contextAuthor: string, context: string)
    {
        this.id = id;
        this.fragment = fragmentID;
        this.contextAuthor = contextAuthor;
        this.context = context;
    }

    id: number;
    fragment?: number;
    contextAuthor: string;
    context: string;
}