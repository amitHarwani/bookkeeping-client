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

export interface FilterPartiesQuery {
    isActive?: boolean;
    partyNameSearchQuery?: string;
}

export interface TaxDetailsOfThirdPartyType {
    taxId: number,
    registrationNumber: string
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

export class AddPartyResponse {
    constructor(
        public party: ThirdParty,
        public message: string
    ){}
}


export class GetPartyResponse {
    constructor(
        public party: ThirdParty
    ){

    }
}

export class UpdatePartyResponse {
    constructor(
        public party: ThirdParty,
        public message: string
    ){}
}