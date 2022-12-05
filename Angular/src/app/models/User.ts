export class User {

    constructor ( user? : Partial<User> ) {
        // Allow the partial initialisation of a fragment object
        Object.assign(this, user);
    }

    username: string = '';
    role: string = '';
    password: string = '';

}

