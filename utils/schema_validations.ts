import { GenericObject } from "@/constants/types";
import * as Yup from "yup";

export const LoginFormValidation = Yup.object().shape({
    email: Yup.string()
        .trim()
        .email("invalid email")
        .required("email is required"),
    password: Yup.string().trim().required("password is required"),
});

export const RegisterFormValidation = Yup.object().shape({
    fullName: Yup.string().trim().required("full name is required"),
    email: Yup.string()
        .trim()
        .email("invalid email")
        .required("email is required"),
    country: Yup.object().required("country is required"),
    password: Yup.string()
        .required("password is required")
        .min(8, "password must be atleast 8 characters long"),
    confirmPassword: Yup.string()
        .required("password is required")
        .oneOf([Yup.ref("password")], "passwords don't match"),
    phoneCode: Yup.string().required("phone code is required"),
    mobileNumber: Yup.number()
        .required("mobile number is required")
        .test("length", "invalid phone number", (value, context) => {
            /* Length of mobile number check */
            if (
                value.toString().length ==
                context?.options?.context?.country?.maxPhoneNumberDigits
            ) {
                return true;
            }
            return false;
        }),
    termsAgreed: Yup.boolean().isTrue(
        "please agree with the terms & conditions"
    ),
});

export const AddCompanyFormValidation = Yup.object().shape({
    companyName: Yup.string().trim().required("company name is required"),
    address: Yup.string().trim().required("address is required"),
    country: Yup.object().required("country is required"),
    phoneCode: Yup.string().required("phone code is required"),
    mobileNumber: Yup.number()
        .required("mobile number is required")
        .test("length", "invalid phone number", (value, context) => {
            /* Length of mobile number check */
            if (
                value.toString().length ==
                context?.options?.context?.country?.maxPhoneNumberDigits
            ) {
                return true;
            }
            return false;
        }),
    localDayStartTime: Yup.string().required(
        "local day start time is required"
    ),
    decimalRoundTo: Yup.number()
        .min(1, "Min round to is 1")
        .max(4, "Max round to is 4")
        .required("decimal round to is required"),

    taxDetails: Yup.lazy((value) => {
        return Yup.object(
            Object.keys(value).reduce((schema, key) => {
                schema[key] = Yup.object().shape({
                    taxId: Yup.number().required("missing tax details"),
                    registrationNumber: Yup.string()
                        .trim()
                        .required("missing tax details"),
                });
                return schema;
            }, {} as Record<string, Yup.AnySchema>)
        );
    }),
});

export const AddItemFormValidation = Yup.object().shape({
    itemName: Yup.string().trim().required("item name is required"),
    unit: Yup.object().required("unit is required"),
    defaultSellingPrice: Yup.number().required("default selling price is required"),
    defaultPurchasePrice: Yup.number().required("default purchase price is required"),
    stock: Yup.number().required("stock is required"),
    minStockToMaintain: Yup.number().required("min stock to maintain is required"),
    isActive: Yup.boolean().required("is active is required")
})
