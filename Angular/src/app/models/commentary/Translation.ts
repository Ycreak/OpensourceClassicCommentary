export class Translation_field {
  constructor(translation?: Partial<Translation_field>) {
    Object.assign(this, translation);
  }

  text: string;
}
