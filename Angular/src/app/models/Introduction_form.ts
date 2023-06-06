export class Introduction_form {
  constructor(introduction?: Partial<Introduction_form>) {
    // Allow the partial initialisation of the object
    Object.assign(this, introduction);
  }

  author = '';
  title = '';
  author_text = '';
  title_text = '';
}
