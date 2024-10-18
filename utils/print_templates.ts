import {
    GetPartyResponse,
    GetQuotationResponse,
    GetSaleResponse,
    GetSaleReturnResponse,
    Quotation,
    QuotationItem,
    Sale,
    SaleItem,
    SaleReturn,
    SaleReturnItem,
} from "@/services/billing/billing_types";
import { Country } from "@/services/sysadmin/sysadmin_types";
import { CompanyWithTaxDetails } from "@/services/user/user_types";
import { getTaxHeading } from "./tax_helper";
import {
    capitalizeText,
    convertUTCStringToTimezonedDate,
} from "./common_utils";
import {
    dateTimeFormat24hr,
    displayedDateTimeFormat,
} from "@/constants/datetimes";
import moment from "moment";

const linksAndStyles = `
    <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link
            href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
            rel="stylesheet"
        />
    
        <style>
            /* CSS Reset */
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
                font-family: "Inter", sans-serif;
                font-optical-sizing: auto;
                font-weight: 400;
                font-style: normal;
            }
    
            /* Apply border-box universally */
            html {
                box-sizing: border-box;
            }
    
            *,
            *::before,
            *::after {
                box-sizing: inherit;
            }
            table {
                border-collapse: collapse;
                margin-bottom: 20px;
            }
            thead {
                background-color: black;
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
            }
            th {
                text-align: left;
                padding: 4px;
                font-size: 14px;
            }
            td {
                padding: 4px;
                font-size: 14px;
            }
            .font-weight-600 {
                font-weight: 600;
            }
            .font-weight-700 {
                font-weight: 700;
            }
            .font-size-38 {
                font-size: 38px;
            }
            .font-size-12 {
                font-size: 12px;
            }
            .font-size-14 {
                font-size: 14px;
            }
            .font-size-16 {
                font-size: 16px;
            }
        </style>
`;

const getCompanyDetails = (
    companyName: string,
    countryName: string,
    countryId: number,
    companyTaxNumber?: string
) => {
    return `<div style="display: flex; flex-direction: column; row-gap: 2px">
                    <p class="font-size-14 font-weight-600">${companyName}</p>
                    <p class="font-size-14">${capitalizeText(countryName)}</p>
                    ${
                        companyTaxNumber
                            ? `<p class="font-size-14">${getTaxHeading(countryId)} ${companyTaxNumber || ""}</p>`
                            : ""
                    }
                </div>`;
};

const getPartyDetails = (
    countryId: number,
    salutation: string,
    partyName?: string,
    partyTaxNumber?: string
) => {
    return `
     <div style="display: flex; flex-direction: column; row-gap: 2px">
                    <p class="font-size-14">${salutation} ${partyName || "Open"}</p>
                    ${
                        partyTaxNumber
                            ? `
                            <p class="font-size-14">${getTaxHeading(countryId)} ${partyTaxNumber}</p>`
                            : ""
                    }
                   
                </div>`;
};

const getCreatedAtTime = (
    createdAt: string,
    timezone: string,
    isQuotation: boolean
) => {
    return `
      <div style="display: flex; row-gap: 2px">
        <p class="font-size-14">${isQuotation ? `Quotation` : `Invoice`} Date: 
        ${moment(convertUTCStringToTimezonedDate(createdAt, dateTimeFormat24hr, timezone)).format(displayedDateTimeFormat)}
        </p>
      </div>
                `;
};

const getItemsData = (
    taxName: string,
    taxPercent: string,
    items: Array<SaleItem> | Array<QuotationItem> | Array<SaleReturnItem>,
    decimalPoints: number
) => {
    let tempTaxTotal = 0;
    let tempSubTotal = 0;
    return `<table style="width: 100%">
                    <thead>
                        <tr style="color: white;">
                            <th>#</th>
                            <th>Item Name</th>
                            <th>Quantity</th>
                            <th>Rate</th>
                            <th>${taxName.toUpperCase()} (${taxPercent}%)</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${items.map((item, index) => {
                            tempTaxTotal += Number(item.tax);
                            tempSubTotal += Number(item.totalAfterTax);
                            return `
                                <tr>
                                    <td>${index + 1}</td>
                                    <td>${item.itemName}</td>
                                    <td>${item.unitsSold} ${item.unitName}</td>
                                    <td>${item.pricePerUnit}</td>
                                    <td>${Number(item.tax).toFixed(decimalPoints)}</td>
                                    <td>${Number(item.totalAfterTax).toFixed(decimalPoints)}</td>
                                </tr>
                                `;
                        })}
                        <tr
                            style="
                                padding-top: 20px;
                            "
                        >
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                        </tr>

                        <tr
                            style="
                                border: 1px solid black;
                                border-left: none;
                                border-right: none;
                            "
                        >
                            <td></td>
                            <td></td>
                            <td></td>
                            <td class="font-weight-700">Total</td>
                            <td>${tempTaxTotal.toFixed(decimalPoints)}</td>
                            <td>${tempSubTotal.toFixed(decimalPoints)}</td>
                        </tr>
                    </tbody>
                </table>`;
};

const getAggregatedTotals = (currency: string, details: Sale | Quotation | SaleReturn) => {
    return `
            <div
                style="
                    display: flex;
                    margin-top: 20px;
                    column-gap: 30px;
                    width: fit-content;
                    margin-left: auto;
                    margin-right: 12px;
                "
            >
                <div style="display: flex; flex-direction: column; row-gap: 6px">
                    <p class="font-size-14 font-weight-700">Subtotal</p>
                    ${
                        "discount" in details && `<p class="font-size-14 font-weight-700">Discount</p>`
                    }
                    ${
                        "totalAfterDiscount" in details && `<p class="font-size-14 font-weight-700">Total After Discount</p>`
                    }
                    <p class="font-size-14 font-weight-700">${details.taxName.toUpperCase()} (${details.taxPercent}%)
                    </p>
                    <p class="font-size-14 font-weight-700">Total</p>
                    ${
                        "amountPaid" in details || "amountDue" in details
                            ? `
                         <p class="font-size-14 font-weight-700">Received</p>
                         <p class="font-size-14 font-weight-700">Balance</p>
                        `
                            : ``
                    }
                   
                </div>
                <div style="display: flex; flex-direction: column; row-gap: 6px">
                    <p class="font-size-14">${currency} ${Number(details.subtotal).toFixed(2)}</p>
                    ${
                        "discount" in details &&
                        `<p class="font-size-14">${currency} ${details.discount}</p>`
                    }
                    ${
                        "totalAfterDiscount" in details &&
                        `<p class="font-size-14">${currency} ${Number(details.totalAfterDiscount).toFixed(2)}</p>`
                    }
                    <p class="font-size-14">${currency} ${Number(details.tax).toFixed(2)}</p>
                    <p class="font-size-14">${currency} ${Number(details.totalAfterTax).toFixed(2)}</p>
                    ${
                        "amountPaid" in details
                            ? `<p class="font-size-14">${currency} ${Number(details.amountPaid).toFixed(2)}</p>`
                            : ``
                    }
                    ${
                        "amountDue" in details
                            ? `<p class="font-size-14">${currency} ${Number(details.amountDue).toFixed(2)}</p>`
                            : ``
                    }
                </div>
            </div>
    `;
};

const getAuthorizedSignatory = (username: string) => {
    return `
     <div
        style="
            margin-top: 80px;
            max-width: 250px;
            margin-left: auto;
            margin-right: 12px;
            display: flex;
            flex-direction: column;
            align-items: center;
            row-gap: 8px;
        ">
            <div
                style="
                    border-bottom: 1px solid black;
                    width: 250px;
                    text-align: center;
                ">
                <p class="font-size-14">${username}</p>
            </div>
                <p class="font-size-12">Authorized Signatory</p>
    </div>
    `;
};

export const getSaleInvoiceHTML = (
    saleDetails: GetSaleResponse,
    companyDetails: CompanyWithTaxDetails,
    countryDetails: Country,
    username: string,
    partyDetails?: GetPartyResponse
) => {
    /* Decimal points to round to */
    const decimalPoints = companyDetails.decimalRoundTo;

    return `<!DOCTYPE html>
    <html lang="en">
        ${linksAndStyles}
        <body style="padding: 16px">
            <div style="display: flex; justify-content: space-between">
                ${getCompanyDetails(
                    companyDetails.companyName,
                    countryDetails.countryName,
                    countryDetails.countryId,
                    saleDetails?.sale?.companyTaxNumber
                )}
    
                <div style="display: flex; flex-direction: column">
                    <p style="text-transform: uppercase" class="font-size-38">
                        TAX INVOICE
                    </p>
                    <p class="font-size-14 font-weight-600">Invoice Number: ${
                        saleDetails.sale.invoiceNumber
                    }</p>
                </div>
            </div>
    
            <div
                style="
                    display: flex;
                    justify-content: space-between;
                    margin-top: 40px;
                "
            >
                ${getPartyDetails(
                    partyDetails?.party.countryId as number,
                    "Bill To:",
                    partyDetails?.party?.partyName,
                    saleDetails.sale.partyTaxNumber
                )}
    
                ${getCreatedAtTime(
                    saleDetails.sale.createdAt,
                    countryDetails.timezone,
                    false
                )}
            </div>
    
            <div style="margin-top: 40px">  
                ${getItemsData(
                    saleDetails.sale.taxName,
                    saleDetails?.sale?.taxPercent,
                    saleDetails.saleItems,
                    decimalPoints
                )}
            </div>
    
            ${getAggregatedTotals(countryDetails.currency, saleDetails.sale)}
            ${getAuthorizedSignatory(username)}
        </body>
    </html>`;
};

export const getQuotationHTML = (
    quotationDetails: GetQuotationResponse,
    companyDetails: CompanyWithTaxDetails,
    countryDetails: Country,
    username: string,
    partyDetails: GetPartyResponse
) => {
    /* Decimal points to round to */
    const decimalPoints = companyDetails.decimalRoundTo;

    return `<!DOCTYPE html>
    <html lang="en">
        ${linksAndStyles}
        <body style="padding: 16px">
            <div style="display: flex; justify-content: space-between">

                ${getCompanyDetails(
                    companyDetails.companyName,
                    countryDetails.countryName,
                    countryDetails.countryId,
                    quotationDetails.quotation.companyTaxNumber
                )}
    
                <div style="display: flex; flex-direction: column">
                    <p style="text-transform: uppercase" class="font-size-38">
                        QUOTATION
                    </p>
                    <p class="font-size-14 font-weight-600">Quotation Number: ${
                        quotationDetails.quotation.quotationNumber
                    }</p>
                </div>
            </div>
    
            <div
                style="
                    display: flex;
                    justify-content: space-between;
                    margin-top: 40px;
                "
            >
                ${getPartyDetails(
                    partyDetails.party.countryId,
                    "Quotation To",
                    partyDetails.party.partyName,
                    quotationDetails.quotation.partyTaxNumber
                )}
    
                ${getCreatedAtTime(
                    quotationDetails.quotation.createdAt,
                    countryDetails.timezone,
                    true
                )}
            </div>
    
            <div style="margin-top: 40px">  
                ${getItemsData(
                    quotationDetails.quotation.taxName,
                    quotationDetails.quotation.taxPercent,
                    quotationDetails.quotationItems,
                    decimalPoints
                )}
            </div>
    
            ${getAggregatedTotals(
                countryDetails.currency,
                quotationDetails.quotation
            )}
            ${getAuthorizedSignatory(username)}
        </body>
    </html>`;
};

export const getSaleReturnHTML = (
    saleReturnDetails: GetSaleReturnResponse,
    sale: Sale,
    companyDetails: CompanyWithTaxDetails,
    countryDetails: Country,
    username: string,
    partyDetails?: GetPartyResponse
) => {
    /* Decimal points to round to */
    const decimalPoints = companyDetails.decimalRoundTo;

    return `<!DOCTYPE html>
    <html lang="en">
        ${linksAndStyles}
        <body style="padding: 16px">
            <div style="display: flex; justify-content: space-between">
                ${getCompanyDetails(
                    companyDetails.companyName,
                    countryDetails.countryName,
                    countryDetails.countryId,
                    sale?.companyTaxNumber
                )}
    
                <div style="display: flex; flex-direction: column">
                    <p style="text-transform: uppercase" class="font-size-38">
                        CREDIT NOTE
                    </p>
                    <p class="font-size-14 font-weight-600">Credit Note Number: ${saleReturnDetails.saleReturn.saleReturnNumber}</p>
                </div>
            </div>
    
            <div
                style="
                    display: flex;
                    justify-content: space-between;
                    margin-top: 40px;
                "
            >
                ${getPartyDetails(
                    partyDetails?.party.countryId as number,
                    "Note To",
                    partyDetails?.party?.partyName,
                    sale.partyTaxNumber
                )}
    
                ${getCreatedAtTime(
                    saleReturnDetails.saleReturn.createdAt,
                    countryDetails.timezone,
                    false
                )}
            </div>
    
            <div style="margin-top: 40px">  
                ${getItemsData(
                    saleReturnDetails.saleReturn.taxName,
                    saleReturnDetails?.saleReturn?.taxPercent,
                    saleReturnDetails.saleReturnItems,
                    decimalPoints
                )}
            </div>
    
            ${getAggregatedTotals(countryDetails.currency, saleReturnDetails.saleReturn)}
            ${getAuthorizedSignatory(username)}
        </body>
    </html>`;
};
