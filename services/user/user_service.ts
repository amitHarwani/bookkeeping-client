import { AddCompanyForm, LoginForm, RegisterForm } from "@/constants/types";
import { asyncHandler } from "../async_handler";
import axios from "axios";
import {
    AddCompanyResponse,
    GetAllCompaniesResponse,
    GetCompanyResponse,
    LoginResponse,
    RefreshTokenResponse,
    RegisterUserResponse,
} from "./user_types";
import { ApiResponse } from "../api_response";
import momentTimezone from "moment-timezone";
import { timeFormat24hr } from "@/constants/datetimes";

export class UserService {
    private hostPath = process.env.EXPO_PUBLIC_USER_SERVICE;
    public registerUserPath = "auth/register";
    public loginPath = "auth/login";
    public logoutPath = "auth/logout";
    public refreshTokenPath = "auth/refresh-token";
    public getAllCompaniesPath = "company/get-accessible-companies";
    public getCompanyPath = "company/get-company";
    public addCompanyPath = "company/add-company";

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
        companyDetails: AddCompanyForm,
        mainBranchId?: number
    ) => {
        /* Moment timezone object of localDayStartTime */
        const dayStartTimeMoment = momentTimezone.tz(
            companyDetails.localDayStartTime,
            timeFormat24hr,
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
                decimalRoundTo: companyDetails.decimalRoundTo
            });
        });
    };
}

export default new UserService();
