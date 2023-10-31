export class Playground {
  constructor(playground?: Partial<Playground>) {
    // Allow the partial initialisation of a playground object
    Object.assign(this, playground);
  }

  _id: string;
  name: string;
  owner: string;
  user: string;
  shared_with: string[];
  canvas: any;

  note_array: any[];
  fragment_names: string[];
  documents: any[];
}
