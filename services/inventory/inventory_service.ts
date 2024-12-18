import { dateTimeFormat24hr } from "@/constants/datetimes";
import {
    AddItemForm,
    AddUpdateTransferForm,
    AdjustItemForm,
    FilterTransfersForm,
    UpdateItemForm,
} from "@/constants/types";
import { convertLocalUTCToTimezoneUTC } from "@/utils/common_utils";
import axios from "axios";
import { ApiResponse } from "../api_response";
import { asyncHandler } from "../async_handler";
import { Country } from "../sysadmin/sysadmin_types";
import {
    AddItemResponse,
    AddTransferResponse,
    AddUnitResponse,
    AdjustItemResponse,
    FilterItemsQuery,
    FilterTransfersQuery,
    GetAllUnitsResponse,
    GetItemResponse,
    GetLowStockItemsResponse,
    GetTransferResponse,
    Item,
    Transfer,
    UpdateItemResponse,
} from "./inventory_types";

class InventoryService {
    hostPath = process.env.EXPO_PUBLIC_INVENTORY_SERVICE;
    getAllItemsPath = "item/get-all-items";
    getItemPath = "item/get-item";
    addItemPath = "item/add-item";
    updateItemPath = "item/update-item";
    getAllUnitsPath = "unit/get-all-units";
    addUnitPath = "unit/add-unit";
    adjustItemPath = "item/adjust-item";
    getLowStockItemsPath = "insights/get-low-stock-items";
    getAllTransfersPath = "transfers/get-all-transfers";
    getTransferPath = "transfers/get-transfer";
    addTransferPath = "transfers/add-transfer";

    getAllItems = async <T>({
        pageParam,
    }: {
        pageParam: {
            pageSize: number;
            companyId: number;
            cursor?: { itemId: number; updatedAt: string };
            query?: FilterItemsQuery;
            select?: [keyof Item];
        };
    }) => {
        return await asyncHandler<T>(() => {
            return axios.post<ApiResponse<T>>(
                `${this.hostPath}/${this.getAllItemsPath}`,
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
                                      purchaseId: null,
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

    adjustItem = async (adjustItemDetails: AdjustItemForm) => {
        return await asyncHandler<AdjustItemResponse>(() => {
            return axios.patch(`${this.hostPath}/${this.adjustItemPath}`, {
                itemId: adjustItemDetails.item.itemId,
                companyId: adjustItemDetails.item.companyId,
                adjustmentType: adjustItemDetails.addStock ? "ADD" : "SUBTRACT",
                reason: adjustItemDetails.reason,
                pricePerUnit: Number(adjustItemDetails.pricePerUnit),
                stockAdjusted: Number(adjustItemDetails.stockAdjusted),
            });
        });
    };

    getLowStockItems = async ({
        pageParam,
    }: {
        pageParam: {
            pageSize: number;
            companyId: number;
            cursor?: { itemId: number };
        };
    }) => {
        return await asyncHandler<GetLowStockItemsResponse>(() => {
            return axios.post<ApiResponse<GetLowStockItemsResponse>>(
                `${this.hostPath}/${this.getLowStockItemsPath}`,
                {
                    companyId: pageParam.companyId,
                    pageSize: pageParam.pageSize,
                    cursor: pageParam?.cursor,
                }
            );
        });
    };

    getAllTransfers = async <T>({
        pageParam,
    }: {
        pageParam: {
            pageSize: number;
            companyId: number;
            cursor?: { transferId: number; createdAt: string };
            query?: FilterTransfersForm;
            countryDetails: Country;
            select?: [keyof Transfer];
        };
    }) => {
        /* Query for filters */
        let filtersQuery: FilterTransfersQuery = {};

        /* If query is passed */
        if (pageParam?.query) {
            /* If from date is passed */
            if (pageParam?.query?.fromDate) {
                /* Converting to UTC time, selected time is companies local time */
                filtersQuery = {
                    ...filtersQuery,
                    fromDate: convertLocalUTCToTimezoneUTC(
                        pageParam?.query?.fromDate,
                        dateTimeFormat24hr,
                        pageParam.countryDetails.timezone
                    ),
                };
                filtersQuery = {
                    ...filtersQuery,
                    toDate: convertLocalUTCToTimezoneUTC(
                        pageParam?.query?.toDate as Date,
                        dateTimeFormat24hr,
                        pageParam.countryDetails.timezone
                    ),
                };
            }
            /* If type is passed add it to the filters query */
            if (pageParam.query?.type) {
                filtersQuery = { ...filtersQuery, type: pageParam.query.type };
            }
        }
        return await asyncHandler<T>(() => {
            return axios.post<ApiResponse<T>>(
                `${this.hostPath}/${this.getAllTransfersPath}`,
                {
                    pageSize: pageParam.pageSize,
                    companyId: pageParam.companyId,
                    cursor: pageParam?.cursor,
                    query: filtersQuery,
                    select: pageParam?.select,
                }
            );
        });
    };

    getTransfer = async (companyId: number, transferId: number) => {
        return await asyncHandler<GetTransferResponse>(() => {
            return axios.get<ApiResponse<GetTransferResponse>>(
                `${this.hostPath}/${this.getTransferPath}`,
                {
                    params: {
                        transferId,
                        companyId,
                    },
                }
            );
        });
    };
    addTransfer = async (
        fromCompanyId: number,
        fromCompanyName: string,
        details: AddUpdateTransferForm
    ) => {
        let items: Array<{
            itemId: number;
            itemName: string;
            unitId: number;
            unitName: string;
            unitsTransferred: number;
        }> = [];

        Object.values(details.items).forEach((item) => {
            items.push({
                itemId: item.item.itemId,
                itemName: item.item.itemName,
                unitId: item.item.unitId,
                unitName: item.item.unitName,
                unitsTransferred: Number(item.unitsTransferred),
            });
        });
        return await asyncHandler<AddTransferResponse>(() => {
            return axios.post<ApiResponse<AddTransferResponse>>(
                `${this.hostPath}/${this.addTransferPath}`,
                {
                    fromCompanyId,
                    fromCompanyName,
                    toCompanyId: details.toCompany?.companyId,
                    toCompanyName: details.toCompany?.companyName,
                    items: items,
                }
            );
        });
    };
}

export default new InventoryService();
