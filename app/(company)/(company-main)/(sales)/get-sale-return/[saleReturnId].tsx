import { i18n } from "@/app/_layout";
import PrintIcon from "@/assets/images/print_icon.png";
import ShareIcon from "@/assets/images/share_icon.png";
import LoadingSpinnerOverlay from "@/components/custom/basic/LoadingSpinnerOverlay";
import CustomNavHeader from "@/components/custom/business/CustomNavHeader";
import AddUpdateSaleReturn from "@/components/custom/widgets/AddUpdateSaleReturn";
import PrintPaper from "@/components/custom/widgets/PrintPaper";
import { dateTimeFormat24hr } from "@/constants/datetimes";
import { ReactQueryKeys } from "@/constants/reactquerykeys";
import { ReturnItemType, SaleReturnForm } from "@/constants/types";
import { useRefreshOnFocus } from "@/hooks/useRefreshOnFocus";
import billing_service from "@/services/billing/billing_service";
import { GetSaleReturnResponse, Sale } from "@/services/billing/billing_types";
import { Country } from "@/services/sysadmin/sysadmin_types";
import { CompanyWithTaxDetails } from "@/services/user/user_types";
import { useAppSelector } from "@/store";
import { commonStyles } from "@/utils/common_styles";
import {
    capitalizeText,
    convertUTCStringToTimezonedDate,
} from "@/utils/common_utils";
import { getSaleReturnHTML } from "@/utils/print_templates";
import { useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Image, Pressable, StyleSheet, ToastAndroid, View } from "react-native";

const GetSaleReturn = () => {
    /* Username */
    const username = useAppSelector((state) => state.auth.user?.fullName);

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

    /* Sale Return ID from params */
    const saleReturnId = useMemo(() => {
        return Number(params.saleReturnId);
    }, [params]);

    /* Print State */
    const [printState, setPrintState] = useState({
        enabled: false,
        isShareMode: false,
    });

    /* Fetching Sale Return Details */
    const {
        isFetching: fetchingSaleReturnDetails,
        data: saleReturnDetails,
        error: errorFetchingSaleReturnDetails,
        refetch: fetchSaleReturnDetails,
    } = useQuery({
        queryKey: [
            ReactQueryKeys.getSaleReturn,
            saleReturnId,
            selectedCompany?.companyId,
        ],
        queryFn: () =>
            billing_service.getSaleReturn(
                selectedCompany?.companyId as number,
                saleReturnId
            ),
    });

    /* Fetching Sale Details */
    const {
        isFetching: fetchingSaleDetails,
        data: saleDetails,
        error: errorFetchingSaleDetails,
        refetch: fetchSaleDetails,
    } = useQuery({
        queryKey: [
            ReactQueryKeys.getSale,
            saleReturnDetails?.data.saleReturn.saleId,
            selectedCompany?.companyId,
        ],
        queryFn: () =>
            billing_service.getSale(
                saleReturnDetails?.data.saleReturn.saleId as number,
                selectedCompany?.companyId as number
            ),
        enabled: false,
    });


    /* To fetch party details */
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

    /* Fetching sale details after fetching sale return details */
    useEffect(() => {
        if (saleReturnDetails && saleReturnDetails.success && !saleDetails) {
            fetchSaleDetails();
        }
    }, [saleReturnDetails]);

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

    /* Refresh on focus */
    useRefreshOnFocus(fetchSaleReturnDetails);

    /* Setting the header for the page */
    useEffect(() => {
        navigation.setOptions({
            headerTitle: () => (
                <CustomNavHeader
                    mainHeading={
                        saleReturnDetails
                            ? saleReturnDetails?.data?.saleReturn?.saleReturnNumber?.toString()
                            : i18n.t("saleReturn")
                    }
                    subHeading={selectedCompany?.companyName || ""}
                />
            ),
            headerRight: () => (
                <View style={styles.headerRightContainer}>
                    {
                        /* Only if API calls are not in progress, show print icon */
                        !fetchingSaleReturnDetails &&
                            !fetchingPartyDetails &&
                            !fetchingSaleDetails && (
                                <>
                                    <Pressable
                                        onPress={() =>
                                            setPrintState({
                                                enabled: true,
                                                isShareMode: false,
                                            })
                                        }
                                    >
                                        <Image
                                            source={PrintIcon}
                                            style={commonStyles.printIcon}
                                            resizeMode="contain"
                                        />
                                    </Pressable>
                                    <Pressable
                                        onPress={() =>
                                            setPrintState({
                                                enabled: true,
                                                isShareMode: true,
                                            })
                                        }
                                    >
                                        <Image
                                            source={ShareIcon}
                                            style={commonStyles.shareIcon}
                                            resizeMode="contain"
                                        />
                                    </Pressable>
                                </>
                            )
                    }
                </View>
            ),
        });
    }, [
        navigation,
        saleReturnDetails,
        fetchingSaleReturnDetails,
        fetchingSaleDetails,
        fetchingPartyDetails,
    ]);

    /* Sale return form value */
    const saleReturnFormValues: SaleReturnForm | undefined = useMemo(() => {
        /* If sale return details are fetched*/
        if (saleReturnDetails && saleReturnDetails.success) {
            /* Overall sale return details */
            const saleReturnInfo = saleReturnDetails.data.saleReturn;

            /* Forming Return Item Type Object */
            const saleReturnItemsObj: { [itemId: number]: ReturnItemType } = {};
            saleReturnDetails.data.saleReturnItems.forEach((returnItem) => {
                saleReturnItemsObj[returnItem.itemId] = {
                    item: {
                        itemId: returnItem.itemId,
                        itemName: returnItem.itemName,
                        unitId: returnItem.unitId,
                        unitName: returnItem.unitName,
                    },
                    pricePerUnit: Number(returnItem.pricePerUnit),
                    unitsReturned: Number(returnItem.unitsSold),
                    unitsSoldOrPurchased: 0, // As no edit is available, (This field is unknown)
                    subtotal: returnItem.subtotal,
                    tax: returnItem.tax,
                    taxPercent: Number(returnItem.taxPercent),
                    totalAfterTax: returnItem.totalAfterTax,
                };
            });

            /* Sale Return Form */
            const values: SaleReturnForm = {
                autogenerateSaleReturnNumber: false,
                createdAt: convertUTCStringToTimezonedDate(
                    saleReturnInfo.createdAt,
                    dateTimeFormat24hr,
                    timezone
                ),
                saleReturnNumber: saleReturnInfo.saleReturnNumber,
                subtotal: saleReturnInfo.subtotal,
                tax: saleReturnInfo.tax,
                taxName: saleReturnInfo.taxName,
                taxPercent: Number(saleReturnInfo.taxPercent),
                totalAfterTax: saleReturnInfo.totalAfterTax,
                items: saleReturnItemsObj,
            };

            return values;
        }
        return undefined;
    }, [saleReturnDetails]);

    /* Loading spinner visibility */
    const showLoadingSpinner = useMemo(() => {
        return fetchingSaleReturnDetails ||
            fetchingSaleDetails ||
            fetchingPartyDetails
            ? true
            : false;
    }, [fetchingSaleReturnDetails, fetchingSaleDetails, fetchingPartyDetails]);

    /* Error fetching sale return details */
    useEffect(() => {
        let message;
        if (
            errorFetchingSaleReturnDetails ||
            errorFetchingPartyDetails ||
            errorFetchingSaleDetails
        ) {
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
    }, [
        errorFetchingSaleReturnDetails,
        errorFetchingPartyDetails,
        errorFetchingSaleDetails,
    ]);

    return (
        <>
            {showLoadingSpinner && <LoadingSpinnerOverlay />}
            {!showLoadingSpinner && saleReturnFormValues && (
                <AddUpdateSaleReturn
                    operation="GET"
                    onAddUpdateSaleReturn={() => {}}
                    formValues={saleReturnFormValues}
                />
            )}
            {printState.enabled && (
                <PrintPaper
                    html={getSaleReturnHTML(
                        saleReturnDetails?.data as GetSaleReturnResponse,
                        saleDetails?.data.sale as Sale,
                        companyState.selectedCompany as CompanyWithTaxDetails,
                        companyState.country as Country,
                        username as string,
                        partyDetails?.data
                    )}
                    togglePrintModal={() =>
                        setPrintState({ enabled: false, isShareMode: false })
                    }
                    isShareMode={printState.isShareMode}
                    fileName={`creditnote_${saleReturnDetails?.data.saleReturn.saleReturnNumber}`}

                />
            )}
        </>
    );
};

export default GetSaleReturn;

const styles = StyleSheet.create({
    headerRightContainer: {
        flexDirection: "row",
        columnGap: 16,
    },
});
