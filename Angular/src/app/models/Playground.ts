export class Playground {
  constructor(playground?: Partial<Playground>) {
    // Allow the partial initialisation of a playground object
    Object.assign(this, playground);
  }

  name: string;
  owner: string;
  shared_with: string[];
  canvas: any;
}
