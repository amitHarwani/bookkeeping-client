export interface PriceHistoryOfCurrentStockType {
    stock: number;
    purchasePrice: number;
}

export interface Item {
    companyId: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    itemId: number;
    itemName: string;
    unitId: number;
    defaultSellingPrice: string | null;
    defaultPurchasePrice: string | null;
    stock: string;
    minStockToMaintain: number | null;
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

export class GetAllUnitsResponse {
    constructor(public units: Unit[]) {}
}

export class AddUnitResponse {
    constructor(public unit: Unit, public message: string) {}
}
