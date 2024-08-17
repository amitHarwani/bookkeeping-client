import { LoginForm, RegisterForm } from "@/constants/types";
import { asyncHandler } from "../async_handler";
import axios from "axios";
import {
    GetAllCompaniesResponse,
    GetCompanyResponse,
    LoginResponse,
    RefreshTokenResponse,
    RegisterUserResponse,
} from "./user_types";
import { ApiResponse } from "../api_response";
export class UserService {
    private hostPath = process.env.EXPO_PUBLIC_USER_SERVICE;
    public registerUserPath = "auth/register";
    public loginPath = "auth/login";
    public logoutPath = "auth/logout";
    public refreshTokenPath = "auth/refresh-token";
    public getAllCompaniesPath = "company/get-accessible-companies";
    public getCompanyPath = "company/get-company";

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
}

export default new UserService();
