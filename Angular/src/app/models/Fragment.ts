import { Context } from './Context';
import { Line } from './Line';

/** This class represents a fragment and all its data fields */
export class Fragment {
    
    fragment_id: string = '';
    author: string = '';
    title: string = '';
    editor: string = '';
    fragment_name: string = '';

    translation: string = '';
    differences: string = '';
    apparatus: string = '';
    commentary: string = '';
    reconstruction: string = '';
    context: Context[];

    status: string = '';
    lines: Line[] = [];
    linked_fragments: string[] = [];

    lock: string = '';
    published: string = '';

    bibliography: string[];   
    
    // designates the css color of the fragment header
    colour: string = 'black';
    
    constructor(){
    
    }

    public set_fragment ( fragment ) {

        if ( 'id' in fragment ){ this.fragment_id = fragment['id'] } 
        if ( 'author' in fragment ){ this.author = fragment['author'] } 
        if ( 'title' in fragment ){ this.title = fragment['title'] } 
        if ( 'editor' in fragment ){ this.editor = fragment['editor'] } 
        if ( 'name' in fragment ){ this.fragment_name = fragment['name'] } 
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


    // public fragment_id: string = '';
    // public author: string = '';
    // public title: string = '';
    // public editor: string = '';
    // public fragment_name: string = '';

    // public translation: string = '';
    // public differences: string = '';
    // public apparatus: string = '';
    // public commentary: string = '';
    // public reconstruction: string = '';
    // public context: Context[];

    // public status: string = '';
    // public lines: Line[] = [];
    // public linked_fragments: string[] = [];

    // public lock: string = '';
    // public published: string = '';

    // public bibliography: string[];


    // deprecated
    no_content: boolean = false;
    // deprecated
    fragment_link_found: boolean = false;

}

