import {
    AddUpdateCompanyForm,
    AddUpdateRoleForm,
    LoginForm,
    RegisterForm,
} from "@/constants/types";
import { asyncHandler } from "../async_handler";
import axios from "axios";
import {
    AddCompanyResponse,
    AddRoleResponse,
    GetAccessibleFeaturesOfCompanyResponse,
    GetAllCompaniesResponse,
    GetCompanyAdminACLResponse,
    GetCompanyResponse,
    GetRoleResponse,
    LoginResponse,
    RefreshTokenResponse,
    RegisterUserResponse,
    UpdateCompanyResponse,
    UpdateRoleResponse,
} from "./user_types";
import { ApiResponse } from "../api_response";
import momentTimezone from "moment-timezone";
import { timeFormat24hr } from "@/constants/datetimes";
import { convertLocalUTCToTimezoneUTC } from "@/utils/common_utils";
import { Role } from "react-native";

export class UserService {
    private hostPath = process.env.EXPO_PUBLIC_USER_SERVICE;
    public registerUserPath = "auth/register";
    public loginPath = "auth/login";
    public logoutPath = "auth/logout";
    public refreshTokenPath = "auth/refresh-token";
    public getAllCompaniesPath = "company/get-accessible-companies";
    public getCompanyPath = "company/get-company";
    public addCompanyPath = "company/add-company";
    public updateCompanyPath = "company/update-company";
    public getAccessibleFeaturesOfCompanyPath =
        "company/get-accessible-features-of-company";
    public getAllRolesPath = "role/get-all-roles";
    public addRolePath = "role/add-role";
    public updateRolePath = "role/update-role";
    public getRolePath = "role/get-role";
    public getCompanyAdminACLPath = "role/get-company-admin-acl";

    registerUser = async (userForm: RegisterForm) => {
        return await asyncHandler<RegisterUserResponse>(() => {
            return axios.post<ApiResponse<RegisterUserResponse>>(
                `${this.hostPath}/${this.registerUserPath}`,
                {
                    fullName: userForm.fullName,
                    email: userForm.email,
                    password: userForm.password,
                    countryId: userForm.country?.countryId,
                    mobileNumber: `${userForm.phoneCode}${userForm.mobileNumber}`,
                    isSubUser: false,
                    logInOnRegistration: true,
                }
            );
        });
    };

    loginUser = async (loginForm: LoginForm) => {
        return await asyncHandler<LoginResponse>(() => {
            return axios.post<ApiResponse<LoginResponse>>(
                `${this.hostPath}/${this.loginPath}`,
                {
                    email: loginForm.email,
                    password: loginForm.password,
                }
            );
        });
    };

    refreshToken = async (refreshToken: string) => {
        return await asyncHandler<RefreshTokenResponse>(() => {
            return axios.post<ApiResponse<RefreshTokenResponse>>(
                `${this.hostPath}/${this.refreshTokenPath}`,
                {
                    refreshToken,
                }
            );
        });
    };

    logout = async () => {
        return await asyncHandler<{ message: string }>(() => {
            return axios.post<ApiResponse<{ message: string }>>(
                `${this.hostPath}/${this.logoutPath}`
            );
        });
    };

    getAllCompanies = async () => {
        return await asyncHandler<GetAllCompaniesResponse>(() => {
            return axios.get<ApiResponse<GetAllCompaniesResponse>>(
                `${this.hostPath}/${this.getAllCompaniesPath}`
            );
        });
    };

    getCompany = async (companyId: number) => {
        return await asyncHandler<GetCompanyResponse>(() => {
            return axios.get<ApiResponse<GetCompanyResponse>>(
                `${this.hostPath}/${this.getCompanyPath}/${companyId}`
            );
        });
    };

    addCompany = async (
        companyDetails: AddUpdateCompanyForm,
        mainBranchId?: number
    ) => {
        /* Moment timezone object of localDayStartTime */
        const dayStartTimeMoment = momentTimezone.tz(
            companyDetails.localDayStartTime,
            companyDetails.country?.timezone as string
        );

        /* Converting local day start time to utc */
        const dayStartTimeInUTC = dayStartTimeMoment
            .utc()
            .format(timeFormat24hr);

        return await asyncHandler<AddCompanyResponse>(() => {
            return axios.post(`${this.hostPath}/${this.addCompanyPath}`, {
                companyName: companyDetails.companyName,
                countryId: companyDetails.country?.countryId,
                address: companyDetails.address,
                phoneNumber: `${companyDetails.phoneCode}${companyDetails.mobileNumber}`,
                dayStartTime: dayStartTimeInUTC,
                isMainBranch: mainBranchId == undefined ? true : false,
                mainBranchId: mainBranchId == undefined ? null : mainBranchId,
                taxDetails: Object.values(companyDetails.taxDetails as Object),
                decimalRoundTo: companyDetails.decimalRoundTo,
            });
        });
    };

    updateCompany = async (
        companyId: number,
        companyDetails: AddUpdateCompanyForm
    ) => {
        /* Moment timezone object of localDayStartTime */
        const dayStartTimeMoment = momentTimezone.tz(
            companyDetails.localDayStartTime,
            companyDetails.country?.timezone as string
        );

        /* Converting local day start time to utc */
        const dayStartTimeInUTC = dayStartTimeMoment
            .utc()
            .format(timeFormat24hr);

        return await asyncHandler<UpdateCompanyResponse>(() => {
            return axios.put(`${this.hostPath}/${this.updateCompanyPath}`, {
                companyId: companyId,
                companyName: companyDetails.companyName,
                countryId: companyDetails.country?.countryId,
                address: companyDetails.address,
                phoneNumber: `${companyDetails.phoneCode}${companyDetails.mobileNumber}`,
                dayStartTime: dayStartTimeInUTC,
                taxDetails: Object.values(companyDetails.taxDetails as Object),
                decimalRoundTo: companyDetails.decimalRoundTo,
            });
        });
    };

    getAccessibleFeaturesOfCompany = async (companyId: number) => {
        return await asyncHandler<GetAccessibleFeaturesOfCompanyResponse>(
            () => {
                return axios.get(
                    `${this.hostPath}/${this.getAccessibleFeaturesOfCompanyPath}/${companyId}`
                );
            }
        );
    };

    getAllRoles = async <T>({
        pageParam,
    }: {
        pageParam: {
            companyId: number;
            pageSize: number;
            select?: Array<keyof Role>;
            cursor?: { roleId: number };
        };
    }) => {
        return await asyncHandler<T>(() => {
            return axios.post(`${this.hostPath}/${this.getAllRolesPath}`, {
                companyId: pageParam.companyId,
                pageSize: pageParam.pageSize,
                select: pageParam?.select,
                cursor: pageParam?.cursor,
            });
        });
    };

    addRole = async (companyId: number, details: AddUpdateRoleForm) => {
        return await asyncHandler<AddRoleResponse>(() => {
            return axios.post(`${this.hostPath}/${this.addRolePath}`, {
                companyId,
                roleName: details.roleName,
                acl: Object.keys(details.acl),
            });
        });
    };

    getRole = async (roleId: number, companyId: number) => {
        return await asyncHandler<GetRoleResponse>(() => {
            return axios.get<ApiResponse<GetRoleResponse>>(
                `${this.hostPath}/${this.getRolePath}`,
                {
                    params: {
                        companyId,
                        roleId,
                    },
                }
            );
        });
    };

    updateRole = async (
        companyId: number,
        roleId: number,
        details: AddUpdateRoleForm
    ) => {
        return await asyncHandler<UpdateRoleResponse>(() => {
            return axios.put(`${this.hostPath}/${this.updateRolePath}`, {
                companyId,
                roleId,
                roleName: details.roleName,
                acl: Object.keys(details.acl),
            });
        });
    };

    getCompanyAdminACL = async (companyId: number) => {
        return await asyncHandler<GetCompanyAdminACLResponse>(() => {
            return axios.get(
                `${this.hostPath}/${this.getCompanyAdminACLPath}`,
                {
                    params: {
                        companyId,
                    },
                }
            );
        });
    };
}

export default new UserService();
