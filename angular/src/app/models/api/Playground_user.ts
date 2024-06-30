/** This class represents a user in the users list from a playground */
export class Playground_user {
  name: string;
  role: string;

  constructor(playground_user?: Partial<Playground_user>) {
    // Allow the partial initialisation of a fragment object
    Object.assign(this, playground_user);
  }
}
