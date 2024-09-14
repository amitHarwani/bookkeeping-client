import { i18n } from "@/app/_layout";
import EditIcon from "@/assets/images/edit_icon.png";
import LoadingSpinnerOverlay from "@/components/custom/basic/LoadingSpinnerOverlay";
import CustomNavHeader from "@/components/custom/business/CustomNavHeader";
import AddUpdateSaleInvoice from "@/components/custom/widgets/AddUpdateSaleInvoice";
import { dateTimeFormat24hr } from "@/constants/datetimes";
import { PLATFORM_FEATURES } from "@/constants/features";
import { ReactQueryKeys } from "@/constants/reactquerykeys";
import {
    SaleInvoiceForm,
    SaleInvoiceItem
} from "@/constants/types";
import billing_service from "@/services/billing/billing_service";
import { SaleItem } from "@/services/billing/billing_types";
import { useAppSelector } from "@/store";
import { commonStyles } from "@/utils/common_styles";
import {
    capitalizeText,
    convertUTCStringToTimezonedDate,
    getApiErrorMessage,
} from "@/utils/common_utils";
import { isFeatureAccessible } from "@/utils/feature_access_helper";
import { useMutation, useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    Image,
    Pressable,
    StyleSheet,
    ToastAndroid
} from "react-native";

const GetSale = () => {
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
            headerRight: () =>
                /* If edit is not enabled and the update feature is accessible */
                !isEditEnabled &&
                isFeatureAccessible(PLATFORM_FEATURES.ADD_UPDATE_SALE) ? (
                    <Pressable onPress={toggleEdit}>
                        <Image
                            source={EditIcon}
                            style={commonStyles.editIcon}
                            resizeMode="contain"
                        />
                    </Pressable>
                ) : (
                    <></>
                ),
        });
    }, [navigation, saleDetails, isEditEnabled]);

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
        </>
    );
};

export default GetSale;

const styles = StyleSheet.create({});
