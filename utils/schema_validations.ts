import { GenericObject } from "@/constants/types";
import * as Yup from "yup";
import moment from "moment";

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

export const AddUpdateCompanyFormValidation = Yup.object().shape({
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
    localDayStartTime: Yup.date().required(
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
    defaultSellingPrice: Yup.number()
        .optional()
        .nullable()
        .typeError("invalid default selling price"),
    defaultPurchasePrice: Yup.number()
        .optional()
        .nullable()
        .typeError("invalid default purchase price"),
    stock: Yup.number().required("stock is required"),
    minStockToMaintain: Yup.number()
        .optional()
        .nullable()
        .typeError("invalid min stock to maintain"),
    isActive: Yup.boolean().required("is active is required"),
    priceOfCurrentStock: Yup.number()
        .nullable()
        .test(
            "priceOfCurrentStock validator",
            "invalid unit price of opening stock",
            (value, context) => {
                /* If opening stock is entered, price of current stock is required otherwise it can be null. */
                const stockEntered = context?.options?.context?.stock
                    ? Number(context?.options?.context?.stock)
                    : 0;

                if (stockEntered > 0 && value && !isNaN(Number(value))) {
                    return true;
                } else if (stockEntered > 0) {
                    return false;
                } else {
                    return true;
                }
            }
        ),
});

export const UpdateItemFormValidation = Yup.object().shape({
    itemName: Yup.string().trim().required("item name is required"),
    unit: Yup.object().required("unit is required"),
    defaultSellingPrice: Yup.number()
        .optional()
        .nullable()
        .typeError("invalid default selling price"),
    defaultPurchasePrice: Yup.number()
        .optional()
        .nullable()
        .typeError("invalid default purchase price"),
    minStockToMaintain: Yup.number()
        .optional()
        .nullable()
        .typeError("invalid min stock to maintain"),
    isActive: Yup.boolean().required("is active is required"),
});

export const AdjustItemFormValidation = Yup.object().shape({
    item: Yup.object().required(),
    addStock: Yup.boolean().required(),
    stockAdjusted: Yup.number().test(
        "stockAdjusted validator",
        "invalid stock adjusted value",
        (value, context) => {
            /* Stock from item object */
            const currentStock = context?.options?.context?.item?.stock
                ? Number(context?.options?.context?.item?.stock)
                : 0;

            /* Whether add is choosed */
            const isAddStock = context?.options?.context?.addStock;

            /* If no value is entered */
            if (!value || value < 0) {
                return false;
            }
            /* If adjustment type is subtraction, and value is less than current stock return false */
            if (!isAddStock && currentStock - value < 0) {
                return false;
            }
            return true;
        }
    ),
    reason: Yup.string().trim().required("reason is required"),
    pricePerUnit: Yup.number()
        .nullable()
        .test(
            "pricePerUnit adjustItem",
            "invalid price per unit entered",
            (value, context) => {
                /* Whether add is choosen */
                const isAddStock = context?.options?.context?.addStock;

                /* If adding stock and value is not a number, return false, as when adding a stock pricePerUnit is required */
                if (isAddStock && isNaN(Number(value))) {
                    return false;
                }

                return true;
            }
        ),
});

export const AddUpdatePartyValidation = Yup.object().shape({
    partyName: Yup.string().trim().required("party name is required"),
    defaultSaleCreditAllowanceInDays: Yup.number()
        .required("default sale credit allowance is required")
        .typeError("invalid default sale allowance"),
    defaultPurchaseCreditAllowanceInDays: Yup.number()
        .required("default purchase credit allowance is required")
        .typeError("invalid default purchase allowance"),
    country: Yup.object().required("country is required"),
    phoneCode: Yup.string().required("phone code is required"),
    phoneNumber: Yup.number()
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

export const FilterPurchaseFormValidation = Yup.object().shape({
    party: Yup.object().notRequired().nullable(),
    purchaseType: Yup.string().required(),
    fromTransactionDateTime: Yup.date().notRequired(),
    toTransactionDateTime: Yup.date()
        .notRequired()
        .test(
            "toTransactionDateTest",
            "to date cannot be before from date",
            (value, context) => {
                const from = context?.options?.context?.fromTransactionDateTime;
                if (moment(value).isBefore(from)) {
                    return false;
                }
                return true;
            }
        ),
    getOnlyOverduePayments: Yup.boolean(),
});

export const FilterSaleFormValidation = Yup.object().shape({
    party: Yup.object().notRequired().nullable(),
    purchaseType: Yup.string().required(),
    fromTransactionDateTime: Yup.date().notRequired(),
    toTransactionDateTime: Yup.date()
        .notRequired()
        .test(
            "toTransactionDateTest",
            "to date cannot be before from date",
            (value, context) => {
                const from = context?.options?.context?.fromTransactionDateTime;
                if (moment(value).isBefore(from)) {
                    return false;
                }
                return true;
            }
        ),
    getOnlyOverduePayments: Yup.boolean(),
});

export const FilterQuotationFormValidation = Yup.object().shape({
    party: Yup.object().notRequired().nullable(),
    fromTransactionDateTime: Yup.date().notRequired(),
    toTransactionDateTime: Yup.date()
        .notRequired()
        .test(
            "toTransactionDateTest",
            "to date cannot be before from date",
            (value, context) => {
                const from = context?.options?.context?.fromTransactionDateTime;
                if (from && value && moment(value).isBefore(from)) {
                    return false;
                }
                return true;
            }
        ),
});

export const AddUpdateInvoiceItemValidation = Yup.object().shape({
    item: Yup.object().required("item is required"),
    units: Yup.number()
        .typeError("invalid unit")
        .test("units", "unit must be greater than 0", (value) => {
            if (Number(value) <= 0) {
                return false;
            }
            return true;
        }),
    pricePerUnit: Yup.number().typeError("invalid price"),
});
export const PurchaseInvoiceFormValidation = Yup.object().shape({
    party: Yup.object().required("party is required"),
    invoiceNumber: Yup.number()
        .required("invoice number is required")
        .typeError("invalid invoice number"),
    items: Yup.object().test("items", "no items added", (value) => {
        if (value && Object.values(value).length === 0) {
            return false;
        }
        return true;
    }),
    discount: Yup.number().nullable().typeError("invalid discount"),
    isCredit: Yup.boolean(),
    amountPaid: Yup.number()
        .typeError("invalid amount paid")
        .test(
            "amountPaid",
            "amount paid cannot be greater than total amount",
            (value, context) => {
                const totalAfterTax = Number(
                    context?.options?.context?.totalAfterTax
                );
                if (Number(value) > totalAfterTax) {
                    return false;
                }
                return true;
            }
        ),
    receiptNumber: Yup.string().nullable(),
});

export const SaleInvoiceFormValidation = Yup.object().shape({
    party: Yup.object()
        .nullable()
        .typeError("invalid party")
        .test("party", "select party for non-open bills", (value, context) => {
            const isNoPartyBill = Number(
                context?.options?.context?.isNoPartyBill
            );
            if (!isNoPartyBill && !value) {
                return false;
            }
            return true;
        }),
    isNoPartyBill: Yup.boolean(),
    invoiceNumber: Yup.number()
        .nullable()
        .typeError("invalid invoice number")
        .test(
            "invoiceNumber",
            "invoice number is required",
            (value, context) => {
                const autogenerateInvoice = Number(
                    context?.options?.context?.autogenerateInvoice
                );
                /* invoice number is required when autogenerateInvoice is false */
                if (!autogenerateInvoice && !value) {
                    return false;
                }
                return true;
            }
        ),
    items: Yup.object().test("items", "no items added", (value) => {
        if (value && Object.values(value).length === 0) {
            return false;
        }
        return true;
    }),
    discount: Yup.number().nullable().typeError("invalid discount"),
    isCredit: Yup.boolean(),
    amountPaid: Yup.number()
        .typeError("invalid amount paid")
        .test(
            "amountPaid",
            "amount paid cannot be greater than total amount",
            (value, context) => {
                const totalAfterTax = Number(
                    context?.options?.context?.totalAfterTax
                );
                if (Number(value) > totalAfterTax) {
                    return false;
                }
                return true;
            }
        ),
});

export const QuotationFormValidation = Yup.object().shape({
    party: Yup.object()
        .typeError("invalid party")
        .required("party is required"),
    quotationNumber: Yup.number()
        .nullable()
        .typeError("invalid quotation number")
        .test(
            "quotationNumber",
            "quotation number is required",
            (value, context) => {
                const autogenerateQuotationNumber = Number(
                    context?.options?.context?.autogenerateQuotationNumber
                );
                /* quotation number is required when it autogenerateQuotationNumber is false */
                if (!autogenerateQuotationNumber && !value) {
                    return false;
                }
                return true;
            }
        ),
    items: Yup.object().test("items", "no items added", (value) => {
        if (value && Object.values(value).length === 0) {
            return false;
        }
        return true;
    }),
    discount: Yup.number().nullable().typeError("invalid discount"),
});
