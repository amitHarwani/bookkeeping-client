import { Country } from "@/services/sysadmin/sysadmin_types"

export type GenericObject = {
    [key: string]: any;
};
export interface LoginForm {
    email: string,
    password: string
}

export interface RegisterForm {
    fullName: string,
    email: string,
    password: string,
    confirmPassword: string,
    country?: Country,
    phoneCode: string,
    mobileNumber: string,
    termsAgreed: boolean
}