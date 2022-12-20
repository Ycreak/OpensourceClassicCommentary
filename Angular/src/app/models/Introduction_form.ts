export class Introduction_form {
    constructor ( introduction? : Partial<Introduction_form>){
        // Allow the partial initialisation of the object
        Object.assign( this, introduction );  
    }

    author = '';
    title = '';
    author_introduction_text = '';
    title_introduction_text = '';

    // TODO: Comments
    retrieved_authors: string[] = [];
    retrieved_titles: string[] = [];
}
