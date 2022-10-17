export class Differences
{
    constructor(id: number, fragmentID: number = null, differences: string)
    {
        this.id = id;
        this.fragment = fragmentID;
        this.differences = differences;
    }

    id: number;
    fragment?: number;
    differences: string;
}