import { AddUpdatePartyForm, FilterPurchaseForm } from "@/constants/types";
import axios from "axios";
import { ApiResponse } from "../api_response";
import { asyncHandler } from "../async_handler";
import {
    AddPartyResponse,
    FilterPartiesQuery,
    FilterPurchasesQuery,
    GetAllPartiesResponse,
    GetAllPurchasesResponse,
    GetPartyResponse,
    UpdatePartyResponse,
} from "./billing_types";
import moment from "moment";
import momentTimezone from "moment-timezone";
import { dateTimeFormat24hr } from "@/constants/datetimes";
import { Country } from "../sysadmin/sysadmin_types";
import { convertLocalUTCToTimezoneUTC } from "@/utils/common_utils";

class BillingService {
    hostPath = process.env.EXPO_PUBLIC_BILLING_SERVICE;
    getAllPartiesPath = "party/get-all-parties";
    addPartyPath = "party/add-party";
    getPartyPath = "party/get-party";
    updatePartyPath = "party/update-party";
    getAllPurchasesPath = "purchase/get-all-purchases";

    getAllPurchases = async ({
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

        return await asyncHandler<GetAllPurchasesResponse>(async () => {
            return axios.post<ApiResponse<GetAllPurchasesResponse>>(
                `${this.hostPath}/${this.getAllPurchasesPath}`,
                {
                    pageSize: pageParam?.pageSize,
                    companyId: pageParam?.companyId,
                    query: requestQuery,
                    cursor: pageParam?.cursor,
                }
            );
        });
    };

    getAllParties = async ({
        pageParam,
    }: {
        pageParam: {
            pageSize: number;
            companyId: number;
            cursor?: { partyId: number; updatedAt: string };
            query?: FilterPartiesQuery;
        };
    }) => {
        return await asyncHandler<GetAllPartiesResponse>(() => {
            return axios.post<ApiResponse<GetAllPartiesResponse>>(
                `${this.hostPath}/${this.getAllPartiesPath}`,
                {
                    pageSize: pageParam.pageSize,
                    companyId: pageParam.companyId,
                    cursor: pageParam?.cursor,
                    query: pageParam?.query,
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
