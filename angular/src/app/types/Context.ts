export class Context {
  constructor(
    public author: string,
    public location: string,
    // Broader context in which the fragment appears
    public text: string,
    // Commentary to this specific context
    public commentary: string
  ) {
    // this.id = id;
    // this.fragment = fragmentID;
    // this.contextAuthor = contextAuthor;
    // this.context = context;
  }

  // id: number;
  // fragment?: number;
  // contextAuthor: string;
  // context: string;
}
