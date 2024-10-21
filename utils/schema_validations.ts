import { GenericObject } from "@/constants/types";
import * as Yup from "yup";
import moment from "moment";
import { REPORTS_CONFIG } from "@/constants/reportsconfig";

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
    localDayStartTime: Yup.date().required("local day start time is required"),
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

export const AddUpdateRoleValidation = Yup.object().shape({
    roleName: Yup.string().trim().required("role name is required"),
    acl: Yup.object(),
});

export const AddUpdateUserValidation = (operation: "ADD" | "UPDATE") => {
    const validationSchema = Yup.object().shape({
        fullName: Yup.string().trim().required("full name is required"),
        email: Yup.string()
            .trim()
            .email("invalid email")
            .required("email is required"),
        password:
            operation === "ADD"
                ? Yup.string()
                      .required("password is required")
                      .min(8, "password must be atleast 8 characters long")
                : Yup.string().optional(),
        country: Yup.object().required("country is required"),
        phoneCode: Yup.string().required("phone code is required"),
        mobileNumber: Yup.number()
            .required("mobile number is required")
            .test("length", "invalid number", (value, context) => {
                /* Length of mobile number check */
                if (
                    value.toString().length ==
                    context?.options?.context?.country?.maxPhoneNumberDigits
                ) {
                    return true;
                }
                return false;
            }),
        isActive: Yup.boolean().required("is active is required"),
        role: Yup.object().required("role is required"),
    });

    return validationSchema;
};

export const FilterTransfersFormValidation = Yup.object().shape({
    type: Yup.string().required(),
    fromDate: Yup.date().notRequired(),
    toDate: Yup.date()
        .notRequired()
        .test(
            "toDateTest",
            "to date cannot be before from date",
            (value, context) => {
                const from = context?.options?.context?.fromDate;
                if (moment(value).isBefore(from)) {
                    return false;
                }
                return true;
            }
        ),
});

export const AddUpdateTransferFormValidation = Yup.object().shape({
    toCompany: Yup.object().required("to company is required"),
    items: Yup.object().test("items", "no items added", (value) => {
        if (value && Object.values(value).length === 0) {
            return false;
        }
        return true;
    }),
});

export const AddUpdateTransferItemValidation = Yup.object().shape({
    item: Yup.object().required("item is required"),
    unitsTransferred: Yup.number()
        .typeError("invalid unit")
        .test("units", "unit must be greater than 0", (value) => {
            if (Number(value) <= 0) {
                return false;
            }
            return true;
        })
        .test("unitsAvailable", "stock not available", (value, context) => {
            const item = context?.options?.context?.item;
            if(item && Number(item?.stock) < Number(value)){
                return false;
            }
            return true;
        })
});

export const AddUpdateReturnItemValidation = Yup.object().shape({
    item: Yup.object().required("item is required"),
    unitsReturned: Yup.number()
        .typeError("invalid unit")
        .test("unitsTypeValidation", "unit returned must be greater than 0", (value) => {
            if (Number(value) <= 0) {
                return false;
            }
            return true;
        })
        .test("unitsReturnedValidation", "unit returned cannot be greater than units in the transaction", (value, context) => {
            const unitsSoldOrPurchased = context?.options?.context?.unitsSoldOrPurchased;
            if (Number(value) > unitsSoldOrPurchased) {
                return false;
            }
            return true;
        }),
});

export const SaleReturnFormValidation = Yup.object().shape({
    saleReturnNumber: Yup.number()
        .nullable()
        .typeError("invalid sale return number")
        .test(
            "saleReturnNumber",
            "sale return number is required",
            (value, context) => {
                const autogenerateSaleReturnNumber = Number(
                    context?.options?.context?.autogenerateSaleReturnNumber
                );
                /* sale return number is required when autogenerateSaleReturnNumber is false */
                if (!autogenerateSaleReturnNumber && !value) {
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
    })
});

export const PurchaseReturnFormValidation = Yup.object().shape({
    purchaseReturnNumber: Yup.number()
        .nullable()
        .typeError("invalid purchase return number")
        .test(
            "purchaseReturnNumber",
            "purchase return number is required",
            (value, context) => {
                const autogeneratePurchaseReturnNumber = Number(
                    context?.options?.context?.autogeneratePurchaseReturnNumber
                );
                /* purchase return number is required when autogenerateSaleReturnNumber is false */
                if (!autogeneratePurchaseReturnNumber && !value) {
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
    })
});

export const AddReportFormValidation = Yup.object().shape({
    reportType: Yup.object().required("report type is required"),
    fromDateTime: Yup.date().optional().test("fromDateTime", "this field is required",  (value, context) => {
        const reportType =  context?.options?.context?.reportType;
        /* if report type is not selected, don't throw an error */
        if (!reportType) {
            return true;
        }
        /* If from date time is required in report config, and fromDateTime is not selected throw an error */
        if(REPORTS_CONFIG[reportType.key].fromDateTime.required && !value){
            return false;
        }

        return true;
    }).test("fromBeforeTo", "from date time cannot be after to date time", (value, context) => {
        /* Report type */
        const reportType = context?.options?.context?.reportType;
        /* To Date Time Value */
        const to = context?.options?.context?.toDateTime;

        /* If from date time is entered, toDateTime is required and from date time is after to date time, return false */
        if(value && REPORTS_CONFIG[reportType.key].toDateTime.required && to && moment(value).isAfter(moment(to))){
            return false;
        }
        return true;
    }),
    toDateTime: Yup.date().optional().test("toDateTime", "this field is required",  (value, context) => {
        const reportType =  context?.options?.context?.reportType;
        /* if report type is not selected, don't throw an error */
        if (!reportType) {
            return true;
        }
        /* If to date time is required in report config, and toDateTime is not selected throw an error */
        if(REPORTS_CONFIG[reportType.key].toDateTime.required && !value){
            return false;
        }

        return true;
    })
})

