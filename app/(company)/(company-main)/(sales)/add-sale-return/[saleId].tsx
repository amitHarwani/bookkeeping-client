import { i18n } from "@/app/_layout";
import LoadingSpinnerOverlay from "@/components/custom/basic/LoadingSpinnerOverlay";
import AddUpdateSaleReturn from "@/components/custom/widgets/AddUpdateSaleReturn";
import { dateTimeFormat24hr } from "@/constants/datetimes";
import { ReactQueryKeys } from "@/constants/reactquerykeys";
import { AppRoutes } from "@/constants/routes";
import {
    SaleInvoiceForm,
    SaleInvoiceItem,
    SaleReturnForm,
} from "@/constants/types";
import billing_service from "@/services/billing/billing_service";
import {
    SaleItem,
    TaxDetailsOfThirdPartyType,
} from "@/services/billing/billing_types";
import { useAppSelector } from "@/store";
import {
    capitalizeText,
    convertUTCStringToTimezonedDate,
} from "@/utils/common_utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Href, router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo } from "react";
import { StyleSheet, ToastAndroid } from "react-native";

const AddSaleReturn = () => {
    /* Selected company */
    const selectedCompany = useAppSelector(
        (state) => state.company.selectedCompany
    );

    /* Company ID */
    const companyId = useMemo(
        () => selectedCompany?.companyId as number,
        [selectedCompany]
    );

    /* Company State */
    const companyState = useAppSelector((state) => state.company);

    /* Timezone of country where the company is located */
    const timezone = useMemo(
        () => companyState.country?.timezone as string,
        [companyState]
    );

    /* Decimal Preference */
    const decimalPoints = useMemo(
        () => selectedCompany?.decimalRoundTo || 2,
        []
    );

    /* Params */
    const params = useLocalSearchParams();

    /* Sale ID from params */
    const saleId = useMemo(() => {
        return Number(params.saleId);
    }, []);

    /* Fetching Sale Details */
    const {
        isFetching: fetchingSaleDetails,
        data: saleDetails,
        error: errorFetchingSaleDetails,
        refetch: fetchSaleDetails,
    } = useQuery({
        queryKey: [ReactQueryKeys.getSale, saleId, selectedCompany?.companyId],
        queryFn: () =>
            billing_service.getSale(
                saleId,
                selectedCompany?.companyId as number
            ),
    });

    /* To fetch party details for the party to whom items were sold */
    const {
        isFetching: fetchingPartyDetails,
        data: partyDetails,
        error: errorFetchingPartyDetails,
        refetch: fetchPartyDetails,
    } = useQuery({
        queryKey: [ReactQueryKeys.getParty, saleDetails?.data.sale.partyId],
        queryFn: () =>
            billing_service.getParty(
                saleDetails?.data.sale.partyId as number,
                selectedCompany?.companyId as number
            ),
        enabled: false,
    });

    /* Update Sale Mutation */
    const updateSaleMutation = useMutation({
        mutationFn: (values: SaleInvoiceForm) =>
            billing_service.updateSale(
                saleId,
                saleDetails?.data.saleItems as SaleItem[],
                values,
                companyId,
                timezone,
                decimalPoints,
                Number(saleDetails?.data.sale.amountPaid)
            ),
    });

    /* Sale Return mutation */
    const addSaleReturnMutation = useMutation({
        mutationFn: (values: SaleReturnForm) =>
            billing_service.addSaleReturn(
                saleId,
                companyId,
                decimalPoints,
                values,
                timezone
            ),
    });

    /* Fetch party details once saleDetails are fetched, and this is not a no party bill */
    useEffect(() => {
        if (
            saleDetails &&
            saleDetails.success &&
            !partyDetails &&
            !saleDetails.data.sale.isNoPartyBill
        ) {
            fetchPartyDetails();
        }
    }, [saleDetails]);

    /* Formatting the sale items to an object where sale id is the key and value is Sale Item type */
    const saleItemsFormatted = useMemo(() => {
        if (saleDetails?.data) {
            const saleItemsData: { [itemId: number]: SaleItem } = {};
            saleDetails?.data.saleItems.forEach((item) => {
                saleItemsData[item.itemId] = item;
            });
            return saleItemsData;
        }
        return null;
    }, [saleDetails]);

    /* On Add Update Sale Return */
    const onAddUpdateSaleReturn = (values: SaleReturnForm) => {
        /* Original Sale */
        const originalSale = { ...saleDetails?.data.sale };

        /* Updated Subtotal: Original subtotal - returned subtotal */
        const updatedSubtotal =
            Number(originalSale.subtotal) - Number(values.subtotal);

        /* If new subtotal is 0, or the new subtotal is less than or equal to the discount, update discount to 0 */
        const updatedDiscount =
            updatedSubtotal === 0 ||
            updatedSubtotal <= Number(originalSale.discount)
                ? 0
                : Number(originalSale.discount);

        /* Total After Discount: New Subtotal - New Discount */
        const updatedTotalAfterDiscount = updatedSubtotal - updatedDiscount;

        /* Tax on new total after discount */
        const updatedTax =
            updatedTotalAfterDiscount * (Number(originalSale.taxPercent) / 100);

        /* Updated total after tax */
        const updatedTotalAfterTax = updatedTotalAfterDiscount + updatedTax;

        /* Amount Paid before sale return */
        const originalAmountPaid = Number(originalSale.amountPaid);

        /* If orginal amount paid is greater than updated total after tax, 
        then the entire amount is paid
        */
        const updatedAmountPaid =
            originalAmountPaid > updatedTotalAfterTax
                ? updatedTotalAfterTax
                : originalAmountPaid;

        /* Amount due */
        const updatedAmountDue = updatedTotalAfterTax - updatedAmountPaid;

        /* Fully paid */
        const updatedIsFullyPaid = updatedAmountDue == 0;

        /* Updating the sale items */
        const updatedSaleItems: { [itemId: number]: SaleInvoiceItem } = {};

        /* For all the sale items */
        saleDetails?.data.saleItems.forEach((saleItem) => {
            /* If the sale item has been returned */
            if (values.items?.[saleItem.itemId]) {
                /* Return details */
                const returnedSaleItem = values.items[saleItem.itemId];

                /* If all units have not been returned*/
                if (
                    Number(returnedSaleItem.unitsReturned) !=
                    Number(saleItem.unitsSold)
                ) {
                    /* Updated Units Sold = Original Units Sold - Units Returned */
                    const updatedUnitsSoldForItem =
                        Number(saleItem.unitsSold) -
                        Number(returnedSaleItem.unitsReturned);

                    /* Updated Subtotal */
                    const updatedSubtotalForItem =
                        Number(saleItem.pricePerUnit) * updatedUnitsSoldForItem;

                    /* Updated Tax */
                    const updatedTaxForItem =
                        updatedSubtotalForItem *
                        (Number(saleItem.taxPercent) / 100);

                    /* Updated Total After Tax */
                    const updatedTotalAfterTaxForItem =
                        updatedSubtotalForItem + updatedTaxForItem;

                    /* Adding to updatedSaleItems object */
                    updatedSaleItems[saleItem.itemId] = {
                        item: {
                            itemId: saleItem.itemId,
                            itemName: saleItem.itemName,
                            unitId: saleItem.unitId,
                            unitName: saleItem.unitName,
                            updatedAt: saleItem.updatedAt,
                        },
                        pricePerUnit: Number(saleItem.pricePerUnit),
                        units: updatedUnitsSoldForItem,
                        subtotal: updatedSubtotalForItem.toFixed(decimalPoints),
                        tax: updatedTaxForItem.toFixed(decimalPoints),
                        taxPercent: Number(saleItem.taxPercent),
                        totalAfterTax:
                            updatedTotalAfterTaxForItem.toFixed(decimalPoints),
                    };
                }
            } else {
                /* Else keep the item as it is */
                updatedSaleItems[saleItem.itemId] = {
                    item: {
                        itemId: saleItem.itemId,
                        itemName: saleItem.itemName,
                        unitId: saleItem.unitId,
                        unitName: saleItem.unitName,
                        updatedAt: saleItem.updatedAt,
                    },
                    pricePerUnit: Number(saleItem.pricePerUnit),
                    subtotal: saleItem.subtotal,
                    tax: saleItem.tax,
                    taxPercent: Number(saleItem.taxPercent),
                    totalAfterTax: saleItem.totalAfterTax,
                    units: Number(saleItem.unitsSold),
                };
            }
        });

        /* Party Details */
        const partyInfo = partyDetails?.data?.party;

        /* Sale Invoice Form for updating sale */
        const updatedSaleInvoiceForm: SaleInvoiceForm = {
            amountDue: updatedAmountDue,
            amountPaid: updatedAmountPaid,
            autogenerateInvoice: false,
            quotationNumber: null,
            companyTaxNumber: originalSale.companyTaxNumber as string,
            partyTaxNumber: originalSale.partyTaxNumber as string,
            createdAt: convertUTCStringToTimezonedDate(
                originalSale.createdAt as string,
                dateTimeFormat24hr,
                timezone
            ),
            doneBy: originalSale.doneBy as string,
            invoiceNumber: originalSale.invoiceNumber as number,
            isCredit: originalSale.isCredit as boolean,
            isFullyPaid: updatedIsFullyPaid,
            isNoPartyBill: originalSale.isNoPartyBill as boolean,
            party: originalSale.isNoPartyBill
                ? null
                : {
                      partyId: partyInfo?.partyId as number,
                      partyName: partyInfo?.partyName as string,
                      countryId: partyInfo?.countryId as number,
                      defaultPurchaseCreditAllowanceInDays:
                          partyInfo?.defaultPurchaseCreditAllowanceInDays as number,
                      defaultSaleCreditAllowanceInDays:
                          partyInfo?.defaultSaleCreditAllowanceInDays as number,
                      taxDetails:
                          partyInfo?.taxDetails as Array<TaxDetailsOfThirdPartyType> | null,
                      updatedAt: partyInfo?.updatedAt as Date,
                  },
            items: updatedSaleItems,
            paymentDueDate: updatedIsFullyPaid
                ? null
                : convertUTCStringToTimezonedDate(
                      originalSale.paymentDueDate as string,
                      dateTimeFormat24hr,
                      timezone
                  ),
            paymentCompletionDate: null,
            taxName: originalSale.taxName as string,
            taxPercent: Number(originalSale.taxPercent),
            subtotal: updatedSubtotal.toFixed(decimalPoints),
            discount: updatedDiscount.toString(),
            totalAfterDiscount:
                updatedTotalAfterDiscount.toFixed(decimalPoints),
            tax: updatedTax.toFixed(decimalPoints),
            totalAfterTax: updatedTotalAfterTax.toFixed(decimalPoints),
        };

        /* Updating sale and adding sale return */
        updateSaleMutation.mutate(updatedSaleInvoiceForm);
        addSaleReturnMutation.mutate(values);
    };

    /* Loading spinner visibility */
    const showLoadingSpinner = useMemo(() => {
        return fetchingSaleDetails ||
            fetchingPartyDetails ||
            updateSaleMutation.isPending ||
            addSaleReturnMutation.isPending
            ? true
            : false;
    }, [
        fetchingSaleDetails,
        fetchingPartyDetails,
        updateSaleMutation.isPending,
        addSaleReturnMutation.isPending,
    ]);

    /* Error fetching sale or party details */
    useEffect(() => {
        let message;
        if (errorFetchingSaleDetails || errorFetchingPartyDetails) {
            message = capitalizeText(
                `${i18n.t("errorFetchingDetails")}${i18n.t("comma")}${i18n.t(
                    "contactSupport"
                )}`
            );
        }
        if (message) {
            ToastAndroid.show(message, ToastAndroid.LONG);
            router.back();
        }
    }, [errorFetchingSaleDetails, errorFetchingPartyDetails]);

    /* Error updating */
    useEffect(() => {
        let message;
        if (updateSaleMutation.error || addSaleReturnMutation.error) {
            message = capitalizeText(
                `${i18n.t("errorUpdatingDetails")}${i18n.t("comma")}${i18n.t(
                    "contactSupport"
                )}`
            );
        }
        if (message) {
            ToastAndroid.show(message, ToastAndroid.LONG);
            router.back();
        }
    }, [updateSaleMutation.error, addSaleReturnMutation.error]);

    /* On sale return complete */
    useEffect(() => {
        if (updateSaleMutation.isSuccess && addSaleReturnMutation.isSuccess) {
            ToastAndroid.show(
                capitalizeText(`${i18n.t("saleReturnRecordedSuccessfully")}`),
                ToastAndroid.LONG
            );

            // router.replace(`${AppRoutes.getSaleReturn}/${saleId}` as Href);
        }
    }, [updateSaleMutation.isSuccess, addSaleReturnMutation.isSuccess]);

    return (
        <>
            {showLoadingSpinner && <LoadingSpinnerOverlay />}

            {saleDetails && (
                <AddUpdateSaleReturn
                    operation="ADD"
                    onAddUpdateSaleReturn={onAddUpdateSaleReturn}
                    sale={saleDetails.data.sale}
                    saleItems={
                        saleItemsFormatted as { [itemId: number]: SaleItem }
                    }
                />
            )}
        </>
    );
};

export default AddSaleReturn;

const styles = StyleSheet.create({
    headerRightContainer: {
        flexDirection: "row",
        columnGap: 16,
    },
});
