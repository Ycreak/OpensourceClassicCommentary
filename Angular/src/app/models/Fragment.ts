export class Fragment
{
    constructor(fragment)
    {
        if(fragment['id']) this.fragment_id = fragment['id']

        if(fragment['fragment_name']) this.fragment_name = fragment['fragment_name']
        if(fragment['author']) this.author = fragment['author']
        if(fragment['title']) this.title = fragment['title']
        if(fragment['editor']) this.editor = fragment['editor']

        if(fragment['translation']) this.translation = fragment['translation']
        if(fragment['differences']) this.differences = fragment['differences']
        if(fragment['apparatus']) this.apparatus = fragment['apparatus']
        if(fragment['commentary']) this.commentary = fragment['commentary']
        if(fragment['reconstruction']) this.reconstruction = fragment['reconstruction']

        if(fragment['status']) this.status = fragment['status']
        if(fragment['context']) this.context = fragment['context']
        if(fragment['lines']) this.lines = fragment['lines']
        if(fragment['linked_fragments']) this.linked_fragments = fragment['linked_fragments']

        if(fragment['bibliography']) this.bibliography = fragment['bib_entries']

    }

    public add_content(fragment){
        let temp_no_content = true; // Await activating the banner
        if(fragment['translation'] != ''){ this.translation = fragment['translation']; temp_no_content = false; }
        if(fragment['differences'] != ''){ this.differences = fragment['differences']; temp_no_content = false; }
        if(fragment['apparatus'] != ''){ this.apparatus = fragment['apparatus']; temp_no_content = false; }
        if(fragment['commentary'] != ''){ this.commentary = fragment['commentary']; temp_no_content = false; }
        if(fragment['reconstruction'] != ''){ this.reconstruction = fragment['reconstruction']; temp_no_content = false; }
        if(fragment['context'] != ''){ this.context = fragment['context']; temp_no_content = false; }
        if(fragment['bibliography'] != ''){ this.bibliography = fragment['bib_entries']; temp_no_content = false; }

        this.no_content = temp_no_content;
    }

    fragment_id : string;
    fragment_name : string = 'TBA';
    author : string = 'TBA';
    title : string = 'TBA';
    editor : string = 'TBA';
    translation : string;
    differences : string;
    apparatus : string;
    commentary : string;
    reconstruction : string;
    status : string;
    context : object;
    lines : object;
    linked_fragments; // this is a list
    bibliography : Array<string> = [];

    colour : string = 'black';

    no_content : boolean = false;
    fragment_link_found : boolean = false; 
}

