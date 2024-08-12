import * as Yup from "yup";

export const LoginFormValidation = Yup.object().shape({
    email: Yup.string().email("invalid email").required("email is required"),
    password: Yup.string().required("password is required"),
});

export const RegisterFormValidation = Yup.object().shape({
    fullName: Yup.string().required("full name is required"),
    email: Yup.string().email("invalid email").required("email is required"),
    password: Yup.string().required("password is required").min(8, "password must be atleast 8 characters long"),
    confirmPassword: Yup.string().required("password is required").oneOf([Yup.ref("password")], "passwords don't match"),
    mobileNumber: Yup.string().required("mobile number is required")
})