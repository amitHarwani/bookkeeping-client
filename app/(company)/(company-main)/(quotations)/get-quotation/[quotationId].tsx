import { i18n } from "@/app/_layout";
import EditIcon from "@/assets/images/edit_icon.png";
import LoadingSpinnerOverlay from "@/components/custom/basic/LoadingSpinnerOverlay";
import CustomNavHeader from "@/components/custom/business/CustomNavHeader";
import AddUpdateQuotation from "@/components/custom/widgets/AddUpdateQuotation";
import AddUpdateSaleInvoice from "@/components/custom/widgets/AddUpdateSaleInvoice";
import { dateTimeFormat24hr } from "@/constants/datetimes";
import { PLATFORM_FEATURES } from "@/constants/features";
import { ReactQueryKeys } from "@/constants/reactquerykeys";
import { AppRoutes } from "@/constants/routes";
import {
    QuotationForm,
    SaleInvoiceForm,
    SaleInvoiceItem,
} from "@/constants/types";
import billing_service from "@/services/billing/billing_service";
import {
    GetPartyResponse,
    GetQuotationResponse,
    QuotationItem,
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
    StyleSheet,
    Text,
    ToastAndroid,
    View,
} from "react-native";
import PrintIcon from "@/assets/images/print_icon.png";
import ShareIcon from "@/assets/images/share_icon.png";
import PrintPaper from "@/components/custom/widgets/PrintPaper";
import { getQuotationHTML } from "@/utils/print_templates";
import { CompanyWithTaxDetails } from "@/services/user/user_types";
import { Country } from "@/services/sysadmin/sysadmin_types";

const GetQuotation = () => {
    const authState = useAppSelector((state) => state.auth);
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

    /* Quotation ID from params */
    const quotationId = useMemo(() => {
        return Number(params.quotationId);
    }, []);

    /* edit enabled state */
    const [isEditEnabled, setIsEditEnabled] = useState(false);

    /* is add sale component shown */
    const [isAddSaleVisbile, setIsAddSaleVisible] = useState(false);

    /* Print State */
    const [printState, setPrintState] = useState({
        enabled: false,
        isShareMode: false,
    });

    /* Toggle Edit */
    const toggleEdit = useCallback(() => {
        setIsEditEnabled((prev) => !prev);
    }, [isEditEnabled]);

    /* Toggle add sale screen */
    const toggleAddSaleScreen = useCallback(() => {
        setIsAddSaleVisible((prev) => !prev);
    }, [isAddSaleVisbile]);

    /* Fetching Quotation Details */
    const {
        isFetching: fetchingQuotationDetails,
        data: quotationDetails,
        error: errorFetchingQuotationDetails,
        refetch: fetchQuotationDetails,
    } = useQuery({
        queryKey: [
            ReactQueryKeys.getQuotation,
            quotationId,
            selectedCompany?.companyId,
        ],
        queryFn: () =>
            billing_service.getQuotation(
                quotationId,
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
            quotationDetails?.data.quotation.partyId,
        ],
        queryFn: () =>
            billing_service.getParty(
                quotationDetails?.data.quotation.partyId as number,
                selectedCompany?.companyId as number
            ),
        enabled: false,
    });

    /* Mutation To Update Quotation Details */
    const updateQuotationMutation = useMutation({
        mutationFn: (values: QuotationForm) =>
            billing_service.updateQuotation(
                quotationDetails?.data.quotation.quotationId as number,
                quotationDetails?.data.quotationItems as QuotationItem[],
                values,
                selectedCompany?.companyId as number,
                companyState.country?.timezone as string,
                selectedCompany?.decimalRoundTo as number
            ),
    });

    /* Add Sale mutation */
    const addSaleMutation = useMutation({
        mutationFn: (values: SaleInvoiceForm) =>
            billing_service.addSale(
                values,
                selectedCompany?.companyId as number,
                companyState.country?.timezone as string,
                selectedCompany?.decimalRoundTo as number
            ),
    });

    /* Setting the header for the page */
    useEffect(() => {
        navigation.setOptions({
            headerTitle: () => (
                <CustomNavHeader
                    mainHeading={
                        isAddSaleVisbile
                            ? i18n.t("addSale")
                            : quotationDetails
                            ? quotationDetails?.data?.quotation?.quotationNumber?.toString()
                            : i18n.t("quotation")
                    }
                    subHeading={selectedCompany?.companyName || ""}
                />
            ),
            headerRight: () => (
                <View style={styles.headerRightContainer}>
                    {
                        /* If edit is not enabled and the update feature is accessible, and quotation is not converted to invoice */
                        !isAddSaleVisbile &&
                        quotationDetails?.data.quotation.saleId == null &&
                        !isEditEnabled &&
                        isFeatureAccessible(
                            PLATFORM_FEATURES.ADD_UPDATE_QUOTATION
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
                        !fetchingQuotationDetails &&
                            !fetchingPartyDetails &&
                            !updateQuotationMutation.isPending &&
                            !isAddSaleVisbile &&
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
                                </>
                            )
                    }
                </View>
            ),
        });
    }, [
        navigation,
        quotationDetails,
        fetchingQuotationDetails,
        fetchingPartyDetails,
        updateQuotationMutation.isPending,
        isEditEnabled,
        isAddSaleVisbile,
    ]);

    /* Quotation form values from quotation and party details fetched */
    const quotationFormValues: QuotationForm | undefined = useMemo(() => {
        /* If quotation and party details are fetched */
        if (
            quotationDetails &&
            quotationDetails.success &&
            partyDetails &&
            partyDetails.success
        ) {
            /* Quotation Data */
            const quotationData = quotationDetails.data.quotation;

            /* Quotation Items */
            const quotationItems = quotationDetails.data.quotationItems;

            /* Party */
            const partyInfo = partyDetails?.data.party;

            /* SaleInvoiceItem */
            let itemsFormData: { [itemId: number]: SaleInvoiceItem } = {};

            /* For each quotation item */
            quotationItems.forEach((item) => {
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
                    quotationData.createdAt,
                    dateTimeFormat24hr,
                    timezone as string
                ),
                autogenerateQuotationNumber: false,
                quotationNumber: quotationData.quotationNumber,
                createdBy: quotationData.createdBy,
                party: {
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
                discount: quotationData.discount,
                subtotal: quotationData.subtotal,
                tax: quotationData.tax,
                taxPercent: Number(quotationData.taxPercent),
                taxName: quotationData.taxName,
                totalAfterDiscount: quotationData.totalAfterDiscount,
                totalAfterTax: quotationData.totalAfterTax,
                companyTaxNumber: quotationData.companyTaxNumber,
                partyTaxNumber: quotationData.partyTaxNumber,
                items: itemsFormData,
            };
        }
        return undefined;
    }, [quotationDetails, partyDetails]);

    /* Invoice form values from quotation form */
    const invoiceFormValues: SaleInvoiceForm | undefined = useMemo(() => {
        /* If sale and party details are fetched or it is a no party bill */
        if (quotationFormValues) {
            return {
                createdAt: new Date(),
                autogenerateInvoice: true,
                quotationNumber: quotationFormValues.quotationNumber,
                doneBy: authState.user?.userId as string,
                invoiceNumber: null,
                isNoPartyBill: false,
                party: {
                    partyId: quotationFormValues.party?.partyId as number,
                    partyName: quotationFormValues.party?.partyName as string,
                    defaultPurchaseCreditAllowanceInDays: quotationFormValues
                        .party?.defaultPurchaseCreditAllowanceInDays as number,
                    defaultSaleCreditAllowanceInDays: quotationFormValues.party
                        ?.defaultSaleCreditAllowanceInDays as number,
                    updatedAt: quotationFormValues.party?.updatedAt as Date,
                    countryId: quotationFormValues.party?.countryId as number,
                    taxDetails: quotationFormValues.party
                        ?.taxDetails as Array<TaxDetailsOfThirdPartyType> | null,
                },
                amountDue: 0,
                amountPaid: Number(quotationFormValues.totalAfterTax),
                discount: quotationFormValues.discount,
                subtotal: quotationFormValues.subtotal,
                tax: quotationFormValues.tax,
                taxPercent: Number(quotationFormValues.taxPercent),
                taxName: quotationFormValues.taxName,
                totalAfterDiscount: quotationFormValues.totalAfterDiscount,
                totalAfterTax: quotationFormValues.totalAfterTax,
                paymentCompletionDate: null,
                paymentDueDate: null,
                isFullyPaid: false,
                isCredit: false,
                companyTaxNumber: quotationFormValues.companyTaxNumber,
                partyTaxNumber: quotationFormValues.partyTaxNumber,
                items: quotationFormValues.items,
            };
        }
        return undefined;
    }, [quotationFormValues]);

    /* Fetch party details once quotation details are fetched*/
    useEffect(() => {
        if (quotationDetails && quotationDetails.success && !partyDetails) {
            fetchPartyDetails();
        }
    }, [quotationDetails]);

    /* If update is successful, fetchQuotationDetails again, and toggle edit */
    useEffect(() => {
        if (
            updateQuotationMutation.isSuccess &&
            updateQuotationMutation.data.success
        ) {
            ToastAndroid.show(
                capitalizeText(i18n.t("quotationUpdatedSuccessfully")),
                ToastAndroid.LONG
            );
            fetchQuotationDetails();
            toggleEdit();
        }
    }, [updateQuotationMutation.isSuccess]);

    /* Once sale is added show toast message and go to get sale screen */
    useEffect(() => {
        if (addSaleMutation.isSuccess && addSaleMutation.data.success) {
            ToastAndroid.show(
                capitalizeText(i18n.t("saleAddedSuccessfully")),
                ToastAndroid.LONG
            );
            router.dismiss();
            router.push(
                `${AppRoutes.getSale}/${addSaleMutation.data.data.sale.saleId}` as Href
            );
        }
    }, [addSaleMutation.isSuccess]);

    /* Loading spinner visibility */
    const showLoadingSpinner = useMemo(() => {
        return fetchingQuotationDetails ||
            fetchingPartyDetails ||
            updateQuotationMutation.isPending ||
            addSaleMutation.isPending
            ? true
            : false;
    }, [
        fetchingQuotationDetails,
        fetchingPartyDetails,
        addSaleMutation.isPending,
        updateQuotationMutation.isPending,
    ]);

    /* Error fetching quotation or party details */
    useEffect(() => {
        let message;
        if (errorFetchingQuotationDetails || errorFetchingPartyDetails) {
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
    }, [errorFetchingQuotationDetails, errorFetchingPartyDetails]);

    return (
        <>
            {showLoadingSpinner && <LoadingSpinnerOverlay />}
            {quotationFormValues && !isAddSaleVisbile && (
                <AddUpdateQuotation
                    operation="UPDATE"
                    formValues={quotationFormValues}
                    isUpdateEnabled={isEditEnabled}
                    apiErrorMessage={
                        updateQuotationMutation.error
                            ? getApiErrorMessage(updateQuotationMutation.error)
                            : null
                    }
                    onAddUpdateQuotation={(values) =>
                        updateQuotationMutation.mutate(values)
                    }
                    isConvertToInvoiceEnabled={
                        quotationDetails?.data.quotation.saleId == null
                    }
                    onConvertToInvoice={() => toggleAddSaleScreen()}
                />
            )}
            {isAddSaleVisbile && (
                <AddUpdateSaleInvoice
                    operation="ADD"
                    onAddUpdateSale={(values) => {
                        addSaleMutation.mutate(values);
                    }}
                    formValues={invoiceFormValues}
                    apiErrorMessage={
                        addSaleMutation.error
                            ? getApiErrorMessage(addSaleMutation.error)
                            : null
                    }
                />
            )}
            {printState.enabled && (
                <PrintPaper
                    html={getQuotationHTML(
                        quotationDetails?.data as GetQuotationResponse,
                        companyState?.selectedCompany as CompanyWithTaxDetails,
                        companyState.country as Country,
                        authState.user?.fullName as string,
                        partyDetails?.data as GetPartyResponse
                    )}
                    togglePrintModal={() =>
                        setPrintState({ enabled: false, isShareMode: false })
                    }
                    isShareMode={printState.isShareMode}
                    fileName={`quotation_${quotationDetails?.data.quotation.quotationNumber}`}
                />
            )}
        </>
    );
};

export default GetQuotation;

const styles = StyleSheet.create({
    headerRightContainer: {
        flexDirection: "row",
        columnGap: 16,
    },
});
