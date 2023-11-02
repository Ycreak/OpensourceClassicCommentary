export class Reconstruction_field {
  constructor(reconstruction?: Partial<Reconstruction_field>) {
    Object.assign(this, reconstruction);
  }

  text: string;
}
