import {
    Image,
    Pressable,
    StyleSheet,
    Text,
    ToastAndroid,
    View,
} from "react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { useAppSelector } from "@/store";
import { useQuery } from "@tanstack/react-query";
import { ReactQueryKeys } from "@/constants/reactquerykeys";
import billing_service from "@/services/billing/billing_service";
import { capitalizeText } from "@/utils/common_utils";
import { i18n } from "@/app/_layout";
import LoadingSpinnerOverlay from "@/components/custom/basic/LoadingSpinnerOverlay";
import CustomNavHeader from "@/components/custom/business/CustomNavHeader";
import { isFeatureAccessible } from "@/utils/feature_access_helper";
import { PLATFORM_FEATURES } from "@/constants/features";
import EditIcon from "@/assets/images/edit_icon.png";
import { commonStyles } from "@/utils/common_styles";
import { PurchaseInvoiceForm, PurchaseInvoiceItem } from "@/constants/types";
import moment from "moment";
import AddUpdatePurchaseInvoice from "@/components/custom/widgets/AddUpdatePurchaseInvoice";

const GetPurchase = () => {
    const selectedCompany = useAppSelector(
        (state) => state.company.selectedCompany
    );

    const navigation = useNavigation();
    const params = useLocalSearchParams();

    const purchaseId = useMemo(() => {
        return Number(params.purchaseId);
    }, []);

    const [isEditEnabled, setIsEditEnabled] = useState(false);

    const toggleEdit = useCallback(() => {
        setIsEditEnabled((prev) => !prev);
    }, [isEditEnabled]);

    const {
        isFetching: fetchingPurchaseDetails,
        data: purchaseDetails,
        error: errorFetchingPurchaseDetails,
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
            headerRight: () =>
                /* If edit is not enabled and the update feature is accessible */
                !isEditEnabled &&
                isFeatureAccessible(PLATFORM_FEATURES.ADD_UPDATE_PURCHASE) ? (
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
    }, [navigation, purchaseDetails, isEditEnabled]);

    const invoiceFormValues: PurchaseInvoiceForm | undefined = useMemo(() => {
        if (
            purchaseDetails &&
            purchaseDetails.success &&
            partyDetails &&
            partyDetails.success
        ) {
            const purchaseData = purchaseDetails.data.purchase;
            const purchaseItems = purchaseDetails.data.purchaseItems;
            const partyInfo = partyDetails.data.party;

            let itemsFormData: { [itemId: number]: PurchaseInvoiceItem } = {};
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
                };
            });

            return {
                invoiceNumber: purchaseData.invoiceNumber,
                party: {
                    partyId: partyInfo.partyId,
                    partyName: partyInfo.partyName,
                    defaultPurchaseCreditAllowanceInDays:
                        partyInfo.defaultPurchaseCreditAllowanceInDays,
                    updatedAt: partyInfo.updatedAt,
                },
                amountDue: Number(purchaseData.amountDue),
                amountPaid: Number(purchaseData.amountPaid),
                discount: purchaseData.discount,
                subtotal: purchaseData.subtotal,
                tax: purchaseData.tax,
                totalAfterDiscount: purchaseData.totalAfterDiscount,
                totalAfterTax: purchaseData.totalAfterTax,
                paymentCompletionDate: purchaseData.paymentCompletionDate
                    ? moment(purchaseData.paymentCompletionDate).toDate()
                    : null,
                paymentDueDate: purchaseData.paymentDueDate
                    ? moment(purchaseData.paymentDueDate).toDate()
                    : null,
                isFullyPaid: purchaseData.isFullyPaid,
                isCredit: purchaseData.isCredit,
                receiptNumber: purchaseData.receiptNumber,
                items: itemsFormData,
            };
        }
        return undefined;
    }, [purchaseDetails, partyDetails]);

    useEffect(() => {
        if (purchaseDetails && purchaseDetails.success && !partyDetails) {
            fetchPartyDetails();
        }
    }, [purchaseDetails]);

    const showLoadingSpinner = useMemo(() => {
        return fetchingPurchaseDetails || fetchingPartyDetails ? true : false;
    }, [fetchingPurchaseDetails, fetchingPartyDetails]);

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
                />
            )}
        </>
    );
};

export default GetPurchase;

const styles = StyleSheet.create({});
