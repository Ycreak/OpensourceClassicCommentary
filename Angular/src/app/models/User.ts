export class User {
    constructor(
        public id: string,
        public username: string,
        public role: string,
    ) {
    }

    public password: string;
    // public new_password: string;
    // public new_role: string;
}

