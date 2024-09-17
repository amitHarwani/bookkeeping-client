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

export interface Company {
    companyId: number;
    companyName: string;
    countryId: number;
    address: string;
    phoneNumber: string;
    dayStartTime: string;
    isMainBranch: boolean | null;
    mainBranchId: number | null;
    decimalRoundTo: number;
    isActive: boolean | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    createdBy: string;
}

export interface CompanyWithTaxDetails extends Company {
    taxDetails: Array<{ taxId: number; registrationNumber: string }>;
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
    ) {}
}

export class RefreshTokenResponse {
    constructor(
        public user: User,
        public accessToken: string,
        public refreshToken: string
    ) {}
}
export class GetAllCompaniesResponse {
    constructor(public companies: Array<CompanyWithTaxDetails>) {}
}

export class GetCompanyResponse {
    constructor(public company: CompanyWithTaxDetails) {}
}

export class AddCompanyResponse {
    constructor(
        public company: CompanyWithTaxDetails,
        public message: string
    ) {}
}

export class GetAccessibleFeaturesOfCompanyResponse {
    constructor(public acl: number[]) {}
}

export class UpdateCompanyResponse {
    constructor(
        public company: CompanyWithTaxDetails,
        public message: string
    ) {}
}