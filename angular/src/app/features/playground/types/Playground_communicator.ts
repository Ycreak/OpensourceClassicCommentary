import { Playground_user } from './Playground_user';

/** This class represents an object we send to the api to communicate a playground object */
export class Playground_communicator {
  _id: string;
  document_type = 'playground';
  name: string;
  canvas: any;
  created_by: string;
  user: string;
  users: Playground_user[];

  constructor(Playground_communicator?: Partial<Playground_communicator>) {
    // Allow the partial initialisation of a fragment object
    Object.assign(this, Playground_communicator);
  }
}
