import { Context } from './Context';
import { Line } from './Line';

export class Fragment {
    constructor(

        public fragment_id: string,
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

    }

    colour: string = 'black';

    no_content: boolean = false;
    fragment_link_found: boolean = false;

}

