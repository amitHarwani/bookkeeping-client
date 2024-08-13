import { LoginForm, RegisterForm } from "@/constants/types";
import { asyncHandler } from "../async_handler";
import axios from "axios";
import { LoginResponse, RegisterUserResponse } from "./user_types";
import { ApiResponse } from "../api_response";
export class UserService {
    private hostPath = process.env.EXPO_PUBLIC_USER_SERVICE;
    private registerUserPath = "auth/register";
    private loginPath = "auth/login";

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
}

export default new UserService();
