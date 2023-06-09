/** This class represents a bib entry and all its data fields */
export class Bib {
  place: string;
  date: string;

  lastname: string;
  firstname: string;
  title: string;
  key: string;

  /**
   * Converts the JSON received from the server to a Typescript object
   * @param bib with JSON data received from the server
   * @author Ycreak
   */
  public set(bib: any) {
    this.place = 'place' in bib.data ? bib.data.place : '';
    this.date = 'date' in bib.data ? bib.data.date : '';
    this.lastname = 'creators' in bib.data ? bib.data.creators[0].lastName : '';
    this.firstname = 'creators' in bib.data ? bib.data.creators[0].firstName : '';
    this.title = 'title' in bib.data ? bib.data.title : '';
    this.key = 'key' in bib ? bib.key : '';
  }
}
