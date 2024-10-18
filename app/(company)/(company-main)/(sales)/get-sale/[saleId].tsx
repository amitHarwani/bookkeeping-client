import { i18n } from "@/app/_layout";
import EditIcon from "@/assets/images/edit_icon.png";
import LoadingSpinnerOverlay from "@/components/custom/basic/LoadingSpinnerOverlay";
import CustomNavHeader from "@/components/custom/business/CustomNavHeader";
import AddUpdateSaleInvoice from "@/components/custom/widgets/AddUpdateSaleInvoice";
import { dateTimeFormat24hr } from "@/constants/datetimes";
import { PLATFORM_FEATURES } from "@/constants/features";
import { ReactQueryKeys } from "@/constants/reactquerykeys";
import { SaleInvoiceForm, SaleInvoiceItem } from "@/constants/types";
import billing_service from "@/services/billing/billing_service";
import {
    GetSaleResponse,
    SaleItem,
    TaxDetailsOfThirdPartyType,
} from "@/services/billing/billing_types";
import { useAppSelector } from "@/store";
import { commonStyles } from "@/utils/common_styles";
import {
    capitalizeText,
    convertUTCStringToTimezonedDate,
    getApiErrorMessage,
} from "@/utils/common_utils";
import { isFeatureAccessible } from "@/utils/feature_access_helper";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Href, router, useLocalSearchParams, useNavigation } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    Image,
    Pressable,
    Share,
    StyleSheet,
    Text,
    ToastAndroid,
    View,
} from "react-native";
import PrintIcon from "@/assets/images/print_icon.png";
import ShareIcon from "@/assets/images/share_icon.png";
import PrintPaper from "@/components/custom/widgets/PrintPaper";
import { getSaleInvoiceHTML } from "@/utils/print_templates";
import { CompanyWithTaxDetails } from "@/services/user/user_types";
import { Country } from "@/services/sysadmin/sysadmin_types";
import { AppRoutes } from "@/constants/routes";
import HeaderMoreOptions, {
    HeaderOptionType,
} from "@/components/custom/basic/HeaderMoreOptions";
import { useRefreshOnFocus } from "@/hooks/useRefreshOnFocus";

const GetSale = () => {
    /* Username */
    const username = useAppSelector((state) => state.auth.user?.fullName);

    /* Company State */
    const companyState = useAppSelector((state) => state.company);

    const timezone = useMemo(() => {
        return companyState.country?.timezone;
    }, [companyState]);

    /* Selected company */
    const selectedCompany = useAppSelector(
        (state) => state.company.selectedCompany
    );

    const navigation = useNavigation();
    const params = useLocalSearchParams();

    /* Sale ID from params */
    const saleId = useMemo(() => {
        return Number(params.saleId);
    }, []);

    /* edit enabled state */
    const [isEditEnabled, setIsEditEnabled] = useState(false);

    /* Toggle Edit */
    const toggleEdit = useCallback(() => {
        setIsEditEnabled((prev) => !prev);
    }, [isEditEnabled]);

    /* Print State */
    const [printState, setPrintState] = useState({
        enabled: false,
        isShareMode: false,
    });

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

    /* Refresh on focus */
    useRefreshOnFocus(fetchSaleDetails);

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

    /* Mutation To Update Sale Details */
    const updateSaleMutation = useMutation({
        mutationFn: (values: SaleInvoiceForm) =>
            billing_service.updateSale(
                saleDetails?.data.sale.saleId as number,
                saleDetails?.data.saleItems as SaleItem[],
                values,
                selectedCompany?.companyId as number,
                companyState.country?.timezone as string,
                selectedCompany?.decimalRoundTo as number,
                Number(saleDetails?.data?.sale?.amountPaid) || 0
            ),
    });

    /* Header Toolbar Options */
    const moreHeaderOptions = useMemo(() => {
        const extraOptions: Array<HeaderOptionType> = [];
        if (isFeatureAccessible(PLATFORM_FEATURES.GET_SALE_RETURNS)) {
            extraOptions.push({
                optionId: 1,
                optionLabel: i18n.t("getSaleReturns"),
            });
        }
        if (isFeatureAccessible(PLATFORM_FEATURES.ADD_SALE_RETURN)) {
            extraOptions.push({
                optionId: 2,
                optionLabel: i18n.t("addSaleReturn"),
            });
        }
        return extraOptions;
    }, []);

    /* On click of toolbar in header */
    const moreHeaderOptionHandler = (optionId: number) => {
        switch (optionId) {
            case 1:
                return;
            case 2: {
                router.push(`${AppRoutes.addSaleReturn}/${saleId}` as Href);
                return;
            }
        }
    };

    /* Setting the header for the page */
    useEffect(() => {
        navigation.setOptions({
            headerTitle: () => (
                <CustomNavHeader
                    mainHeading={
                        saleDetails
                            ? saleDetails?.data?.sale?.invoiceNumber?.toString()
                            : i18n.t("sale")
                    }
                    subHeading={selectedCompany?.companyName || ""}
                />
            ),
            headerRight: () => (
                <View style={styles.headerRightContainer}>
                    {
                        /* If edit is not enabled and the update feature is accessible */
                        !isEditEnabled &&
                        isFeatureAccessible(
                            PLATFORM_FEATURES.ADD_UPDATE_SALE
                        ) ? (
                            <Pressable onPress={toggleEdit}>
                                <Image
                                    source={EditIcon}
                                    style={commonStyles.editIcon}
                                    resizeMode="contain"
                                />
                            </Pressable>
                        ) : (
                            <></>
                        )
                    }
                    {
                        /* Only if API calls are not in progress, and edit is not enabled, show print icon */
                        !fetchingSaleDetails &&
                            !fetchingPartyDetails &&
                            !updateSaleMutation.isPending &&
                            !isEditEnabled && (
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
                                    {moreHeaderOptions?.length ? (
                                        <HeaderMoreOptions
                                            options={moreHeaderOptions}
                                            onOptionClick={
                                                moreHeaderOptionHandler
                                            }
                                        />
                                    ) : <></>}
                                </>
                            )
                    }
                </View>
            ),
        });
    }, [
        navigation,
        saleDetails,
        partyDetails,
        fetchingSaleDetails,
        fetchingPartyDetails,
        updateSaleMutation.isPending,
        isEditEnabled,
        moreHeaderOptions,
    ]);

    /* Invoice form values from sale and party details fetched */
    const invoiceFormValues: SaleInvoiceForm | undefined = useMemo(() => {
        /* If sale and party details are fetched or it is a no party bill */
        if (
            saleDetails &&
            saleDetails.success &&
            ((partyDetails && partyDetails.success) ||
                saleDetails.data.sale.isNoPartyBill)
        ) {
            /* Sale Data */
            const saleData = saleDetails.data.sale;

            /* Sale Items */
            const saleItems = saleDetails.data.saleItems;

            /* Party */
            const partyInfo = partyDetails?.data.party;

            /* SaleInvoiceItem */
            let itemsFormData: { [itemId: number]: SaleInvoiceItem } = {};

            /* For each sale item */
            saleItems.forEach((item) => {
                const itemId = item.itemId;
                itemsFormData[itemId] = {
                    item: {
                        itemId: item.itemId,
                        itemName: item.itemName,
                        unitId: item.unitId,
                        unitName: item.unitName,
                        updatedAt: new Date(),
                    },
                    pricePerUnit: Number(item.pricePerUnit),
                    units: Number(item.unitsSold),
                    subtotal: item.subtotal,
                    tax: item.tax,
                    totalAfterTax: item.totalAfterTax,
                    taxPercent: Number(item.taxPercent),
                };
            });

            return {
                createdAt: convertUTCStringToTimezonedDate(
                    saleData.createdAt,
                    dateTimeFormat24hr,
                    timezone as string
                ),
                autogenerateInvoice: false,
                quotationNumber: null,
                doneBy: saleData.doneBy,
                invoiceNumber: saleData.invoiceNumber,
                isNoPartyBill: saleData.isNoPartyBill,
                party: saleData.isNoPartyBill
                    ? null
                    : {
                          partyId: partyInfo?.partyId as number,
                          partyName: partyInfo?.partyName as string,
                          defaultPurchaseCreditAllowanceInDays:
                              partyInfo?.defaultPurchaseCreditAllowanceInDays as number,
                          defaultSaleCreditAllowanceInDays:
                              partyInfo?.defaultSaleCreditAllowanceInDays as number,
                          updatedAt: partyInfo?.updatedAt as Date,
                          countryId: partyInfo?.countryId as number,
                          taxDetails:
                              partyInfo?.taxDetails as Array<TaxDetailsOfThirdPartyType> | null,
                      },
                amountDue: Number(saleData.amountDue),
                amountPaid: Number(saleData.amountPaid),
                discount: saleData.discount,
                subtotal: saleData.subtotal,
                tax: saleData.tax,
                taxPercent: Number(saleData.taxPercent),
                taxName: saleData.taxName,
                totalAfterDiscount: saleData.totalAfterDiscount,
                totalAfterTax: saleData.totalAfterTax,
                paymentCompletionDate: saleData.paymentCompletionDate
                    ? convertUTCStringToTimezonedDate(
                          saleData.paymentCompletionDate,
                          dateTimeFormat24hr,
                          timezone as string
                      )
                    : null,
                paymentDueDate: saleData.paymentDueDate
                    ? convertUTCStringToTimezonedDate(
                          saleData.paymentDueDate,
                          dateTimeFormat24hr,
                          timezone as string
                      )
                    : null,
                isFullyPaid: saleData.isFullyPaid,
                isCredit: saleData.isCredit,
                companyTaxNumber: saleData.companyTaxNumber,
                partyTaxNumber: saleData.partyTaxNumber,
                items: itemsFormData,
            };
        }
        return undefined;
    }, [saleDetails, partyDetails]);

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

    /* If update is successful, fetchSaleDetails again, and toggle edit */
    useEffect(() => {
        if (updateSaleMutation.isSuccess && updateSaleMutation.data.success) {
            ToastAndroid.show(
                capitalizeText(i18n.t("saleUpdatedSuccessfully")),
                ToastAndroid.LONG
            );
            fetchSaleDetails();
            toggleEdit();
        }
    }, [updateSaleMutation.isSuccess]);

    /* Loading spinner visibility */
    const showLoadingSpinner = useMemo(() => {
        return fetchingSaleDetails ||
            fetchingPartyDetails ||
            updateSaleMutation.isPending
            ? true
            : false;
    }, [
        fetchingSaleDetails,
        fetchingPartyDetails,
        updateSaleMutation.isPending,
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

    return (
        <>
            {showLoadingSpinner && <LoadingSpinnerOverlay />}
            {invoiceFormValues && (
                <AddUpdateSaleInvoice
                    operation="UPDATE"
                    formValues={invoiceFormValues}
                    isUpdateEnabled={isEditEnabled}
                    apiErrorMessage={
                        updateSaleMutation.error
                            ? getApiErrorMessage(updateSaleMutation.error)
                            : null
                    }
                    onAddUpdateSale={(values) =>
                        updateSaleMutation.mutate(values)
                    }
                />
            )}
            {printState.enabled && (
                <PrintPaper
                    html={getSaleInvoiceHTML(
                        saleDetails?.data as GetSaleResponse,
                        companyState?.selectedCompany as CompanyWithTaxDetails,
                        companyState.country as Country,
                        username as string,
                        partyDetails?.data
                    )}
                    togglePrintModal={() =>
                        setPrintState({ enabled: false, isShareMode: false })
                    }
                    isShareMode={printState.isShareMode}
                />
            )}
        </>
    );
};

export default GetSale;

const styles = StyleSheet.create({
    headerRightContainer: {
        flexDirection: "row",
        columnGap: 16,
    },
});
