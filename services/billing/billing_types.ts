import {
    PartyTypeInInvoicePartySelector,
    PartyTypeInPartyList,
    PurchaseTypeInPurchaseList,
    QuotationTypeInQuotationsList,
    SaleTypeInSalesList,
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
    tax: string;
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

export interface Sale {
    companyId: number;
    createdAt: string;
    updatedAt: Date;
    taxName: string;
    doneBy: string;
    partyId: number | null;
    partyName: string | null;
    invoiceNumber: number;
    subtotal: string;
    discount: string;
    totalAfterDiscount: string;
    tax: string;
    taxPercent: string;
    totalAfterTax: string;
    isCredit: boolean;
    paymentDueDate: string | null;
    amountPaid: string;
    amountDue: string;
    isFullyPaid: boolean;
    paymentCompletionDate: string | null;
    saleId: number;
    isNoPartyBill: boolean;
    companyTaxNumber: string;
    partyTaxNumber: string;
}

export interface SaleItem {
    companyId: number;
    createdAt: Date;
    updatedAt: Date;
    itemId: number;
    itemName: string;
    unitId: number;
    unitName: string;
    pricePerUnit: string;
    subtotal: string;
    tax: string;
    taxPercent: string;
    totalAfterTax: string;
    saleId: number;
    unitsSold: string;
}

export interface Quotation {
    companyId: number;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    taxName: string;
    partyId: number;
    partyName: string;
    subtotal: string;
    discount: string;
    totalAfterDiscount: string;
    tax: string;
    taxPercent: string;
    totalAfterTax: string;
    quotationId: number;
    quotationNumber: number;
    saleId: number | null;
    companyTaxNumber: string;
    partyTaxNumber: string;
}

export interface QuotationItem {
    companyId: number;
    createdAt: string;
    updatedAt: string;
    itemId: number;
    itemName: string;
    unitId: number;
    unitName: string;
    pricePerUnit: string;
    subtotal: string;
    tax: string;
    taxPercent: string;
    totalAfterTax: string;
    unitsSold: string;
    quotationId: number;
}

export interface SaleReturn {
    companyId: number;
    saleId: number;
    invoiceNumber: number;
    createdAt: string;
    saleReturnId: number;
    saleReturnNumber: number;
    subtotal: string;
    tax: string;
    taxPercent: string;
    taxName: string;
    totalAfterTax: string;
}
export interface SaleReturnItem {
    companyId: number;
    createdAt: string;
    saleReturnId: number;
    subtotal: string;
    tax: string;
    taxPercent: string;
    totalAfterTax: string;
    itemId: number;
    itemName: string;
    unitId: number;
    unitName: string;
    pricePerUnit: string;
    unitsSold: string;
}

export interface PurchaseReturn {
    companyId: number;
    createdAt: string;
    purchaseReturnId: number;
    purchaseReturnNumber: number;
    purchaseId: number;
    subtotal: string;
    tax: string;
    taxPercent: string;
    taxName: string;
    totalAfterTax: string;
}

export interface PurchaseReturnItem {
    companyId: number;
    createdAt: string;
    purchaseReturnId: number;
    subtotal: string;
    tax: string;
    taxPercent: string;
    totalAfterTax: string;
    itemId: number;
    itemName: string;
    unitId: number;
    unitName: string;
    pricePerUnit: string;
    unitsPurchased: string;
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

export interface FilterSalesQuery {
    partyId?: number;
    purchaseType?: "ALL" | "CASH" | "CREDIT";
    fromTransactionDate?: string;
    toTransactionDate?: string;
    getOnlyOverduePayments?: boolean;
    invoiceNumberSearchQuery?: number;
}
export interface FilterQuotationQuery {
    partyId?: number;
    fromDate?: string;
    toDate?: string;
    quotationNumberSearchQuery?: number;
}

export class GetAllSalesResponse {
    constructor(
        public sales: Sale[],
        public hasNextPage: boolean,
        public nextPageCursor?: {
            updatedAt: Date;
            saleId: number;
        }
    ) {}
}

export class GetAllSalesForSalesListResponse {
    constructor(
        public sales: [SaleTypeInSalesList],
        public hasNextPage: boolean,
        public nextPageCursor?: {
            updatedAt: Date;
            saleId: number;
        }
    ) {}
}

export class AddUpdateSaleResponse {
    constructor(
        public sale: Sale,
        public saleItems: Array<SaleItem>,
        public message: string
    ) {}
}

export class GetSaleResponse {
    constructor(public sale: Sale, public saleItems: Array<SaleItem>) {}
}

export class GetAllQuotationsResponse {
    constructor(
        public quotations: Quotation[],
        public hasNextPage: boolean,
        public nextPageCursor?: {
            updatedAt: Date;
            saleId: number;
        }
    ) {}
}

export class GetAllQuotationsForQuotationListResponse {
    constructor(
        public quotations: [QuotationTypeInQuotationsList],
        public hasNextPage: boolean,
        public nextPageCursor?: {
            updatedAt: Date;
            quotationId: number;
        }
    ) {}
}

export class GetQuotationResponse {
    constructor(
        public quotation: Quotation,
        public quotationItems: Array<QuotationItem>
    ) {}
}

export class AddUpdateQuotationResponse {
    constructor(
        public quotation: Quotation,
        public quotationItems: Array<QuotationItem>,
        public message: string
    ) {}
}

export class GetCashFlowSummaryResponse {
    constructor(
        public cashIn: number,
        public cashOut: number,
        public collectionsDue: number,
        public paymentsDue: number
    ) {}
}

export class GetTopSellersForCurrentMonthResponse {
    constructor(
        public topSellingItems: Array<{
            itemId: number;
            itemName: string;
            totalUnitsSold: string;
        }>
    ) {}
}

export class AddSaleReturnResponse {
    constructor(
        public saleReturn: SaleReturn,
        public saleReturnItems: Array<SaleReturnItem>
    ) {}
}

export class GetSaleReturnsOfSaleResponse {
    constructor(public saleReturns: Array<SaleReturn>) {}
}

export class GetSaleReturnResponse {
    constructor(
        public saleReturn: SaleReturn,
        public saleReturnItems: Array<SaleReturnItem>
    ) {}
}


export class AddPurchaseReturnResponse {
    constructor(
        public purchaseReturn: PurchaseReturn,
        public purchaseReturnItems: Array<PurchaseReturnItem>
    ) {}
}

export class GetPurchaseReturnsOfPurchaseResponse {
    constructor(public purchaseReturns: Array<PurchaseReturn>) {}
}

export class GetPurchaseReturnResponse {
    constructor(
        public purchaseReturn: PurchaseReturn,
        public purchaseReturnItems: Array<PurchaseReturnItem>
    ) {}
}
