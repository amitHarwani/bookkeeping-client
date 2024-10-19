import {
    Image,
    Pressable,
    StyleSheet,
    Text,
    ToastAndroid,
    View,
} from "react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Href, router, useLocalSearchParams, useNavigation } from "expo-router";
import { useAppSelector } from "@/store";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ReactQueryKeys } from "@/constants/reactquerykeys";
import billing_service from "@/services/billing/billing_service";
import {
    capitalizeText,
    convertUTCStringToTimezonedDate,
    getApiErrorMessage,
} from "@/utils/common_utils";
import { i18n, queryClient } from "@/app/_layout";
import LoadingSpinnerOverlay from "@/components/custom/basic/LoadingSpinnerOverlay";
import CustomNavHeader from "@/components/custom/business/CustomNavHeader";
import { isFeatureAccessible } from "@/utils/feature_access_helper";
import { PLATFORM_FEATURES } from "@/constants/features";
import EditIcon from "@/assets/images/edit_icon.png";
import { commonStyles } from "@/utils/common_styles";
import { PurchaseInvoiceForm, PurchaseInvoiceItem } from "@/constants/types";
import moment from "moment";
import AddUpdatePurchaseInvoice from "@/components/custom/widgets/AddUpdatePurchaseInvoice";
import {
    PurchaseItem,
    TaxDetailsOfThirdPartyType,
} from "@/services/billing/billing_types";
import { dateTimeFormat24hr } from "@/constants/datetimes";
import HeaderMoreOptions, {
    HeaderOptionType,
} from "@/components/custom/basic/HeaderMoreOptions";
import { AppRoutes } from "@/constants/routes";

const GetPurchase = () => {
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

    /* Purchase ID from params */
    const purchaseId = useMemo(() => {
        return Number(params.purchaseId);
    }, []);

    /* edit enabled state */
    const [isEditEnabled, setIsEditEnabled] = useState(false);

    /* Toggle Edit */
    const toggleEdit = useCallback(() => {
        setIsEditEnabled((prev) => !prev);
    }, [isEditEnabled]);

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

    /* To fetch party details */
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

    /* Mutation To Update Purchase Details */
    const updatePurchaseMutation = useMutation({
        mutationFn: (values: PurchaseInvoiceForm) =>
            billing_service.updatePurchase(
                purchaseDetails?.data.purchase.purchaseId as number,
                purchaseDetails?.data.purchaseItems as PurchaseItem[],
                values,
                selectedCompany?.companyId as number,
                companyState.country?.timezone as string,
                selectedCompany?.decimalRoundTo as number,
                Number(purchaseDetails?.data?.purchase?.amountPaid) || 0
            ),
    });

    /* Header Toolbar Options */
    const moreHeaderOptions = useMemo(() => {
        const extraOptions: Array<HeaderOptionType> = [];
        if (isFeatureAccessible(PLATFORM_FEATURES.GET_PURCHASE_RETURNS)) {
            extraOptions.push({
                optionId: 1,
                optionLabel: i18n.t("getPurchaseReturns"),
            });
        }
        if (isFeatureAccessible(PLATFORM_FEATURES.ADD_PURCHASE_RETURN)) {
            extraOptions.push({
                optionId: 2,
                optionLabel: i18n.t("addPurchaseReturn"),
            });
        }
        return extraOptions;
    }, []);

    /* On click of toolbar in header */
    const moreHeaderOptionHandler = (optionId: number) => {
        switch (optionId) {
            case 1:
                router.push(
                    `${AppRoutes.getReturnsOfPurchase}/${purchaseId}` as Href
                );
                return;
            case 2: {
                router.push(
                    `${AppRoutes.addPurchaseReturn}/${purchaseId}` as Href
                );
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
                        purchaseDetails
                            ? purchaseDetails?.data?.purchase?.invoiceNumber?.toString()
                            : i18n.t("purchase")
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
                            PLATFORM_FEATURES.ADD_UPDATE_PURCHASE
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
                    {moreHeaderOptions?.length ? (
                        <HeaderMoreOptions
                            options={moreHeaderOptions}
                            onOptionClick={moreHeaderOptionHandler}
                        />
                    ) : (
                        <></>
                    )}
                </View>
            ),
        });
    }, [navigation, purchaseDetails, isEditEnabled, moreHeaderOptions]);

    /* Invoice form values from purchase and party details fetched */
    const invoiceFormValues: PurchaseInvoiceForm | undefined = useMemo(() => {
        /* If purchase and party details are fetched */
        if (
            purchaseDetails &&
            purchaseDetails.success &&
            partyDetails &&
            partyDetails.success
        ) {
            /* Purchase Data */
            const purchaseData = purchaseDetails.data.purchase;

            /* Purchase Items */
            const purchaseItems = purchaseDetails.data.purchaseItems;

            /* Party */
            const partyInfo = partyDetails.data.party;

            /* PurchaseInvoiceItem */
            let itemsFormData: { [itemId: number]: PurchaseInvoiceItem } = {};

            /* For each purchase item */
            purchaseItems.forEach((item) => {
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
                    units: Number(item.unitsPurchased),
                    subtotal: item.subtotal,
                    tax: item.tax,
                    totalAfterTax: item.totalAfterTax,
                    taxPercent: Number(item.taxPercent),
                };
            });

            const values: PurchaseInvoiceForm = {
                createdAt: convertUTCStringToTimezonedDate(
                    purchaseData.createdAt,
                    dateTimeFormat24hr,
                    timezone as string
                ),
                invoiceNumber: purchaseData.invoiceNumber,
                party: {
                    partyId: partyInfo.partyId,
                    partyName: partyInfo.partyName,
                    defaultPurchaseCreditAllowanceInDays:
                        partyInfo.defaultPurchaseCreditAllowanceInDays,
                    defaultSaleCreditAllowanceInDays:
                        partyInfo.defaultSaleCreditAllowanceInDays,
                    updatedAt: partyInfo.updatedAt,
                    taxDetails:
                        partyInfo.taxDetails as Array<TaxDetailsOfThirdPartyType> | null,
                    countryId: partyInfo.countryId,
                },
                amountDue: Number(purchaseData.amountDue),
                amountPaid: Number(purchaseData.amountPaid),
                discount: purchaseData.discount,
                subtotal: purchaseData.subtotal,
                tax: purchaseData.tax,
                taxPercent: Number(purchaseData.taxPercent),
                taxName: purchaseData.taxName,
                totalAfterDiscount: purchaseData.totalAfterDiscount,
                totalAfterTax: purchaseData.totalAfterTax,
                paymentCompletionDate: purchaseData.paymentCompletionDate
                    ? convertUTCStringToTimezonedDate(
                          purchaseData.paymentCompletionDate,
                          dateTimeFormat24hr,
                          timezone as string
                      )
                    : null,
                paymentDueDate: purchaseData.paymentDueDate
                    ? convertUTCStringToTimezonedDate(
                          purchaseData.paymentDueDate,
                          dateTimeFormat24hr,
                          timezone as string
                      )
                    : null,
                isFullyPaid: purchaseData.isFullyPaid,
                isCredit: purchaseData.isCredit,
                receiptNumber: purchaseData.receiptNumber,
                items: itemsFormData,
            };
            return values;
        }
        return undefined;
    }, [purchaseDetails, partyDetails]);

    /* Fetch party details once purchaseDetails are fetched */
    useEffect(() => {
        if (purchaseDetails && purchaseDetails.success && !partyDetails) {
            fetchPartyDetails();
        }
    }, [purchaseDetails]);

    /* If update is successful, fetchPurchaseDetails again, and toggle edit */
    useEffect(() => {
        if (
            updatePurchaseMutation.isSuccess &&
            updatePurchaseMutation.data.success
        ) {
            ToastAndroid.show(
                capitalizeText(i18n.t("purchaseUpdatedSuccessfully")),
                ToastAndroid.LONG
            );
            fetchPurchaseDetails();
            toggleEdit();
        }
    }, [updatePurchaseMutation.isSuccess]);

    /* Loading spinner visibility */
    const showLoadingSpinner = useMemo(() => {
        return fetchingPurchaseDetails ||
            fetchingPartyDetails ||
            updatePurchaseMutation.isPending
            ? true
            : false;
    }, [
        fetchingPurchaseDetails,
        fetchingPartyDetails,
        updatePurchaseMutation.isPending,
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

    return (
        <>
            {showLoadingSpinner && <LoadingSpinnerOverlay />}
            {invoiceFormValues && (
                <AddUpdatePurchaseInvoice
                    operation="UPDATE"
                    formValues={invoiceFormValues}
                    isUpdateEnabled={isEditEnabled}
                    apiErrorMessage={
                        updatePurchaseMutation.error
                            ? getApiErrorMessage(updatePurchaseMutation.error)
                            : null
                    }
                    onAddUpdatePurchase={(values) =>
                        updatePurchaseMutation.mutate(values)
                    }
                />
            )}
        </>
    );
};

export default GetPurchase;

const styles = StyleSheet.create({
    headerRightContainer: {
        flexDirection: "row",
        columnGap: 16,
    },
});
