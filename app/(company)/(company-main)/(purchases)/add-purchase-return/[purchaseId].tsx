import { i18n } from "@/app/_layout";
import LoadingSpinnerOverlay from "@/components/custom/basic/LoadingSpinnerOverlay";
import AddUpdatePurchaseReturn from "@/components/custom/widgets/AddUpdatePurchaseReturn";
import { dateTimeFormat24hr } from "@/constants/datetimes";
import { ReactQueryKeys } from "@/constants/reactquerykeys";
import {
    PurchaseInvoiceForm,
    PurchaseInvoiceItem,
    PurchaseReturnForm
} from "@/constants/types";
import billing_service from "@/services/billing/billing_service";
import {
    PurchaseItem,
    TaxDetailsOfThirdPartyType
} from "@/services/billing/billing_types";
import { useAppSelector } from "@/store";
import {
    capitalizeText,
    convertUTCStringToTimezonedDate,
} from "@/utils/common_utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo } from "react";
import { StyleSheet, ToastAndroid } from "react-native";

const AddPurchaseReturn = () => {
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

    /* Purchase ID from params */
    const purchaseId = useMemo(() => {
        return Number(params.purchaseId);
    }, []);

    /* Fetching Purchase Details */
    const {
        isFetching: fetchingPurchaseDetails,
        data: purchaseDetails,
        error: errorFetchingPurchaseDetails,
        refetch: fetchPurchaseDetails,
    } = useQuery({
        queryKey: [
            ReactQueryKeys.getPurchase,
            purchaseId,
            selectedCompany?.companyId,
        ],
        queryFn: () =>
            billing_service.getPurchase(
                purchaseId,
                selectedCompany?.companyId as number
            ),
    });

    /* To fetch party details for the party from whom items were purchased */
    const {
        isFetching: fetchingPartyDetails,
        data: partyDetails,
        error: errorFetchingPartyDetails,
        refetch: fetchPartyDetails,
    } = useQuery({
        queryKey: [
            ReactQueryKeys.getParty,
            purchaseDetails?.data.purchase.partyId,
        ],
        queryFn: () =>
            billing_service.getParty(
                purchaseDetails?.data.purchase.partyId as number,
                selectedCompany?.companyId as number
            ),
        enabled: false,
    });

    /* Update Purchase Mutation */
    const updatePurchaseMutation = useMutation({
        mutationFn: (values: PurchaseInvoiceForm) =>
            billing_service.updatePurchase(
                purchaseId,
                purchaseDetails?.data.purchaseItems as PurchaseItem[],
                values,
                companyId,
                timezone,
                decimalPoints,
                Number(purchaseDetails?.data.purchase.amountPaid)
            ),
    });

    /* Purchase Return mutation */
    const addPurchaseReturnMutation = useMutation({
        mutationFn: (values: PurchaseReturnForm) =>
            billing_service.addPurchaseReturn(
                purchaseId,
                companyId,
                decimalPoints,
                values,
                timezone
            ),
    });

    /* Fetch party details once purchaseDetails are fetched */
    useEffect(() => {
        if (purchaseDetails && purchaseDetails.success && !partyDetails) {
            fetchPartyDetails();
        }
    }, [purchaseDetails]);

    /* Formatting the purchase items to an object where purchase id is the key and value is Purchase Item type */
    const purchaseItemsFormatted = useMemo(() => {
        if (purchaseDetails?.data) {
            const purchaseItemsData: { [itemId: number]: PurchaseItem } = {};
            purchaseDetails?.data.purchaseItems.forEach((item) => {
                purchaseItemsData[item.itemId] = item;
            });
            return purchaseItemsData;
        }
        return null;
    }, [purchaseDetails]);

    /* On Add Update Purchase Return */
    const onAddUpdatePurchaseReturn = (values: PurchaseReturnForm) => {
        /* Original Purchase */
        const originalPurchase = { ...purchaseDetails?.data.purchase };

        /* Updated Subtotal: Original subtotal - returned subtotal */
        const updatedSubtotal =
            Number(originalPurchase.subtotal) - Number(values.subtotal);

        /* update discount to 0 */
        const updatedDiscount = 0;

        /* Total After Discount: New Subtotal - New Discount */
        const updatedTotalAfterDiscount = updatedSubtotal - updatedDiscount;

        /* Tax on new total after discount */
        const updatedTax =
            updatedTotalAfterDiscount *
            (Number(originalPurchase.taxPercent) / 100);

        /* Updated total after tax */
        const updatedTotalAfterTax = updatedTotalAfterDiscount + updatedTax;

        /* Amount Paid before purchase return */
        const originalAmountPaid = Number(originalPurchase.amountPaid);

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

        /* Updating the purchase items */
        const updatedPurchaseItems: { [itemId: number]: PurchaseInvoiceItem } =
            {};

        /* For all the purchase items */
        purchaseDetails?.data.purchaseItems.forEach((purchaseItem) => {
            /* If the purchase item has been returned */
            if (values.items?.[purchaseItem.itemId]) {
                /* Return details */
                const returnedPurchaseItem = values.items[purchaseItem.itemId];

                /* If all units have not been returned*/
                if (
                    Number(returnedPurchaseItem.unitsReturned) !=
                    Number(purchaseItem.unitsPurchased)
                ) {
                    /* Updated Units Purchased = Original Units Purchased - Units Returned */
                    const updatedUnitsPurchasedForItem =
                        Number(purchaseItem.unitsPurchased) -
                        Number(returnedPurchaseItem.unitsReturned);

                    /* Updated Subtotal */
                    const updatedSubtotalForItem =
                        Number(purchaseItem.pricePerUnit) *
                        updatedUnitsPurchasedForItem;

                    /* Updated Tax */
                    const updatedTaxForItem =
                        updatedSubtotalForItem *
                        (Number(purchaseItem.taxPercent) / 100);

                    /* Updated Total After Tax */
                    const updatedTotalAfterTaxForItem =
                        updatedSubtotalForItem + updatedTaxForItem;

                    /* Adding to updatedPurchaseItems object */
                    updatedPurchaseItems[purchaseItem.itemId] = {
                        item: {
                            itemId: purchaseItem.itemId,
                            itemName: purchaseItem.itemName,
                            unitId: purchaseItem.unitId,
                            unitName: purchaseItem.unitName,
                            updatedAt: purchaseItem.updatedAt,
                        },
                        pricePerUnit: Number(purchaseItem.pricePerUnit),
                        units: updatedUnitsPurchasedForItem,
                        subtotal: updatedSubtotalForItem.toFixed(decimalPoints),
                        tax: updatedTaxForItem.toFixed(decimalPoints),
                        taxPercent: Number(purchaseItem.taxPercent),
                        totalAfterTax:
                            updatedTotalAfterTaxForItem.toFixed(decimalPoints),
                    };
                }
            } else {
                /* Else keep the item as it is */
                updatedPurchaseItems[purchaseItem.itemId] = {
                    item: {
                        itemId: purchaseItem.itemId,
                        itemName: purchaseItem.itemName,
                        unitId: purchaseItem.unitId,
                        unitName: purchaseItem.unitName,
                        updatedAt: purchaseItem.updatedAt,
                    },
                    pricePerUnit: Number(purchaseItem.pricePerUnit),
                    subtotal: purchaseItem.subtotal,
                    tax: purchaseItem.tax,
                    taxPercent: Number(purchaseItem.taxPercent),
                    totalAfterTax: purchaseItem.totalAfterTax,
                    units: Number(purchaseItem.unitsPurchased),
                };
            }
        });

        /* Party Details */
        const partyInfo = partyDetails?.data?.party;

        /* Purchase Invoice Form for updating purchase */
        const updatedPurchaseInvoiceForm: PurchaseInvoiceForm = {
            amountDue: updatedAmountDue,
            amountPaid: updatedAmountPaid,
            createdAt: convertUTCStringToTimezonedDate(
                originalPurchase.createdAt as string,
                dateTimeFormat24hr,
                timezone
            ),
            invoiceNumber: originalPurchase.invoiceNumber as number,
            isCredit: originalPurchase.isCredit as boolean,
            isFullyPaid: updatedIsFullyPaid,
            party: {
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
            items: updatedPurchaseItems,
            paymentDueDate: updatedIsFullyPaid
                ? null
                : convertUTCStringToTimezonedDate(
                      originalPurchase.paymentDueDate as string,
                      dateTimeFormat24hr,
                      timezone
                  ),
            receiptNumber: originalPurchase.receiptNumber || null,
            paymentCompletionDate: null,
            taxName: originalPurchase.taxName as string,
            taxPercent: Number(originalPurchase.taxPercent),
            subtotal: updatedSubtotal.toFixed(decimalPoints),
            discount: updatedDiscount.toString(),
            totalAfterDiscount:
                updatedTotalAfterDiscount.toFixed(decimalPoints),
            tax: updatedTax.toFixed(decimalPoints),
            totalAfterTax: updatedTotalAfterTax.toFixed(decimalPoints),
        };

        /* Updating purchase and adding purchase return */
        updatePurchaseMutation.mutate(updatedPurchaseInvoiceForm);
        addPurchaseReturnMutation.mutate(values);
    };

    /* Loading spinner visibility */
    const showLoadingSpinner = useMemo(() => {
        return fetchingPurchaseDetails ||
            fetchingPartyDetails ||
            updatePurchaseMutation.isPending ||
            addPurchaseReturnMutation.isPending
            ? true
            : false;
    }, [
        fetchingPurchaseDetails,
        fetchingPartyDetails,
        updatePurchaseMutation.isPending,
        addPurchaseReturnMutation.isPending,
    ]);

    /* Error fetching purchase or party details */
    useEffect(() => {
        let message;
        if (errorFetchingPurchaseDetails || errorFetchingPartyDetails) {
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
    }, [errorFetchingPurchaseDetails, errorFetchingPartyDetails]);

    /* Error updating */
    useEffect(() => {
        let message;
        if (updatePurchaseMutation.error || addPurchaseReturnMutation.error) {
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
    }, [updatePurchaseMutation.error, addPurchaseReturnMutation.error]);

    /* On purchase return complete */
    useEffect(() => {
        if (
            updatePurchaseMutation.isSuccess &&
            addPurchaseReturnMutation.isSuccess
        ) {
            ToastAndroid.show(
                capitalizeText(
                    `${i18n.t("purchaseReturnRecordedSuccessfully")}`
                ),
                ToastAndroid.LONG
            );
            router.back();
        }
    }, [updatePurchaseMutation.isSuccess, addPurchaseReturnMutation.isSuccess]);

    return (
        <>
            {showLoadingSpinner && <LoadingSpinnerOverlay />}

            {purchaseDetails && (
                <AddUpdatePurchaseReturn
                    operation="ADD"
                    onAddUpdatePurchaseReturn={onAddUpdatePurchaseReturn}
                    purchase={purchaseDetails.data.purchase}
                    purchaseItems={
                        purchaseItemsFormatted as {
                            [itemId: number]: PurchaseItem;
                        }
                    }
                />
            )}
        </>
    );
};

export default AddPurchaseReturn;

const styles = StyleSheet.create({
    headerRightContainer: {
        flexDirection: "row",
        columnGap: 16,
    },
});
