import { i18n } from "@/app/_layout";
import LoadingSpinnerOverlay from "@/components/custom/basic/LoadingSpinnerOverlay";
import CustomNavHeader from "@/components/custom/business/CustomNavHeader";
import AddUpdatePurchaseReturn from "@/components/custom/widgets/AddUpdatePurchaseReturn";
import { dateTimeFormat24hr } from "@/constants/datetimes";
import { ReactQueryKeys } from "@/constants/reactquerykeys";
import {
    PurchaseReturnForm,
    ReturnItemType
} from "@/constants/types";
import { useRefreshOnFocus } from "@/hooks/useRefreshOnFocus";
import billing_service from "@/services/billing/billing_service";
import { useAppSelector } from "@/store";
import {
    capitalizeText,
    convertUTCStringToTimezonedDate,
} from "@/utils/common_utils";
import { useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import React, { useEffect, useMemo } from "react";
import { StyleSheet, ToastAndroid } from "react-native";

const GetPurchaseReturn = () => {
    /* Company State */
    const companyState = useAppSelector((state) => state.company);

    const timezone = useMemo(() => {
        return companyState.country?.timezone as string;
    }, [companyState]);

    /* Selected company */
    const selectedCompany = useAppSelector(
        (state) => state.company.selectedCompany
    );

    const navigation = useNavigation();
    const params = useLocalSearchParams();

    /* Purchase Return ID from params */
    const purchaseReturnId = useMemo(() => {
        return Number(params.purchaseReturnId);
    }, [params]);

    /* Fetching Purchase Return Details */
    const {
        isFetching: fetchingPurchaseReturnDetails,
        data: purchaseReturnDetails,
        error: errorFetchingPurchaseReturnDetails,
        refetch: fetchPurchaseReturnDetails,
    } = useQuery({
        queryKey: [
            ReactQueryKeys.getPurchaseReturn,
            purchaseReturnId,
            selectedCompany?.companyId,
        ],
        queryFn: () =>
            billing_service.getPurchaseReturn(
                selectedCompany?.companyId as number,
                purchaseReturnId
            ),
    });

    /* Refresh on focus */
    useRefreshOnFocus(fetchPurchaseReturnDetails);

    /* Setting the header for the page */
    useEffect(() => {
        navigation.setOptions({
            headerTitle: () => (
                <CustomNavHeader
                    mainHeading={
                        purchaseReturnDetails
                            ? purchaseReturnDetails?.data?.purchaseReturn?.purchaseReturnNumber?.toString()
                            : i18n.t("purchaseReturn")
                    }
                    subHeading={selectedCompany?.companyName || ""}
                />
            ),
        });
    }, [navigation, purchaseReturnDetails]);

    /* Purchase return form value */
    const purchaseReturnFormValues: PurchaseReturnForm | undefined =
        useMemo(() => {
            /* If purchase return details are fetched*/
            if (purchaseReturnDetails && purchaseReturnDetails.success) {
                /* Overall purchase return details */
                const purchaseReturnInfo =
                    purchaseReturnDetails.data.purchaseReturn;

                /* Forming Return Item Type Object */
                const purchaseReturnItemsObj: {
                    [itemId: number]: ReturnItemType;
                } = {};
                purchaseReturnDetails.data.purchaseReturnItems.forEach(
                    (returnItem) => {
                        purchaseReturnItemsObj[returnItem.itemId] = {
                            item: {
                                itemId: returnItem.itemId,
                                itemName: returnItem.itemName,
                                unitId: returnItem.unitId,
                                unitName: returnItem.unitName,
                            },
                            pricePerUnit: Number(returnItem.pricePerUnit),
                            unitsReturned: Number(returnItem.unitsPurchased),
                            unitsSoldOrPurchased: 0, // As no edit is available, (This field is unknown)
                            subtotal: returnItem.subtotal,
                            tax: returnItem.tax,
                            taxPercent: Number(returnItem.taxPercent),
                            totalAfterTax: returnItem.totalAfterTax,
                        };
                    }
                );

                /* Purchase Return Form */
                const values: PurchaseReturnForm = {
                    autogeneratePurchaseReturnNumber: false,
                    createdAt: convertUTCStringToTimezonedDate(
                        purchaseReturnInfo.createdAt,
                        dateTimeFormat24hr,
                        timezone
                    ),
                    purchaseReturnNumber:
                        purchaseReturnInfo.purchaseReturnNumber,
                    subtotal: purchaseReturnInfo.subtotal,
                    tax: purchaseReturnInfo.tax,
                    taxName: purchaseReturnInfo.taxName,
                    taxPercent: Number(purchaseReturnInfo.taxPercent),
                    totalAfterTax: purchaseReturnInfo.totalAfterTax,
                    items: purchaseReturnItemsObj,
                };

                return values;
            }
            return undefined;
        }, [purchaseReturnDetails]);

    /* Loading spinner visibility */
    const showLoadingSpinner = useMemo(() => {
        return fetchingPurchaseReturnDetails ? true : false;
    }, [fetchingPurchaseReturnDetails]);

    /* Error fetching purchase return details */
    useEffect(() => {
        let message;
        if (errorFetchingPurchaseReturnDetails) {
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
    }, [errorFetchingPurchaseReturnDetails]);

    return (
        <>
            {showLoadingSpinner && <LoadingSpinnerOverlay />}
            {!showLoadingSpinner && purchaseReturnFormValues && (
                <AddUpdatePurchaseReturn
                    operation="GET"
                    onAddUpdatePurchaseReturn={() => {}}
                    formValues={purchaseReturnFormValues}
                />
            )}
        </>
    );
};

export default GetPurchaseReturn;

const styles = StyleSheet.create({
    headerRightContainer: {
        flexDirection: "row",
        columnGap: 16,
    },
});
