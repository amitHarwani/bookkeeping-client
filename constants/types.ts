import { TaxDetailsOfThirdPartyType, ThirdParty } from "@/services/billing/billing_types";
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
    };}

export interface AddUpdatePartyTaxDetails {
    [taxId: number]: { taxId: number; registrationNumber: string };
}

export interface FilterPurchaseForm {
    party?: ThirdParty,
    purchaseType?: "ALL" | "CASH" | "CREDIT",
    filterByDate?: boolean,
    fromTransactionDateTime?: Date,
    toTransactionDateTime?: Date,
    getOnlyOverduePayments: boolean
}
export interface AddPurchaseForm {
    party?: ThirdParty,
}
