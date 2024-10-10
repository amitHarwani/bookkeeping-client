import store from "@/store";

export const getTaxIDForRegistrationNumberOnInvoice = (countryId: number) => {
    switch(countryId){
        case 1: return 1
    }
    return null;
}
export const getTaxHeading = (countryId: number) => {
    switch(countryId){
        case 1: return "TRN"
    }
    return ""
}

export const getInvoiceTaxDetails = () => {
    const state = store.getState();

    /* Company Details */
    const selectedCompany = state.company.selectedCompany;

    /* Taxes of the country where the company belongs to */
    const taxDetailsOfCountry = state.company.taxDetailsOfCountry;

    /* To store total tax percent and tax name of taxes applied on each invoice */
    let invoiceTaxPercent = 0;
    let invoiceTaxName = "";

    /* Getting the tax id of the tax whose registration number must be displayed on invoice */
    const taxIdOfTaxRegNumberDispayedOnInvoice = getTaxIDForRegistrationNumberOnInvoice(selectedCompany?.companyId as number);
    let companyTaxNumber = "";

    if (selectedCompany?.taxDetails) {
        /* For each of companies tax registrations */
        for (let companyTaxRegistration of selectedCompany?.taxDetails) {

            /* Tax detail */
            const taxDetail = taxDetailsOfCountry?.[companyTaxRegistration?.taxId];

            /* If the tax is on invoice */
            if(taxDetail?.isTaxOnInvoice){
                if(!companyTaxNumber && taxIdOfTaxRegNumberDispayedOnInvoice == taxDetail.taxId){
                    companyTaxNumber = companyTaxRegistration.registrationNumber;
                }
                /* Add tax percent and tax name */
                invoiceTaxPercent += Number(taxDetail.taxPercentage);
                invoiceTaxName += ` ${taxDetail.taxNickname}`;
            }
        }
    }
    return {invoiceTaxPercent, invoiceTaxName, companyTaxNumber}
};
