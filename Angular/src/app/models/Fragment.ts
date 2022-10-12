import { Context } from './Context';
import { Line } from './Line';

export class Fragment {
    constructor(

        public id: string,
        public fragment_name: string,
        public author: string,
        public title: string,
        public editor: string,

        public translation: string,
        public differences: string,
        public apparatus: string,
        public commentary: string,
        public reconstruction: string,
        public context: Context[],

        public status: string,
        public lines: Line[],
        public linked_fragments: string[],

        public lock: number,

        public bibliography: string[],

    ) {


        // if(fragment['id']) this.fragment_id = fragment['id']

        // if(fragment['fragment_name']) this.fragment_name = fragment['fragment_name']
        // if(fragment['author']) this.author = fragment['author']
        // if(fragment['title']) this.title = fragment['title']
        // if(fragment['editor']) this.editor = fragment['editor']

        // if(fragment['translation']) this.translation = fragment['translation']
        // if(fragment['differences']) this.differences = fragment['differences']
        // if(fragment['apparatus']) this.apparatus = fragment['apparatus']
        // if(fragment['commentary']) this.commentary = fragment['commentary']
        // if(fragment['reconstruction']) this.reconstruction = fragment['reconstruction']

        // if(fragment['status']) this.status = fragment['status']
        // if(fragment['context']) this.context = fragment['context']
        // if(fragment['lines']) this.lines = fragment['lines']
        // if(fragment['linked_fragments']) this.linked_fragments = fragment['linked_fragments']

        // if(fragment['bibliography']) this.bibliography = fragment['bib_entries']

    }

    // fragment_id : string;
    // fragment_name : string = 'TBA';
    // author : string = 'TBA';
    // title : string = 'TBA';
    // editor : string = 'TBA';
    // translation : string;
    // differences : string;
    // apparatus : string;
    // commentary : string;
    // reconstruction : string;
    // status : string;
    // context : object;
    // lines : object;
    // linked_fragments; // this is a list
    // bibliography : Array<string> = [];

    colour: string = 'black';

    no_content: boolean = false;
    fragment_link_found: boolean = false;

}

