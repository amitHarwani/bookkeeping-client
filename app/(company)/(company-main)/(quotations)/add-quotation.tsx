import { i18n } from "@/app/_layout";
import LoadingSpinnerOverlay from "@/components/custom/basic/LoadingSpinnerOverlay";
import AddUpdatePurchaseInvoice from "@/components/custom/widgets/AddUpdatePurchaseInvoice";
import AddUpdateQuotation from "@/components/custom/widgets/AddUpdateQuotation";
import AddUpdateSaleInvoice from "@/components/custom/widgets/AddUpdateSaleInvoice";
import {
    PurchaseInvoiceForm,
    QuotationForm,
    SaleInvoiceForm,
} from "@/constants/types";
import BillingService from "@/services/billing/billing_service";
import { useAppSelector } from "@/store";
import { capitalizeText, getApiErrorMessage } from "@/utils/common_utils";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import React, { useEffect, useMemo } from "react";
import { StyleSheet, ToastAndroid } from "react-native";

const AddQuotation = () => {
    /* Company State from redux */
    const companyState = useAppSelector((state) => state.company);

    /* Decimal points to round to when showing the value */
    const decimalPoints = useMemo(() => {
        return companyState.selectedCompany?.decimalRoundTo || 2;
    }, [companyState]);

    /* Selected Company */
    const selectedCompany = useAppSelector(
        (state) => state.company.selectedCompany
    );

    /* Add Quotation mutation */
    const addQuotationMutation = useMutation({
        mutationFn: (values: QuotationForm) =>
            BillingService.addQuotation(
                values,
                selectedCompany?.companyId as number,
                companyState.country?.timezone as string,
                decimalPoints
            ),
    });

    /* Show loading spinner when quotation is being added */
    const showLoadingSpinner = useMemo(() => {
        return addQuotationMutation.isPending ? true : false;
    }, [addQuotationMutation.isPending]);

    /* API Error  */
    const apiErrorMessage = useMemo(() => {
        if (addQuotationMutation.error) {
            return getApiErrorMessage(addQuotationMutation.error);
        }
        return null;
    }, [addQuotationMutation.error]);

    /* Success: Show toast message and go back */
    useEffect(() => {
        if (
            addQuotationMutation.isSuccess &&
            addQuotationMutation.data.success
        ) {
            ToastAndroid.show(
                capitalizeText(`${i18n.t("quotationAddedSuccessfully")}`),
                ToastAndroid.LONG
            );

            router.back();
        }
    }, [addQuotationMutation.isSuccess]);

    return (
        <>
            {showLoadingSpinner && <LoadingSpinnerOverlay />}

            <AddUpdateQuotation
                operation="ADD"
                onAddUpdateQuotation={(values) =>
                    addQuotationMutation.mutate(values)
                }
                apiErrorMessage={apiErrorMessage}
            />
        </>
    );
};

export default AddQuotation;

const styles = StyleSheet.create({});
