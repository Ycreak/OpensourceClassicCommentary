export class Reconstruction
{
    constructor(id: number, fragmentID: number = null, reconstruction: string)
    {
        this.id = id;
        this.fragment = fragmentID;
        this.reconstruction = reconstruction;
    }

    id: number;
    fragment?: number;
    reconstruction: string;
}