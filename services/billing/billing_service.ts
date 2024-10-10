import { dateFormat, dateTimeFormat24hr } from "@/constants/datetimes";
import {
    AddUpdatePartyForm,
    FilterPurchaseForm,
    FilterQuotationForm,
    FilterSalesForm,
    PurchaseInvoiceForm,
    QuotationForm,
    SaleInvoiceForm,
} from "@/constants/types";
import {
    convertLocalUTCToTimezoneUTC,
    setTimeToEmpty,
} from "@/utils/common_utils";
import axios from "axios";
import moment from "moment";
import { ApiResponse } from "../api_response";
import { asyncHandler } from "../async_handler";
import { Country } from "../sysadmin/sysadmin_types";
import {
    AddPartyResponse,
    AddUpdatePurchaseResponse,
    AddUpdateQuotationResponse,
    AddUpdateSaleResponse,
    FilterPartiesQuery,
    FilterPurchasesQuery,
    FilterQuotationQuery,
    FilterSalesQuery,
    GetCashFlowSummaryResponse,
    GetPartyResponse,
    GetPurchaseResponse,
    GetQuotationResponse,
    GetSaleResponse,
    GetTopSellersForCurrentMonthResponse,
    Purchase,
    PurchaseItem,
    QuotationItem,
    Sale,
    SaleItem,
    ThirdParty,
    UpdatePartyResponse,
} from "./billing_types";

class BillingService {
    hostPath = process.env.EXPO_PUBLIC_BILLING_SERVICE;
    getAllPartiesPath = "party/get-all-parties";
    addPartyPath = "party/add-party";
    getPartyPath = "party/get-party";
    updatePartyPath = "party/update-party";
    getAllPurchasesPath = "purchase/get-all-purchases";
    addPurchasePath = "purchase/add-purchase";
    getPurchasePath = "purchase/get-purchase";
    updatePurchasePath = "purchase/update-purchase";
    getAllSalesPath = "sale/get-all-sales";
    addSalePath = "sale/add-sale";
    getSalePath = "sale/get-sale";
    updateSalePath = "sale/update-sale";
    getAllQuotationsPath = "quotation/get-all-quotations";
    getQuotationPath = "quotation/get-quotation";
    addQuotationPath = "quotation/add-quotation";
    updateQuotationPath = "quotation/update-quotation";
    getCashFlowSummaryPath = "summary/get-cashflow-summary";
    getTopSellersForCurrentMonthPath =
        "summary/get-topsellers-for-current-month";

    getTopSellersForCurrentMonth = async (companyId: number) => {
        return await asyncHandler<GetTopSellersForCurrentMonthResponse>(() => {
            return axios.get(
                `${this.hostPath}/${this.getTopSellersForCurrentMonthPath}/${companyId}`
            );
        });
    };
    getCashFlowSummary = async (
        companyId: number,
        dateTimeRange: {
            from: string;
            to: string;
        }
    ) => {
        return await asyncHandler<GetCashFlowSummaryResponse>(() => {
            return axios.post(
                `${this.hostPath}/${this.getCashFlowSummaryPath}`,
                {
                    companyId,
                    from: dateTimeRange.from,
                    to: dateTimeRange.to,
                }
            );
        });
    };

    getAllPurchases = async <T>({
        pageParam,
    }: {
        pageParam: {
            pageSize: number;
            companyId: number;
            query?: FilterPurchaseForm;
            invoiceNumberSearchQuery?: number;
            cursor?: {
                updatedAt: string;
                purchaseId: number;
            };
            countryDetails: Country;
            select?: [keyof Purchase];
        };
    }) => {
        let requestQuery: FilterPurchasesQuery = {};

        if (pageParam?.query) {
            if (pageParam?.query?.fromTransactionDateTime) {
                /* Converting UTC derived from system timezone to companies timezone derived UTC */
                requestQuery = {
                    ...requestQuery,
                    fromTransactionDate: convertLocalUTCToTimezoneUTC(
                        pageParam?.query?.fromTransactionDateTime,
                        dateTimeFormat24hr,
                        pageParam.countryDetails.timezone
                    ),
                };
                requestQuery = {
                    ...requestQuery,
                    toTransactionDate: convertLocalUTCToTimezoneUTC(
                        pageParam?.query?.toTransactionDateTime as Date,
                        dateTimeFormat24hr,
                        pageParam.countryDetails.timezone
                    ),
                };
            }

            requestQuery = {
                ...requestQuery,
                partyId: pageParam?.query?.party?.partyId,
                purchaseType: pageParam?.query?.purchaseType,
                getOnlyOverduePayments:
                    pageParam?.query?.getOnlyOverduePayments,
                invoiceNumberSearchQuery: pageParam?.invoiceNumberSearchQuery,
            };
        }

        return await asyncHandler<T>(async () => {
            return axios.post<ApiResponse<T>>(
                `${this.hostPath}/${this.getAllPurchasesPath}`,
                {
                    pageSize: pageParam?.pageSize,
                    companyId: pageParam?.companyId,
                    query: requestQuery,
                    cursor: pageParam?.cursor,
                    select: pageParam?.select,
                }
            );
        });
    };

    getPurchase = async (purchaseId: number, companyId: number) => {
        return await asyncHandler<GetPurchaseResponse>(() => {
            return axios.get<ApiResponse<GetPurchaseResponse>>(
                `${this.hostPath}/${this.getPurchasePath}`,
                {
                    params: {
                        companyId,
                        purchaseId,
                    },
                }
            );
        });
    };

    addPurchase = async (
        purchaseForm: PurchaseInvoiceForm,
        companyId: number,
        companyTimezone: string,
        decimalRoundTo: number
    ) => {
        let items: any = [];

        /* Purchase Items req body   */
        Object.values(purchaseForm.items).forEach((item) => {
            items.push({
                itemId: item.item?.itemId,
                itemName: item.item?.itemName,
                companyId: companyId,
                unitId: item.item?.unitId,
                unitName: item.item?.unitName,
                unitsPurchased: Number(item.units),
                pricePerUnit: Number(item.pricePerUnit),
                subtotal: Number(item.subtotal),
                tax: Number(item.tax),
                taxPercent: item.taxPercent,
                totalAfterTax: Number(item.totalAfterTax),
            });
        });

        if (purchaseForm.paymentDueDate) {
            purchaseForm.paymentDueDate = setTimeToEmpty(
                purchaseForm.paymentDueDate
            );
        }
        if (purchaseForm.paymentCompletionDate) {
            purchaseForm.paymentCompletionDate = setTimeToEmpty(
                purchaseForm.paymentCompletionDate
            );
        }

        let requestBody;
        requestBody = {
            createdAt: convertLocalUTCToTimezoneUTC(
                purchaseForm.createdAt,
                dateTimeFormat24hr,
                companyTimezone
            ),
            invoiceNumber: Number(purchaseForm.invoiceNumber),
            companyId: companyId,
            partyId: purchaseForm.party?.partyId,
            partyName: purchaseForm.party?.partyName,
            subtotal: Number(purchaseForm.subtotal),
            discount: Number(purchaseForm.discount),
            totalAfterDiscount: Number(purchaseForm.totalAfterDiscount),
            taxPercent: purchaseForm.taxPercent,
            taxName: purchaseForm.taxName,
            tax: Number(purchaseForm.tax),
            totalAfterTax: Number(purchaseForm.totalAfterTax),
            isCredit: purchaseForm.isCredit,
            paymentDueDate: purchaseForm.paymentDueDate
                ? convertLocalUTCToTimezoneUTC(
                      purchaseForm.paymentDueDate,
                      dateTimeFormat24hr,
                      companyTimezone
                  )
                : null,
            amountPaid: Number(purchaseForm.amountPaid),
            amountDue: Number(purchaseForm.amountDue),
            isFullyPaid: Number(purchaseForm.amountDue) === 0,
            paymentCompletionDate:
                Number(purchaseForm.amountDue) === 0
                    ? moment.utc().format(dateTimeFormat24hr)
                    : null,
            receiptNumber: purchaseForm.receiptNumber
                ? purchaseForm.receiptNumber
                : null,
            decimalRoundTo: decimalRoundTo,
            items: items,
        };

        return await asyncHandler<AddUpdatePurchaseResponse>(() => {
            return axios.post<ApiResponse<AddUpdatePurchaseResponse>>(
                `${this.hostPath}/${this.addPurchasePath}`,
                requestBody
            );
        });
    };

    updatePurchase = async (
        purchaseId: number,
        oldPurchaseItems: PurchaseItem[],
        purchaseForm: PurchaseInvoiceForm,
        companyId: number,
        companyTimezone: string,
        decimalRoundTo: number,
        oldAmountPaid: number
    ) => {
        let items: any = [];

        /* Purchase Items req body   */
        Object.values(purchaseForm.items).forEach((item) => {
            items.push({
                itemId: item.item?.itemId,
                itemName: item.item?.itemName,
                companyId: companyId,
                unitId: item.item?.unitId,
                unitName: item.item?.unitName,
                unitsPurchased: Number(item.units),
                pricePerUnit: Number(item.pricePerUnit),
                subtotal: Number(item.subtotal),
                tax: Number(item.tax),
                taxPercent: item.taxPercent,
                totalAfterTax: Number(item.totalAfterTax),
            });
        });

        if (purchaseForm.paymentDueDate) {
            purchaseForm.paymentDueDate = setTimeToEmpty(
                purchaseForm.paymentDueDate
            );
        }
        if (purchaseForm.paymentCompletionDate) {
            purchaseForm.paymentCompletionDate = setTimeToEmpty(
                purchaseForm.paymentCompletionDate
            );
        }

        let requestBody;
        requestBody = {
            purchaseId: purchaseId,
            invoiceNumber: Number(purchaseForm.invoiceNumber),
            companyId: companyId,
            partyId: purchaseForm.party?.partyId,
            partyName: purchaseForm.party?.partyName,
            subtotal: Number(purchaseForm.subtotal),
            discount: Number(purchaseForm.discount),
            totalAfterDiscount: Number(purchaseForm.totalAfterDiscount),
            taxPercent: purchaseForm.taxPercent,
            taxName: purchaseForm.taxName,
            tax: Number(purchaseForm.tax),
            totalAfterTax: Number(purchaseForm.totalAfterTax),
            isCredit: purchaseForm.isCredit,
            paymentDueDate: purchaseForm.paymentDueDate
                ? convertLocalUTCToTimezoneUTC(
                      purchaseForm.paymentDueDate,
                      dateTimeFormat24hr,
                      companyTimezone
                  )
                : null,
            amountPaid: Number(purchaseForm.amountPaid),
            oldAmountPaid: oldAmountPaid,
            amountDue: Number(purchaseForm.amountDue),
            isFullyPaid: Number(purchaseForm.amountDue) === 0,
            paymentCompletionDate:
                Number(purchaseForm.amountDue) === 0
                    ? moment.utc().format(dateTimeFormat24hr)
                    : null,
            receiptNumber: purchaseForm.receiptNumber
                ? purchaseForm.receiptNumber
                : null,
            decimalRoundTo: decimalRoundTo,
            items: items,
            oldItems: oldPurchaseItems,
        };

        return await asyncHandler<AddUpdatePurchaseResponse>(() => {
            return axios.put<ApiResponse<AddUpdatePurchaseResponse>>(
                `${this.hostPath}/${this.updatePurchasePath}`,
                requestBody
            );
        });
    };

    getAllSales = async <T>({
        pageParam,
    }: {
        pageParam: {
            pageSize: number;
            companyId: number;
            query?: FilterSalesForm;
            invoiceNumberSearchQuery?: number;
            cursor?: {
                updatedAt: string;
                saleId: number;
            };
            countryDetails: Country;
            select?: [keyof Sale];
        };
    }) => {
        let requestQuery: FilterSalesQuery = {};

        if (pageParam?.query) {
            if (pageParam?.query?.fromTransactionDateTime) {
                /* Converting UTC derived from system timezone to companies timezone derived UTC */
                requestQuery = {
                    ...requestQuery,
                    fromTransactionDate: convertLocalUTCToTimezoneUTC(
                        pageParam?.query?.fromTransactionDateTime,
                        dateTimeFormat24hr,
                        pageParam.countryDetails.timezone
                    ),
                };
                requestQuery = {
                    ...requestQuery,
                    toTransactionDate: convertLocalUTCToTimezoneUTC(
                        pageParam?.query?.toTransactionDateTime as Date,
                        dateTimeFormat24hr,
                        pageParam.countryDetails.timezone
                    ),
                };
            }

            requestQuery = {
                ...requestQuery,
                partyId: pageParam?.query?.party?.partyId,
                purchaseType: pageParam?.query?.purchaseType,
                getOnlyOverduePayments:
                    pageParam?.query?.getOnlyOverduePayments,
                invoiceNumberSearchQuery: pageParam?.invoiceNumberSearchQuery,
            };
        }

        return await asyncHandler<T>(async () => {
            return axios.post<ApiResponse<T>>(
                `${this.hostPath}/${this.getAllSalesPath}`,
                {
                    pageSize: pageParam?.pageSize,
                    companyId: pageParam?.companyId,
                    query: requestQuery,
                    cursor: pageParam?.cursor,
                    select: pageParam?.select,
                }
            );
        });
    };

    getSale = async (saleId: number, companyId: number) => {
        return await asyncHandler<GetSaleResponse>(() => {
            return axios.get<ApiResponse<GetSaleResponse>>(
                `${this.hostPath}/${this.getSalePath}`,
                {
                    params: {
                        companyId,
                        saleId,
                    },
                }
            );
        });
    };

    addSale = async (
        saleForm: SaleInvoiceForm,
        companyId: number,
        companyTimezone: string,
        decimalRoundTo: number
    ) => {
        let items: any = [];

        /* Sale Items req body   */
        Object.values(saleForm.items).forEach((item) => {
            items.push({
                itemId: item.item?.itemId,
                itemName: item.item?.itemName,
                companyId: companyId,
                unitId: item.item?.unitId,
                unitName: item.item?.unitName,
                unitsSold: Number(item.units),
                pricePerUnit: Number(item.pricePerUnit),
                subtotal: Number(item.subtotal),
                tax: Number(item.tax),
                taxPercent: item.taxPercent,
                totalAfterTax: Number(item.totalAfterTax),
            });
        });

        if (saleForm.paymentDueDate) {
            saleForm.paymentDueDate = setTimeToEmpty(saleForm.paymentDueDate);
        }
        if (saleForm.paymentCompletionDate) {
            saleForm.paymentCompletionDate = setTimeToEmpty(
                saleForm.paymentCompletionDate
            );
        }

        let requestBody;
        requestBody = {
            createdAt: convertLocalUTCToTimezoneUTC(
                saleForm.createdAt,
                dateTimeFormat24hr,
                companyTimezone
            ),
            companyTaxNumber: saleForm.companyTaxNumber,
            partyTaxNumber: saleForm.partyTaxNumber,
            invoiceNumber: saleForm.invoiceNumber
                ? Number(saleForm.invoiceNumber)
                : null,
            quotationNumber: saleForm.quotationNumber
                ? Number(saleForm.quotationNumber)
                : null,
            companyId: companyId,
            partyId: saleForm.party ? saleForm.party?.partyId : null,
            partyName: saleForm.party ? saleForm.party?.partyName : null,
            isNoPartyBill: saleForm.isNoPartyBill,
            doneBy: saleForm.doneBy,
            subtotal: Number(saleForm.subtotal),
            discount: Number(saleForm.discount),
            totalAfterDiscount: Number(saleForm.totalAfterDiscount),
            taxPercent: saleForm.taxPercent,
            taxName: saleForm.taxName,
            tax: Number(saleForm.tax),
            totalAfterTax: Number(saleForm.totalAfterTax),
            isCredit: saleForm.isCredit,
            paymentDueDate: saleForm.paymentDueDate
                ? convertLocalUTCToTimezoneUTC(
                      saleForm.paymentDueDate,
                      dateTimeFormat24hr,
                      companyTimezone
                  )
                : null,
            amountPaid: Number(saleForm.amountPaid),
            amountDue: Number(saleForm.amountDue),
            isFullyPaid: Number(saleForm.amountDue) === 0,
            paymentCompletionDate:
                Number(saleForm.amountDue) === 0
                    ? moment.utc().format(dateTimeFormat24hr)
                    : null,
            decimalRoundTo: decimalRoundTo,
            items: items,
        };

        return await asyncHandler<AddUpdateSaleResponse>(() => {
            return axios.post<ApiResponse<AddUpdateSaleResponse>>(
                `${this.hostPath}/${this.addSalePath}`,
                requestBody
            );
        });
    };

    updateSale = async (
        saleId: number,
        oldSaleItems: SaleItem[],
        saleForm: SaleInvoiceForm,
        companyId: number,
        companyTimezone: string,
        decimalRoundTo: number,
        oldAmountPaid: number
    ) => {
        let items: any = [];

        /* Sale Items req body   */
        Object.values(saleForm.items).forEach((item) => {
            items.push({
                itemId: item.item?.itemId,
                itemName: item.item?.itemName,
                companyId: companyId,
                unitId: item.item?.unitId,
                unitName: item.item?.unitName,
                unitsSold: Number(item.units),
                pricePerUnit: Number(item.pricePerUnit),
                subtotal: Number(item.subtotal),
                tax: Number(item.tax),
                taxPercent: item.taxPercent,
                totalAfterTax: Number(item.totalAfterTax),
            });
        });

        if (saleForm.paymentDueDate) {
            saleForm.paymentDueDate = setTimeToEmpty(saleForm.paymentDueDate);
        }
        if (saleForm.paymentCompletionDate) {
            saleForm.paymentCompletionDate = setTimeToEmpty(
                saleForm.paymentCompletionDate
            );
        }

        let requestBody = {
            saleId: saleId,
            createdAt: convertLocalUTCToTimezoneUTC(
                saleForm.createdAt,
                dateTimeFormat24hr,
                companyTimezone
            ),
            invoiceNumber: saleForm.invoiceNumber
                ? Number(saleForm.invoiceNumber)
                : null,
            quotationNumber: saleForm.quotationNumber
                ? Number(saleForm.quotationNumber)
                : null,
            companyTaxNumber: saleForm.companyTaxNumber,
            partyTaxNumber: saleForm.partyTaxNumber,
            companyId: companyId,
            partyId: saleForm.party ? saleForm.party?.partyId : null,
            partyName: saleForm.party ? saleForm.party?.partyName : null,
            isNoPartyBill: saleForm.isNoPartyBill,
            doneBy: saleForm.doneBy,
            subtotal: Number(saleForm.subtotal),
            discount: Number(saleForm.discount),
            totalAfterDiscount: Number(saleForm.totalAfterDiscount),
            taxPercent: saleForm.taxPercent,
            taxName: saleForm.taxName,
            tax: Number(saleForm.tax),
            totalAfterTax: Number(saleForm.totalAfterTax),
            isCredit: saleForm.isCredit,
            paymentDueDate: saleForm.paymentDueDate
                ? convertLocalUTCToTimezoneUTC(
                      saleForm.paymentDueDate,
                      dateTimeFormat24hr,
                      companyTimezone
                  )
                : null,
            amountPaid: Number(saleForm.amountPaid),
            oldAmountPaid: oldAmountPaid,
            amountDue: Number(saleForm.amountDue),
            isFullyPaid: Number(saleForm.amountDue) === 0,
            paymentCompletionDate:
                Number(saleForm.amountDue) === 0
                    ? moment.utc().format(dateTimeFormat24hr)
                    : null,
            decimalRoundTo: decimalRoundTo,
            oldItems: oldSaleItems,
            items: items,
        };

        return await asyncHandler<AddUpdateSaleResponse>(() => {
            return axios.put<ApiResponse<AddUpdateSaleResponse>>(
                `${this.hostPath}/${this.updateSalePath}`,
                requestBody
            );
        });
    };

    getAllQuotations = async <T>({
        pageParam,
    }: {
        pageParam: {
            pageSize: number;
            companyId: number;
            query?: FilterQuotationForm;
            quotationNumberSearchQuery?: number;
            cursor?: {
                updatedAt: string;
                quotationId: number;
            };
            countryDetails: Country;
            select?: [keyof Sale];
        };
    }) => {
        let requestQuery: FilterQuotationQuery = {};

        if (pageParam?.query) {
            if (pageParam?.query?.fromTransactionDateTime) {
                /* Converting UTC derived from system timezone to companies timezone derived UTC */
                requestQuery = {
                    ...requestQuery,
                    fromDate: convertLocalUTCToTimezoneUTC(
                        pageParam?.query?.fromTransactionDateTime,
                        dateTimeFormat24hr,
                        pageParam.countryDetails.timezone
                    ),
                };
                requestQuery = {
                    ...requestQuery,
                    toDate: convertLocalUTCToTimezoneUTC(
                        pageParam?.query?.toTransactionDateTime as Date,
                        dateTimeFormat24hr,
                        pageParam.countryDetails.timezone
                    ),
                };
            }

            requestQuery = {
                ...requestQuery,
                partyId: pageParam?.query?.party?.partyId,
                quotationNumberSearchQuery:
                    pageParam?.quotationNumberSearchQuery,
            };
        }

        return await asyncHandler<T>(async () => {
            return axios.post<ApiResponse<T>>(
                `${this.hostPath}/${this.getAllQuotationsPath}`,
                {
                    pageSize: pageParam?.pageSize,
                    companyId: pageParam?.companyId,
                    query: requestQuery,
                    cursor: pageParam?.cursor,
                    select: pageParam?.select,
                }
            );
        });
    };

    getQuotation = async (quotationId: number, companyId: number) => {
        return await asyncHandler<GetQuotationResponse>(() => {
            return axios.get<ApiResponse<GetQuotationResponse>>(
                `${this.hostPath}/${this.getQuotationPath}`,
                {
                    params: {
                        companyId,
                        quotationId,
                    },
                }
            );
        });
    };

    addQuotation = async (
        quotationForm: QuotationForm,
        companyId: number,
        companyTimezone: string,
        decimalRoundTo: number
    ) => {
        let items: any = [];

        /* Quotation Items req body   */
        Object.values(quotationForm.items).forEach((item) => {
            items.push({
                itemId: item.item?.itemId,
                itemName: item.item?.itemName,
                companyId: companyId,
                unitId: item.item?.unitId,
                unitName: item.item?.unitName,
                unitsSold: Number(item.units),
                pricePerUnit: Number(item.pricePerUnit),
                subtotal: Number(item.subtotal),
                tax: Number(item.tax),
                taxPercent: item.taxPercent,
                totalAfterTax: Number(item.totalAfterTax),
            });
        });

        let requestBody;
        requestBody = {
            createdAt: convertLocalUTCToTimezoneUTC(
                quotationForm.createdAt,
                dateTimeFormat24hr,
                companyTimezone
            ),
            quotationNumber: quotationForm.quotationNumber
                ? Number(quotationForm.quotationNumber)
                : null,
            companyId: companyId,
            partyId: quotationForm?.party?.partyId,
            partyName: quotationForm?.party?.partyName,
            createdBy: quotationForm.createdBy,
            subtotal: Number(quotationForm.subtotal),
            discount: Number(quotationForm.discount),
            totalAfterDiscount: Number(quotationForm.totalAfterDiscount),
            taxPercent: quotationForm.taxPercent,
            taxName: quotationForm.taxName,
            tax: Number(quotationForm.tax),
            totalAfterTax: Number(quotationForm.totalAfterTax),
            decimalRoundTo: decimalRoundTo,
            companyTaxNumber: quotationForm.companyTaxNumber,
            partyTaxNumber: quotationForm.partyTaxNumber,
            items: items,
        };

        return await asyncHandler<AddUpdateQuotationResponse>(() => {
            return axios.post<ApiResponse<AddUpdateQuotationResponse>>(
                `${this.hostPath}/${this.addQuotationPath}`,
                requestBody
            );
        });
    };

    updateQuotation = async (
        quotationId: number,
        oldQuotationItems: QuotationItem[],
        quotationForm: QuotationForm,
        companyId: number,
        companyTimezone: string,
        decimalRoundTo: number
    ) => {
        let items: any = [];

        /* Quotation Items req body   */
        Object.values(quotationForm.items).forEach((item) => {
            items.push({
                itemId: item.item?.itemId,
                itemName: item.item?.itemName,
                companyId: companyId,
                unitId: item.item?.unitId,
                unitName: item.item?.unitName,
                unitsSold: Number(item.units),
                pricePerUnit: Number(item.pricePerUnit),
                subtotal: Number(item.subtotal),
                tax: Number(item.tax),
                taxPercent: item.taxPercent,
                totalAfterTax: Number(item.totalAfterTax),
            });
        });

        let requestBody = {
            quotationId: quotationId,
            quotationNumber: quotationForm.quotationNumber
                ? Number(quotationForm.quotationNumber)
                : null,
            companyId: companyId,
            partyId: quotationForm?.party?.partyId,
            partyName: quotationForm?.party?.partyName,
            createdBy: quotationForm.createdBy,
            subtotal: Number(quotationForm.subtotal),
            discount: Number(quotationForm.discount),
            totalAfterDiscount: Number(quotationForm.totalAfterDiscount),
            taxPercent: quotationForm.taxPercent,
            taxName: quotationForm.taxName,
            tax: Number(quotationForm.tax),
            totalAfterTax: Number(quotationForm.totalAfterTax),
            decimalRoundTo: decimalRoundTo,
            oldItems: oldQuotationItems,
            companyTaxNumber: quotationForm.companyTaxNumber,
            partyTaxNumber: quotationForm.partyTaxNumber,
            items: items,
        };

        return await asyncHandler<AddUpdateQuotationResponse>(() => {
            return axios.put<ApiResponse<AddUpdateQuotationResponse>>(
                `${this.hostPath}/${this.updateQuotationPath}`,
                requestBody
            );
        });
    };

    getAllParties = async <T>({
        pageParam,
    }: {
        pageParam: {
            pageSize: number;
            companyId: number;
            cursor?: { partyId: number; updatedAt: string };
            query?: FilterPartiesQuery;
            select?: [keyof ThirdParty];
        };
    }) => {
        return await asyncHandler<T>(() => {
            return axios.post<ApiResponse<T>>(
                `${this.hostPath}/${this.getAllPartiesPath}`,
                {
                    pageSize: pageParam.pageSize,
                    companyId: pageParam.companyId,
                    cursor: pageParam?.cursor,
                    query: pageParam?.query,
                    select: pageParam?.select,
                }
            );
        });
    };

    addParty = async (companyId: number, partyDetails: AddUpdatePartyForm) => {
        return await asyncHandler<AddPartyResponse>(() => {
            return axios.post(`${this.hostPath}/${this.addPartyPath}`, {
                companyId: companyId,
                partyName: partyDetails.partyName,
                defaultSaleCreditAllowanceInDays: Number(
                    partyDetails.defaultSaleCreditAllowanceInDays
                ),
                defaultPurchaseCreditAllowanceInDays: Number(
                    partyDetails.defaultPurchaseCreditAllowanceInDays
                ),
                countryId: partyDetails?.country?.countryId as number,
                phoneNumber: `${partyDetails.phoneCode}${partyDetails.phoneNumber}`,
                isActive: partyDetails.isActive,
                taxDetails: Object.values(partyDetails.taxDetails as Object),
            });
        });
    };

    getParty = async (partyId: number, companyId: number) => {
        return await asyncHandler<GetPartyResponse>(() => {
            return axios.get(`${this.hostPath}/${this.getPartyPath}`, {
                params: {
                    partyId: partyId,
                    companyId: companyId,
                },
            });
        });
    };

    updateParty = async (
        partyId: number,
        companyId: number,
        partyDetails: AddUpdatePartyForm
    ) => {
        return await asyncHandler<UpdatePartyResponse>(() => {
            return axios.put(`${this.hostPath}/${this.updatePartyPath}`, {
                partyId,
                companyId,
                partyName: partyDetails.partyName,
                defaultSaleCreditAllowanceInDays: Number(
                    partyDetails.defaultSaleCreditAllowanceInDays
                ),
                defaultPurchaseCreditAllowanceInDays: Number(
                    partyDetails.defaultPurchaseCreditAllowanceInDays
                ),
                countryId: partyDetails.country?.countryId,
                phoneNumber: `${partyDetails.phoneCode}${partyDetails.phoneNumber}`,
                isActive: partyDetails.isActive,
                taxDetails: Object.values(partyDetails.taxDetails as Object),
            });
        });
    };
}

export default new BillingService();
