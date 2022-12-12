import { Context } from './Context';
import { Line } from './Line';
import { Linked_fragment } from './Linked_fragment';

/** This class represents a fragment and all its data fields */
export class Fragment {
    
    _id: string = '';
    author: string = '';
    title: string = '';
    editor: string = '';
    name: string = '';

    translation: string = '';
    differences: string = '';
    apparatus: string = '';
    commentary: string = '';
    reconstruction: string = '';
    context: Context[];

    status: string = '';
    lines: Line[] = [];
    linked_fragments: Linked_fragment[] = [];

    lock: string = '';
    published: string = '';

    bibliography: string[];   
    
    // designates the css color of the fragment header
    colour: string = 'black';
    
    constructor ( fragment? : Partial<Fragment> ) {
        // Allow the partial initialisation of a fragment object
        Object.assign(this, fragment);
    }

    /**
     * Converts the JSON received from the server to a Typescript object
     * @param fragment with JSON data received from the server
     * @author Ycreak
     */
    public set_fragment ( fragment ) {

        if ( '_id' in fragment ){ this._id = fragment['_id'] } 
        if ( 'author' in fragment ){ this.author = fragment['author'] } 
        if ( 'title' in fragment ){ this.title = fragment['title'] } 
        if ( 'editor' in fragment ){ this.editor = fragment['editor'] } 
        if ( 'name' in fragment ){ this.name = fragment['name'] } 
        if ( 'translation' in fragment ){ this.translation = fragment['translation'] } 
        if ( 'differences' in fragment ){ this.differences = fragment['differences'] } 
        if ( 'apparatus' in fragment ){ this.apparatus = fragment['apparatus'] } 
        if ( 'commentary' in fragment ){ this.commentary = fragment['commentary'] } 
        if ( 'reconstruction' in fragment ){ this.reconstruction = fragment['reconstruction'] } 
        if ( 'context' in fragment ){ this.context = fragment['context'] } 
        if ( 'status' in fragment ){ this.status = fragment['status'] } 
        if ( 'lines' in fragment ){ this.lines = fragment['lines'] } 
        if ( 'linked_fragments' in fragment ){ this.linked_fragments = fragment['linked_fragments'] } 
        if ( 'lock' in fragment ){ this.lock = fragment['lock'] } 
        if ( 'published' in fragment ){ this.published = fragment['published'] } 
        if ( 'bibliography' in fragment ){ this.bibliography = fragment['bibliography'] }

    }

    /**
     * Returns true if the given fragment has one of its content fields filled
     * @param fragment to be investigated for content
     * @returns boolean whether content is present
     * @author Ycreak
     */
    public has_content ( ) {
                
        if( this.differences != '' || 
            this.apparatus != '' ||
            this.translation != '' ||
            this.commentary != '' ||
            this.reconstruction != ''
        ){
            return true;
        }
        else{
            return false;
        }
    }

    // deprecated
    fragment_link_found: boolean = false;

}

