export interface Country {
    countryId: number;
    countryName: string;
    phoneNumberCodes: string[] | null;
    currency: string;
    maxPhoneNumberDigits: number;
}
export class GetAllCountriesResponse {
    constructor(public countries: Country[]) {}
}
