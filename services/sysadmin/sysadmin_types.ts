export interface Country {
    countryId: number;
    countryName: string;
    phoneNumberCodes: string[] | null;
    currency: string;
    maxPhoneNumberDigits: number;
    timezone: string;
}
export class GetAllCountriesResponse {
    constructor(public countries: Country[]) {}
}

export interface TaxDetail {
    taxId: number;
    countryId: number;
    taxName: string;
    taxPercentage: string;
    taxNickname: string;
    isTaxOnInvoice: boolean | null;
    isRegistrationOptional: boolean | null;
}
export class GetTaxDetailsOfCountryResponse {
    constructor(public taxDetails: TaxDetail[], public countryId: number) {}
}

export interface PlatformFeature {
    featureId: number;
    featureName: string;
    isEnabled: boolean | null;
    isSystemAdminFeature: boolean | null;
    dependentFeatureId: number | null;
}

export class GetAllFeaturesResponse {
    constructor(public features: PlatformFeature[]) {}
}

export class GetCountryByIdResponse {
    constructor(public country: Country) {}
}
