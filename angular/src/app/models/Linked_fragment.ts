export class Linked_fragment {
  constructor(
    public linked_fragment_id: string,
    public document_type = 'fragment',
    public author: string,
    public title: string,
    public editor: string,
    public name: string
  ) {}
}
