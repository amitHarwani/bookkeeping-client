import * as Yup from "yup";

export const LoginFormValidation = Yup.object().shape({
    email: Yup.string().trim().email("invalid email").required("email is required"),
    password: Yup.string().trim().required("password is required"),
});

export const RegisterFormValidation = Yup.object().shape({
    fullName: Yup.string().trim().required("full name is required"),
    email: Yup.string().trim().email("invalid email").required("email is required"),
    country: Yup.object().required("country is required"),
    password: Yup.string().required("password is required").min(8, "password must be atleast 8 characters long"),
    confirmPassword: Yup.string().required("password is required").oneOf([Yup.ref("password")], "passwords don't match"),
    phoneCode: Yup.string().required("phone code is required"),
    mobileNumber: Yup.number().required("mobile number is required")
        .test("length", "invalid phone number", (value, context) => {
            /* Length of mobile number check */
            if(value.toString().length == context?.options?.context?.country?.maxPhoneNumberDigits){
                return true;
            }
            return false;
        })
})