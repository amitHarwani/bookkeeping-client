import { asyncHandler } from "../async_handler";
import axios from "axios";
import {
    AddItemResponse,
    AddUnitResponse,
    FilterItemsQuery,
    GetAllItemsResponse,
    GetAllUnitsResponse,
    GetItemResponse,
    UpdateItemResponse,
} from "./inventory_types";
import { ApiResponse } from "../api_response";
import { AddItemForm, UpdateItemForm } from "@/constants/types";

class InventoryService {
    hostPath = process.env.EXPO_PUBLIC_INVENTORY_SERVICE;
    getAllItemsPath = "item/get-all-items";
    getItemPath = "item/get-item";
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
            query?: FilterItemsQuery;
        };
    }) => {
        return await asyncHandler<GetAllItemsResponse>(() => {
            return axios.post<ApiResponse<GetAllItemsResponse>>(
                `${this.hostPath}/${this.getAllItemsPath}`,
                {
                    pageSize: pageParam.pageSize,
                    companyId: pageParam.companyId,
                    cursor: pageParam?.cursor,
                    query: pageParam?.query,
                }
            );
        });
    };

    getItem = async (itemId: number, companyId: number) => {
        return await asyncHandler<GetItemResponse>(() => {
            return axios.get<ApiResponse<GetItemResponse>>(
                `${this.hostPath}/${this.getItemPath}`,
                {
                    params: { itemId: itemId, companyId: companyId },
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

    addItem = async (itemForm: AddItemForm, companyId: number) => {
        return await asyncHandler<AddItemResponse>(() => {
            return axios.post<ApiResponse<AddItemResponse>>(
                `${this.hostPath}/${this.addItemPath}`,
                {
                    companyId: companyId,
                    isActive: itemForm.isActive,
                    itemName: itemForm.itemName,
                    unitId: itemForm.unit?.unitId,
                    unitName: itemForm.unit?.unitName,
                    stock: Number(itemForm.stock),
                    minStockToMaintain: Number(itemForm.minStockToMaintain),
                    defaultSellingPrice: Number(itemForm.defaultSellingPrice),
                    defaultPurchasePrice: Number(itemForm.defaultPurchasePrice),
                    priceHistoryOfCurrentStock:
                        Number(itemForm.stock) > 0
                            ? [
                                  {
                                      stock: Number(itemForm.stock),
                                      purchasePrice: Number(
                                          itemForm.priceOfCurrentStock
                                      ),
                                  },
                              ]
                            : null,
                }
            );
        });
    };

    updateItem = async (
        itemId: number,
        companyId: number,
        itemDetails: UpdateItemForm
    ) => {
        return await asyncHandler<UpdateItemResponse>(() => {
            return axios.put(`${this.hostPath}/${this.updateItemPath}`, {
                itemId: itemId,
                companyId: companyId,
                isActive: itemDetails.isActive,
                itemName: itemDetails.itemName,
                unitId: itemDetails.unit?.unitId,
                unitName: itemDetails.unit?.unitName,
                minStockToMaintain: Number(itemDetails.minStockToMaintain),
                defaultSellingPrice: Number(itemDetails.defaultSellingPrice),
                defaultPurchasePrice: Number(itemDetails.defaultPurchasePrice),
            });
        });
    };
}

export default new InventoryService();
