import { CompanyGroupType, RoleTypeInRolesList } from "@/constants/types";

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

export interface Role {
    companyId: number;
    roleId: number;
    roleName: string;
    acl: number[];
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

export class GetAllRolesForRolesListResponse {
    constructor(
        public roles: Array<RoleTypeInRolesList>,
        public nextPageCursor?: { roleId: number }
    ) {}
}

export class AddRoleResponse {
    constructor(public role: Role, public message: string) {}
}

export class UpdateRoleResponse {
    constructor(public role: Role, public message: string) {}
}

export class GetCompanyAdminACLResponse {
    constructor(public acl: Array<number>) {}
}

export class GetRoleResponse {
    constructor(public role: Role) {}
}

export class GetAllUsersOfCompanyResponse {
    constructor(public users: Array<User>) {}
}

export class AddUserResponse {
    constructor(public user: User, public message: string) {}
}

export class GetUserResponse {
    constructor(
        public user: User,
        public userCompanyMappings: Array<{ companyId: number; roleId: number }>
    ) {}
}

export class UpdateUserResponse {
    constructor(public user: User) {}
}

export class UpdateUserAccessResponse {
    constructor(
        public user: User,
        public roleId: number,
        public companyId: number,
        public message: string
    ) {}
}

export class GetCompanyGroupResponse {
    constructor(
        public companies: Array<CompanyGroupType>
    ){}
}
