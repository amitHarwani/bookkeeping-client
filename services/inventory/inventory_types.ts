import { ItemTypeInInvoiceItem, ItemTypeInItemsList } from "@/constants/types";

export interface PriceHistoryOfCurrentStockType {
    stock: number;
    purchasePrice: number;
    purchaseId?: number;
}

export interface Item {
    companyId: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    itemId: number;
    itemName: string;
    unitId: number;
    unitName: string;
    defaultSellingPrice: string | null;
    defaultPurchasePrice: string | null;
    stock: string;
    minStockToMaintain: string | null;
    priceHistoryOfCurrentStock: PriceHistoryOfCurrentStockType[] | null;
}

export interface Unit {
    unitId: number;
    unitName: string;
    companyId: number;
}

export class GetAllItemsResponse {
    constructor(
        public items: Item[],
        public hasNextPage: boolean,
        public nextPageCursor?: {
            itemId: number;
            updatedAt: Date;
        }
    ) {}
}

export class GetAllItemsForItemsListResponse {
    constructor(
        public items: [ItemTypeInItemsList],
        public hasNextPage: boolean,
        public nextPageCursor?: {
            itemId: number;
            updatedAt: Date;
        }
    ) {}
}
export class GetAllItemsForInvoiceItemSelectorResponse {
    constructor(
        public items: [ItemTypeInInvoiceItem],
        public hasNextPage: boolean,
        public nextPageCursor?: {
            itemId: number;
            updatedAt: Date;
        }
    ) {}
}

export class GetAllUnitsResponse {
    constructor(public units: Unit[]) {}
}

export class AddUnitResponse {
    constructor(public unit: Unit, public message: string) {}
}

export class AddItemResponse {
    constructor(public item: Item, public message: string) {}
}

export interface FilterItemsQuery {
    isActive?: boolean;
    isStockLow?: boolean;
    itemNameSearchQuery?: string;
}

export class GetItemResponse {
    constructor(public item: Item) {}
}

export class UpdateItemResponse {
    constructor(public item: Item, public message: string) {}
}

export class AdjustItemResponse {
    constructor(public item: Item, public message: string) {}
}

export class GetLowStockItemsResponse {
    constructor(
        public lowStockItems: Array<{
            itemId: number;
            itemName: string;
            stock: string;
            minStockToMaintain: string | null;
            difference: string;
            updatedAt: Date,
            unitName: string
        }>,
        public nextPageCursor?: {itemId: number}
    ) {}
}
