import {
    PartyTypeInInvoicePartySelector,
    PartyTypeInPartyList,
    PurchaseTypeInPurchaseList,
} from "@/constants/types";

export interface ThirdParty {
    companyId: number;
    countryId: number;
    phoneNumber: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    taxDetails: unknown[] | null;
    partyId: number;
    partyName: string;
    defaultSaleCreditAllowanceInDays: number;
    defaultPurchaseCreditAllowanceInDays: number;
}

export interface Purchase {
    companyId: number;
    createdAt: string;
    updatedAt: Date;
    taxName: string;
    partyId: number;
    partyName: string;
    purchaseId: number;
    invoiceNumber: number;
    subtotal: string;
    discount: string;
    tax: string,
    totalAfterDiscount: string;
    taxPercent: string;
    totalAfterTax: string;
    isCredit: boolean;
    paymentDueDate: string | null;
    amountPaid: string;
    amountDue: string;
    isFullyPaid: boolean;
    paymentCompletionDate: string | null;
    receiptNumber: string | null;
}
export interface PurchaseItem {
    purchaseId: number;
    companyId: number;
    createdAt: Date;
    updatedAt: Date;
    subtotal: string;
    tax: string;
    taxPercent: string;
    totalAfterTax: string;
    itemId: number;
    itemName: string;
    unitId: number;
    unitName: string;
    unitsPurchased: string;
    pricePerUnit: string;
}

export interface FilterPartiesQuery {
    isActive?: boolean;
    partyNameSearchQuery?: string;
}

export interface TaxDetailsOfThirdPartyType {
    taxId: number;
    registrationNumber: string;
}

export class GetAllPartiesResponse {
    constructor(
        public parties: ThirdParty[],
        public hasNextPage: boolean,
        public nextPageCursor?: {
            partyId: number;
            updatedAt: Date;
        }
    ) {}
}
export class GetAllPartiesForPartiesListResponse {
    constructor(
        public parties: [PartyTypeInPartyList],
        public hasNextPage: boolean,
        public nextPageCursor?: {
            partyId: number;
            updatedAt: Date;
        }
    ) {}
}

export class GetAllPartiesForInvoicePartySelectorResponse {
    constructor(
        public parties: [PartyTypeInInvoicePartySelector],
        public hasNextPage: boolean,
        public nextPageCursor?: {
            partyId: number;
            updatedAt: Date;
        }
    ) {}
}

export class AddPartyResponse {
    constructor(public party: ThirdParty, public message: string) {}
}

export class GetPartyResponse {
    constructor(public party: ThirdParty) {}
}

export class UpdatePartyResponse {
    constructor(public party: ThirdParty, public message: string) {}
}

export interface FilterPurchasesQuery {
    partyId?: number;
    purchaseType?: "ALL" | "CASH" | "CREDIT";
    fromTransactionDate?: string;
    toTransactionDate?: string;
    getOnlyOverduePayments?: boolean;
    invoiceNumberSearchQuery?: number;
}

export class GetAllPurchasesResponse {
    constructor(
        public purchases: Purchase[],
        public hasNextPage: boolean,
        public nextPageCursor?: {
            updatedAt: Date;
            purchaseId: number;
        }
    ) {}
}

export class GetAllPurchasesForPurchaseListResponse {
    constructor(
        public purchases: [PurchaseTypeInPurchaseList],
        public hasNextPage: boolean,
        public nextPageCursor?: {
            updatedAt: Date;
            purchaseId: number;
        }
    ) {}
}

export class AddUpdatePurchaseResponse {
    constructor(
        public purchase: Purchase,
        public purchaseItems: PurchaseItem[],
        public message: string
    ) {}
}

export class GetPurchaseResponse {
    constructor(
        public purchase: Purchase,
        public purchaseItems: PurchaseItem[]
    ) {}
}
