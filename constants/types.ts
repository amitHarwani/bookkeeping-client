import {
    TaxDetailsOfThirdPartyType,
    ThirdParty,
} from "@/services/billing/billing_types";
import { Item, Unit } from "@/services/inventory/inventory_types";
import { Country } from "@/services/sysadmin/sysadmin_types";

export type GenericObject = {
    [key: string]: any;
};
export interface LoginForm {
    email: string;
    password: string;
}

export interface RegisterForm {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
    country?: Country;
    phoneCode: string;
    mobileNumber: string;
    termsAgreed: boolean;
}

export interface AddCompanyForm {
    companyName: string;
    country?: Country;
    address: string;
    phoneCode: string;
    mobileNumber: string;
    localDayStartTime: string;
    decimalRoundTo: number;
    taxDetails?: {
        [taxId: number]: { taxId: number; registrationNumber: string };
    };
}

export interface AddItemForm {
    itemName: string;
    unit: Unit | null;
    defaultSellingPrice: number | null;
    defaultPurchasePrice: number | null;
    stock: number | null;
    minStockToMaintain: number | null;
    isActive: boolean;
    priceOfCurrentStock: number | null;
}

export interface ItemTypeInItemsList {
    itemId: number;
    updatedAt: Date;
    itemName: string;
    unitName: string;
    stock: string;
}
export interface FilterItemForm {
    itemType: { all: boolean; isActive: boolean };
    filterByStockLow: boolean;
}

export interface UpdateItemForm {
    itemName: string;
    unit: Unit | null;
    defaultSellingPrice: number | null;
    defaultPurchasePrice: number | null;
    minStockToMaintain: number | null;
    isActive: boolean;
}

export interface AdjustItemForm {
    item: Item;
    addStock: boolean;
    stockAdjusted: number;
    reason: string;
    pricePerUnit: number | null;
}

export interface PartyTypeInPartyList {
    partyId: number;
    partyName: string;
    updatedAt: Date;
}
export interface FilterPartyForm {
    partyType: { all: boolean; isActive: boolean };
}

export interface AddUpdatePartyForm {
    partyName: string;
    defaultSaleCreditAllowanceInDays: number;
    defaultPurchaseCreditAllowanceInDays: number;
    country?: Country;
    phoneCode: string;
    phoneNumber: string;
    isActive: boolean;
    taxDetails?: {
        [taxId: number]: { taxId: number; registrationNumber: string };
    };
}

export interface AddUpdatePartyTaxDetails {
    [taxId: number]: { taxId: number; registrationNumber: string };
}

export interface PurchaseTypeInPurchaseList {
    purchaseId: number;
    partyName: string;
    invoiceNumber: number;
    totalAfterTax: string;
    updatedAt: Date;
}
export interface SaleTypeInSalesList {
    saleId: number;
    partyName: string | null;
    isNoPartyBill: boolean,
    invoiceNumber: number;
    totalAfterTax: string;
    updatedAt: Date;
}
export interface QuotationTypeInQuotationsList {
    partyName: string;
    quotationNumber: number;
    saleId: number;
    totalAfterTax: number;
    createdAt: string;
    updatedAt: string;
    quotationId: number;
}
export interface FilterPurchaseForm {
    party?: ThirdParty;
    purchaseType?: "ALL" | "CASH" | "CREDIT";
    filterByDate?: boolean;
    fromTransactionDateTime?: Date;
    toTransactionDateTime?: Date;
    getOnlyOverduePayments: boolean;
}

export interface FilterSalesForm {
    party?: ThirdParty;
    purchaseType?: "ALL" | "CASH" | "CREDIT";
    filterByDate?: boolean;
    fromTransactionDateTime?: Date;
    toTransactionDateTime?: Date;
    getOnlyOverduePayments: boolean;
}

export interface FilterQuotationForm {
    party?: PartyTypeInInvoicePartySelector,
    filterByDate?: boolean,
    fromTransactionDateTime?: Date;
    toTransactionDateTime?: Date;
}

export interface PartyTypeInInvoicePartySelector {
    partyId: number;
    partyName: string;
    updatedAt: Date;
    defaultPurchaseCreditAllowanceInDays: number
    defaultSaleCreditAllowanceInDays: number
}
export interface PurchaseInvoiceForm {
    createdAt: Date,
    party?: PartyTypeInInvoicePartySelector;
    invoiceNumber?: number;
    items: { [itemId: number]: PurchaseInvoiceItem };
    discount: string;
    subtotal: string;
    totalAfterDiscount: string;
    tax: string;
    totalAfterTax: string;
    taxPercent: number,
    taxName: string,
    isCredit: boolean,

    paymentDueDate: Date | null,
    amountPaid: number,
    amountDue: number,

    paymentCompletionDate: Date | null,
    isFullyPaid: boolean,
    receiptNumber: string | null
}

export interface SaleInvoiceForm {
    createdAt: Date,
    isNoPartyBill: boolean,
    party: PartyTypeInInvoicePartySelector | null;
    doneBy: string,
    autogenerateInvoice: boolean,
    invoiceNumber: number | null;
    quotationNumber: number | null;
    items: { [itemId: number]: SaleInvoiceItem };
    discount: string;
    subtotal: string;
    totalAfterDiscount: string;
    tax: string;
    totalAfterTax: string;
    taxPercent: number,
    taxName: string,
    isCredit: boolean,

    paymentDueDate: Date | null,
    amountPaid: number,
    amountDue: number,

    paymentCompletionDate: Date | null,
    isFullyPaid: boolean,
}

export interface QuotationForm {
    createdAt: Date,
    autogenerateQuotationNumber: boolean,
    quotationNumber: number | null;
    party: PartyTypeInInvoicePartySelector | null;
    createdBy: string,
    items: { [itemId: number]: SaleInvoiceItem };
    discount: string;
    subtotal: string;
    totalAfterDiscount: string;
    tax: string;
    totalAfterTax: string;
    taxPercent: number,
    taxName: string,
}

export interface ItemTypeInInvoiceItem {
    itemId: number;
    itemName: string;
    unitId: number;
    unitName: string;
    updatedAt: Date;
}
export interface PurchaseInvoiceItem {
    item?: ItemTypeInInvoiceItem;
    units: number;
    pricePerUnit: number;
    subtotal: string;
    tax: string;
    totalAfterTax: string;
    taxPercent: number
}

export interface SaleInvoiceItem {
    item?: ItemTypeInInvoiceItem;
    units: number;
    pricePerUnit: number;
    subtotal: string;
    tax: string;
    totalAfterTax: string;
    taxPercent: number
}

export type QuickActionTypes = "SALE" | "PURCHASE" | "ITEMS"

export interface TableColDefType {
    id: string,
    text: string,
    extraCellStyles?: Object
    extraCellProps?: Object
}
