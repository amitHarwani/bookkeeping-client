import { asyncHandler } from "../async_handler";
import axios from "axios";
import {
    GetAllCountriesResponse,
    GetAllFeaturesResponse,
    GetTaxDetailsOfCountryResponse,
} from "./sysadmin_types";
import { ApiResponse } from "../api_response";

class SystemAdminService {
    getAllCountriesPath = "get-all-countries";
    getTaxDetailsOfCountryPath = "get-taxdetails-of-country";
    getAllFeaturesPath = "get-all-features";
    hostPath = process.env.EXPO_PUBLIC_SYSADMIN_SERVICE;

    getAllCountries = async () => {
        return await asyncHandler<GetAllCountriesResponse>(() => {
            return axios.get<ApiResponse<GetAllCountriesResponse>>(
                `${this.hostPath}/${this.getAllCountriesPath}`
            );
        });
    };

    getTaxDetailsOfCountry = async (countryId: number) => {
        return await asyncHandler<GetTaxDetailsOfCountryResponse>(() => {
            return axios.get<ApiResponse<GetTaxDetailsOfCountryResponse>>(
                `${this.hostPath}/${this.getTaxDetailsOfCountryPath}/${countryId}`
            );
        });
    };

    getAllEnabledFeatures = async () => {
        return await asyncHandler<GetAllFeaturesResponse>(() => {
            return axios.post(`${this.hostPath}/${this.getAllFeaturesPath}`, {
                query: {
                    isEnabled: true,
                    isSystemAdminFeature: false,
                },
            });
        });
    };
}

export default new SystemAdminService();
