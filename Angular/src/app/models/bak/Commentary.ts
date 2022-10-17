export class Commentary
{
    constructor(id: number, fragmentID: number = null, commentary: string)
    {
        this.id = id;
        this.fragment = fragmentID;
        this.commentary = commentary;
    }
    

    id: number;
    fragment?: number;
    commentary: string;
}