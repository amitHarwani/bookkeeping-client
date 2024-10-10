import {
    GetPartyResponse,
    GetQuotationResponse,
    GetSaleResponse,
} from "@/services/billing/billing_types";
import { Country } from "@/services/sysadmin/sysadmin_types";
import { CompanyWithTaxDetails } from "@/services/user/user_types";
import { getTaxHeading } from "./tax_helper";
import { capitalizeText, convertUTCStringToTimezonedDate } from "./common_utils";
import {
    dateTimeFormat24hr,
    displayedDateTimeFormat,
} from "@/constants/datetimes";
import moment from "moment";

export const getSaleInvoiceHTML = (
    saleDetails: GetSaleResponse,
    companyDetails: CompanyWithTaxDetails,
    countryDetails: Country,
    username: string,
    partyDetails?: GetPartyResponse
) => {
    /* Decimal points to round to */
    const decimalPoints = companyDetails.decimalRoundTo;

    /* Computing totals before discount is applied */
    let tempTaxTotal = 0;
    let tempSubTotal = 0;

    return `<!DOCTYPE html>
    <html lang="en">
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
        <body style="padding: 16px">
            <div style="display: flex; justify-content: space-between">
                <div style="display: flex; flex-direction: column; row-gap: 2px">
                    <p class="font-size-14 font-weight-600">${
                        companyDetails.companyName
                    }</p>
                    <p class="font-size-14">${capitalizeText(countryDetails.countryName)}</p>
                    ${
                        saleDetails?.sale?.companyTaxNumber
                            ? `<p class="font-size-14">${getTaxHeading(
                                  countryDetails.countryId
                              )} ${
                                  saleDetails?.sale?.companyTaxNumber || ""
                              }</p>`
                            : ""
                    }
                </div>
    
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
                <div style="display: flex; flex-direction: column; row-gap: 2px">
                    <p class="font-size-14">Bill To: ${
                        partyDetails?.party?.partyName || "Open"
                    }</p>
                    ${
                        partyDetails?.party &&
                        !saleDetails?.sale?.isNoPartyBill &&
                        saleDetails?.sale?.partyTaxNumber
                            ? `
                            <p class="font-size-14">${getTaxHeading(
                                partyDetails.party.countryId
                            )} ${saleDetails.sale.partyTaxNumber}</p>`
                            : ""
                    }
                   
                </div>
    
                <div style="display: flex; row-gap: 2px">
                    <p class="font-size-14">Invoice Date: ${moment(
                        convertUTCStringToTimezonedDate(
                            saleDetails.sale.createdAt,
                            dateTimeFormat24hr,
                            countryDetails.timezone
                        )
                    ).format(displayedDateTimeFormat)}</p>
                </div>
            </div>
    
            <div style="margin-top: 40px">  
                <table style="width: 100%">
                    <thead>
                        <tr style="color: white;">
                            <th>#</th>
                            <th>Item Name</th>
                            <th>Quantity</th>
                            <th>Rate</th>
                            <th>${saleDetails.sale.taxName.toUpperCase()} (${
        saleDetails.sale.taxPercent
    }%)</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${saleDetails.saleItems.map((saleItem, index) => {
                            tempTaxTotal += Number(saleItem.tax);
                            tempSubTotal += Number(saleItem.totalAfterTax);
                            return `
                                <tr>
                            <td>${index + 1}</td>
                            <td>${saleItem.itemName}</td>
                            <td>${saleItem.unitsSold} ${saleItem.unitName}</td>
                            <td>${saleItem.pricePerUnit}</td>
                            <td>${Number(saleItem.tax).toFixed(
                                decimalPoints
                            )}</td>
                            <td>${Number(saleItem.totalAfterTax).toFixed(
                                decimalPoints
                            )}</td>
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
                </table>
            </div>
    
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
                    <p class="font-size-14 font-weight-700">Discount</p>
                    <p class="font-size-14 font-weight-700">Total After Discount</p>
                    <p class="font-size-14 font-weight-700">${saleDetails.sale.taxName.toUpperCase()} (${
        saleDetails.sale.taxPercent
    }%)</p>
                    <p class="font-size-14 font-weight-700">Total</p>
                    <p class="font-size-14 font-weight-700">Received</p>
                    <p class="font-size-14 font-weight-700">Balance</p>
                </div>
                <div style="display: flex; flex-direction: column; row-gap: 6px">
                    <p class="font-size-14">${countryDetails.currency} ${Number(
        saleDetails.sale.subtotal
    ).toFixed(2)}</p>
                    <p class="font-size-14">${countryDetails.currency} ${
        saleDetails.sale.discount
    }</p>
                    <p class="font-size-14">${countryDetails.currency} ${Number(
        saleDetails.sale.totalAfterDiscount
    ).toFixed(2)}</p>
                    <p class="font-size-14">${countryDetails.currency} ${Number(
        saleDetails.sale.tax
    ).toFixed(2)}</p>
                    <p class="font-size-14">${countryDetails.currency} ${Number(
        saleDetails.sale.totalAfterTax
    ).toFixed(2)}</p>
                    <p class="font-size-14">${countryDetails.currency} ${Number(
        saleDetails.sale.amountPaid
    ).toFixed(2)}</p>
                    <p class="font-size-14">${countryDetails.currency} ${Number(
        saleDetails.sale.amountDue
    ).toFixed(2)}</p>
                </div>
            </div>
    
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
                "
            >
                <div
                    style="
                        border-bottom: 1px solid black;
                        width: 250px;
                        text-align: center;
                    "
                >
                    <p class="font-size-14">${username}</p>
                </div>
                <p class="font-size-12">Authorized Signatory</p>
            </div>
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

    /* Computing totals before discount is applied */
    let tempTaxTotal = 0;
    let tempSubTotal = 0;

    return `<!DOCTYPE html>
    <html lang="en">
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
        <body style="padding: 16px">
            <div style="display: flex; justify-content: space-between">
                <div style="display: flex; flex-direction: column; row-gap: 2px">
                    <p class="font-size-14 font-weight-600">${
                        companyDetails.companyName
                    }</p>
                    <p class="font-size-14">${companyDetails.companyName}</p>
                    <p class="font-size-14">${countryDetails.countryName}</p>
                    ${
                        quotationDetails?.quotation?.companyTaxNumber
                            ? `<p class="font-size-14">${getTaxHeading(
                                  countryDetails.countryId
                              )} ${
                                  quotationDetails?.quotation
                                      ?.companyTaxNumber || ""
                              }</p>`
                            : ""
                    }
                </div>
    
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
                <div style="display: flex; flex-direction: column; row-gap: 2px">
                    <p class="font-size-14">Bill To: ${
                        partyDetails?.party?.partyName
                    }</p>
                    ${
                        partyDetails?.party &&
                        quotationDetails?.quotation?.partyTaxNumber
                            ? `
                            <p class="font-size-14">${getTaxHeading(
                                partyDetails.party.countryId
                            )} ${quotationDetails.quotation.partyTaxNumber}</p>`
                            : ""
                    }
                   
                </div>
    
                <div style="display: flex; row-gap: 2px">
                    <p class="font-size-14">Quotation Date: ${moment(
                        convertUTCStringToTimezonedDate(
                            quotationDetails.quotation.createdAt,
                            dateTimeFormat24hr,
                            countryDetails.timezone
                        )
                    ).format(displayedDateTimeFormat)}</p>
                </div>
            </div>
    
            <div style="margin-top: 40px">  
                <table style="width: 100%">
                    <thead>
                        <tr style="color: white;">
                            <th>#</th>
                            <th>Item Name</th>
                            <th>Quantity</th>
                            <th>Rate</th>
                            <th>${quotationDetails.quotation.taxName.toUpperCase()} (${
        quotationDetails.quotation.taxPercent
    }%)</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${quotationDetails.quotationItems.map(
                            (quotationItem, index) => {
                                tempTaxTotal += Number(quotationItem.tax);
                                tempSubTotal += Number(
                                    quotationItem.totalAfterTax
                                );
                                return `
                                <tr>
                            <td>${index + 1}</td>
                            <td>${quotationItem.itemName}</td>
                            <td>${quotationItem.unitsSold} ${
                                    quotationItem.unitName
                                }</td>
                            <td>${quotationItem.pricePerUnit}</td>
                            <td>${Number(quotationItem.tax).toFixed(
                                decimalPoints
                            )}</td>
                            <td>${Number(quotationItem.totalAfterTax).toFixed(
                                decimalPoints
                            )}</td>
                        </tr>
                                `;
                            }
                        )}
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
                </table>
            </div>
    
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
                    <p class="font-size-14 font-weight-700">Discount</p>
                    <p class="font-size-14 font-weight-700">Total After Discount</p>
                    <p class="font-size-14 font-weight-700">${quotationDetails.quotation.taxName.toUpperCase()} (${
        quotationDetails.quotation.taxPercent
    }%)</p>
                    <p class="font-size-14 font-weight-700">Total</p>
                </div>
                <div style="display: flex; flex-direction: column; row-gap: 6px">
                    <p class="font-size-14">${countryDetails.currency} ${Number(
        quotationDetails.quotation.subtotal
    ).toFixed(2)}</p>
                    <p class="font-size-14">${countryDetails.currency} ${
        quotationDetails.quotation.discount
    }</p>
                    <p class="font-size-14">${countryDetails.currency} ${Number(
        quotationDetails.quotation.totalAfterDiscount
    ).toFixed(2)}</p>
                    <p class="font-size-14">${countryDetails.currency} ${Number(
        quotationDetails.quotation.tax
    ).toFixed(2)}</p>
                    <p class="font-size-14">${countryDetails.currency} ${Number(
        quotationDetails.quotation.totalAfterTax
    ).toFixed(2)}</p>
                </div>
            </div>
    
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
                "
            >
                <div
                    style="
                        border-bottom: 1px solid black;
                        width: 250px;
                        text-align: center;
                    "
                >
                    <p class="font-size-14">${username}</p>
                </div>
                <p class="font-size-12">Authorized Signatory</p>
            </div>
        </body>
    </html>`;
};
