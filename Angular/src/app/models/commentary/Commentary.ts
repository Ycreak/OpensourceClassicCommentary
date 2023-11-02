export class Commentary_field {
  constructor(commentary?: Partial<Commentary_field>) {
    Object.assign(this, commentary);
  }

  text: string;
}
