import { AddUpdatePartyForm } from "@/constants/types";
import axios from "axios";
import { ApiResponse } from "../api_response";
import { asyncHandler } from "../async_handler";
import {
    AddPartyResponse,
    FilterPartiesQuery,
    GetAllPartiesResponse,
    GetPartyResponse,
    UpdatePartyResponse,
} from "./billing_types";

class BillingService {
    hostPath = process.env.EXPO_PUBLIC_BILLING_SERVICE;
    getAllPartiesPath = "party/get-all-parties";
    addPartyPath = "party/add-party";
    getPartyPath = "party/get-party";
    updatePartyPath = "party/update-party";

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
        console.log("Query Party Name Searched", pageParam?.query?.partyNameSearchQuery);
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
