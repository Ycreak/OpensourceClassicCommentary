export class Translation
{
    constructor(id: number, fragmentID: number, translation: string)
    {
        this.id = id;
        this.fragment = fragmentID;
        this.translation = translation;
    }


    id: number;
    fragment: number;
    translation: string;
}