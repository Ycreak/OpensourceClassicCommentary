/** This class represents an introduction and all its data fields */
export class Introduction {
  author: string;
  title: string;
  content: string;

  constructor(introduction?: Partial<Introduction>) {
    // Allow the partial initialisation of an introduction
    Object.assign(this, introduction);
  }

  /**
   * Converts the JSON received from the server to a Typescript object
   * @param introduction with JSON data received from the server
   * @author Ycreak
   */
  public set(introduction: any) {
    this.author = 'author' in introduction ? introduction['author'] : '';
    this.title = 'title' in introduction ? introduction['title'] : '';
    this.content = 'content' in introduction ? introduction['content'] : '';
  }
}
