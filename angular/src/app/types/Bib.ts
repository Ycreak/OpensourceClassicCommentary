/** This class represents a creator inside a bibliography item */
export class Creator {
  lastname: string;
  firstname: string;

  public set(creator: any) {
    this.lastname = 'lastName' in creator ? creator.lastName : '';
    this.firstname = 'firstName' in creator ? creator.firstName : '';
  }
}

/** This class represents a bib entry and all its data fields */
export class Bib {
  citation: string;
  place: string;
  date: string;

  creators: Creator[] = [];

  title: string;
  key: string;

  /**
   * Converts the JSON received from the server to a Typescript object
   * @param bib with JSON data received from the server
   * @author Ycreak
   */
  public set(bib: any) {
    this.citation = 'citation' in bib ? bib.citation : '';
    this.place = 'place' in bib.data ? bib.data.place : '';
    this.date = 'date' in bib.data ? bib.data.date : '';
    this.title = 'title' in bib.data ? bib.data.title : '';
    this.key = 'key' in bib ? bib.key : '';

    if ('creators' in bib.data) {
      for (const i in bib.data.creators) {
        const creator = new Creator();
        creator.set(bib.data.creators[i]);
        this.creators.push(creator);
      }
    }
  }
}
