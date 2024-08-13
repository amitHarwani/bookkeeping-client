export interface User {
    fullName: string;
    email: string;
    password: string;
    countryId: number | null;
    mobileNumber: string;
    isSubUser: boolean | null;
    userId: string;
    refreshToken: string | null;
    isLoggedIn: boolean | null;
    isActive: boolean | null;
    createdAt: Date | null;
    updatedAt: Date | null;
}

export class RegisterUserResponse {
    constructor(
        public user: User,
        public accessToken?: string,
        public refreshToken?: string
    ) {}
}


export class LoginResponse {
    constructor(
        public user: User,
        public accessToken: string,
        public refreshToken: string
    ){}
}