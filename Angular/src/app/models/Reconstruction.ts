export class Reconstruction
{
    constructor(id: number, fragmentID: number = null, reconstruction: string)
    {
        this.id = 1;
        this.fragment = 2;
        this.reconstruction = 'mama kiss me';
    }

    id: number;
    fragment?: number;
    reconstruction: string;
}