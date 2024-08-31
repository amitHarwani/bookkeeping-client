import store from "@/store";

export const getInvoiceTaxDetails = () => {
    const state = store.getState();

    /* Company Details */
    const selectedCompany = state.company.selectedCompany;

    /* Taxes of the country where the company belongs to */
    const taxDetailsOfCountry = state.company.taxDetailsOfCountry;

    /* To store total tax percent and tax name of taxes applied on each invoice */
    let invoiceTaxPercent = 0;
    let invoiceTaxName = "";

    if (selectedCompany?.taxDetails) {
        /* For each of companies tax registrations */
        for (let companyTaxRegistration of selectedCompany?.taxDetails) {

            /* Tax detail */
            const taxDetail = taxDetailsOfCountry?.[companyTaxRegistration?.taxId];

            /* If the tax is on invoice */
            if(taxDetail?.isTaxOnInvoice){
                /* Add tax percent and tax name */
                invoiceTaxPercent += Number(taxDetail.taxPercentage);
                invoiceTaxName += ` ${taxDetail.taxNickname}`;
            }
        }
    }
    return {invoiceTaxPercent, invoiceTaxName}
};
