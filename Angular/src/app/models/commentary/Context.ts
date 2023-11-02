export class Context_field {
  constructor(context?: Partial<Context_field>) {
    Object.assign(this, context);
  }

  author: string;
  location: string;
  text: string;
}
