export class Apparatus
{
    constructor(id: number, fragmentID: number, apparatus: string)
    {
        this.id = id;
        this.fragment = fragmentID;
        this.apparatus = apparatus;
    }

    id: number;
    fragment: number;
    apparatus: string;
}