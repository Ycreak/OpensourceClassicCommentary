import { fabric } from 'fabric';

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
  canvas: fabric.Canvas;

  font_size = 16;

  note_array: any[];
  fragment_names: string[];
  documents: any[];


  // Deprecate this
  note: string;

  author: string;
  title: string;
  editor: string;
  name2: string;

  retrieved_titles: string[];
  retrieved_editors: string[];
  //

  public clear() {
    this.documents = [];
    this.note_array = [];
    this.canvas.clear();
  }
}
