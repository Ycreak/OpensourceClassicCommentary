/**
 * Represents a linked fragment with its meta data properties. 
 * Is used to later retrieve the entire linked fragment.
 */

export class Linked_fragment {
  constructor(
    public linked_fragment_id: string,
    public document_type = 'fragment',
    public author: string,
    public title: string,
    public editor: string,
    public name: string,
    public sandbox: string
  ) {}
}
