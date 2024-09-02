import {
    AddUpdatePartyForm,
    FilterPurchaseForm,
    InvoiceForm,
} from "@/constants/types";
import axios from "axios";
import { ApiResponse } from "../api_response";
import { asyncHandler } from "../async_handler";
import {
    AddPartyResponse,
    AddPurchaseResponse,
    FilterPartiesQuery,
    FilterPurchasesQuery,
    GetAllPartiesResponse,
    GetAllPurchasesResponse,
    GetPartyResponse,
    Purchase,
    ThirdParty,
    UpdatePartyResponse,
} from "./billing_types";
import moment from "moment";
import momentTimezone from "moment-timezone";
import { dateFormat, dateTimeFormat24hr } from "@/constants/datetimes";
import { Country } from "../sysadmin/sysadmin_types";
import { convertLocalUTCToTimezoneUTC } from "@/utils/common_utils";

class BillingService {
    hostPath = process.env.EXPO_PUBLIC_BILLING_SERVICE;
    getAllPartiesPath = "party/get-all-parties";
    addPartyPath = "party/add-party";
    getPartyPath = "party/get-party";
    updatePartyPath = "party/update-party";
    getAllPurchasesPath = "purchase/get-all-purchases";
    addPurchasePath = "purchase/add-purchase";

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
                purchaseId: bigint;
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

    addPurchase = async (
        purchaseForm: InvoiceForm,
        companyId: number,
        companyTimezone: string,
        taxPercent: number,
        taxName: string,
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
                taxPercent: taxPercent,
                totalAfterTax: Number(item.totalAfterTax),
            });
        });
        let requestBody;
        requestBody = {
            invoiceNumber: Number(purchaseForm.invoiceNumber),
            companyId: companyId,
            partyId: purchaseForm.party?.partyId,
            partyName: purchaseForm.party?.partyName,
            subtotal: Number(purchaseForm.subtotal),
            discount: Number(purchaseForm.discount),
            totalAfterDiscount: Number(purchaseForm.totalAfterDiscount),
            taxPercent: taxPercent,
            taxName: taxName,
            tax: Number(purchaseForm.tax),
            totalAfterTax: Number(purchaseForm.totalAfterTax),
            isCredit: purchaseForm.isCredit,
            paymentDueDate: purchaseForm.paymentDueDate
                ? convertLocalUTCToTimezoneUTC(
                      purchaseForm.paymentDueDate,
                      dateFormat,
                      companyTimezone
                  )
                : null,
            amountPaid: Number(purchaseForm.amountPaid),
            amountDue: Number(purchaseForm.amountDue),
            isFullyPaid: Number(purchaseForm.amountDue) === 0,
            paymentCompletionDate:
                Number(purchaseForm.amountDue) === 0
                    ? moment.utc().format(dateFormat)
                    : null,
            receiptNumber: purchaseForm.receiptNumber
                ? purchaseForm.receiptNumber
                : null,
            decimalRoundTo: decimalRoundTo,
            items: items,
        };


        return await asyncHandler<AddPurchaseResponse>(() => {
            return axios.post<ApiResponse<AddPurchaseResponse>>(
                `${this.hostPath}/${this.addPurchasePath}`,
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
