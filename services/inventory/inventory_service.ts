import { asyncHandler } from "../async_handler";
import axios from "axios";
import {
    AddUnitResponse,
    GetAllItemsResponse,
    GetAllUnitsResponse,
} from "./inventory_types";
import { ApiResponse } from "../api_response";

class InventoryService {
    hostPath = process.env.EXPO_PUBLIC_INVENTORY_SERVICE;
    getAllItemsPath = "item/get-all-items";
    addItemPath = "item/add-item";
    updateItemPath = "item/update-item";
    getAllUnitsPath = "unit/get-all-units";
    addUnitPath = "unit/add-unit";

    getAllItems = async ({
        pageParam,
    }: {
        pageParam: {
            pageSize: number;
            companyId: number;
            cursor?: { itemId: number; updatedAt: string };
        };
    }) => {
        return await asyncHandler<GetAllItemsResponse>(() => {
            return axios.post<ApiResponse<GetAllItemsResponse>>(
                `${this.hostPath}/${this.getAllItemsPath}`,
                {
                    pageSize: pageParam.pageSize,
                    companyId: pageParam.companyId,
                    cursor: pageParam?.cursor,
                }
            );
        });
    };

    getAllUnits = async (companyId: number) => {
        return await asyncHandler<GetAllUnitsResponse>(() => {
            return axios.get<ApiResponse<GetAllUnitsResponse>>(
                `${this.hostPath}/${this.getAllUnitsPath}/${companyId}`
            );
        });
    };

    addUnit = async (unitName: string, companyId: number) => {
        return await asyncHandler<AddUnitResponse>(() => {
            return axios.post<ApiResponse<AddUnitResponse>>(
                `${this.hostPath}/${this.addUnitPath}`,
                {
                    unitName,
                    companyId,
                }
            );
        });
    };
}

export default new InventoryService();
