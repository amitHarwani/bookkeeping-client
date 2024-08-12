import { asyncHandler } from "../async_handler";
import axios from "axios";
import { GetAllCountriesResponse } from "./sysadmin_types";
import { ApiResponse } from "../api_response";

class SystemAdminService {
    getAllCountriesPath = "get-all-countries";
    hostPath = process.env.EXPO_PUBLIC_SYSADMIN_SERVICE;

 
    getAllCountries = async () => {
        return await asyncHandler<GetAllCountriesResponse>(() => {
            return axios.get<ApiResponse<GetAllCountriesResponse>>(
                `${this.hostPath}/${this.getAllCountriesPath}`
            );
        });
    }
}

export default new SystemAdminService();
