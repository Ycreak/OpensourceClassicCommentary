export class AppCrit
{
    constructor(id: number, fragmentID: number, appCrit: string)
    {
        this.id = id;
        this.fragment = fragmentID;
        this.appCrit = appCrit;
    }

    id: number;
    fragment: number;
    appCrit: string;
}