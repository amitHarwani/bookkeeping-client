import { i18n } from "@/app/_layout";
import LoadingSpinnerOverlay from "@/components/custom/basic/LoadingSpinnerOverlay";
import AddUpdatePurchaseInvoice from "@/components/custom/widgets/AddUpdatePurchaseInvoice";
import { PurchaseInvoiceForm } from "@/constants/types";
import BillingService from "@/services/billing/billing_service";
import { useAppSelector } from "@/store";
import { capitalizeText, getApiErrorMessage } from "@/utils/common_utils";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import React, { useEffect, useMemo } from "react";
import { StyleSheet, ToastAndroid } from "react-native";

const AddPurchase = () => {
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

    /* Add Purchase mutation */
    const addPurchaseMutation = useMutation({
        mutationFn: ({
            values,
            invoiceTaxPercent,
            invoiceTaxName,
        }: {
            values: PurchaseInvoiceForm;
            invoiceTaxPercent: number;
            invoiceTaxName: string;
        }) =>
            BillingService.addPurchase(
                values,
                selectedCompany?.companyId as number,
                companyState.country?.timezone as string,
                invoiceTaxPercent,
                invoiceTaxName,
                decimalPoints
            ),
    });

    /* On Purchase added, call API */
    const onAddPurchase = (
        values: PurchaseInvoiceForm,
        invoiceTaxPercent: number,
        invoiceTaxName: string
    ) => {
        addPurchaseMutation.mutate({
            values,
            invoiceTaxPercent,
            invoiceTaxName,
        });
    };

    /* Show loading spinner when purchase is being added */
    const showLoadingSpinner = useMemo(() => {
        return addPurchaseMutation.isPending ? true : false;
    }, [addPurchaseMutation.isPending]);

    /* API Error  */
    const apiErrorMessage = useMemo(() => {
        if (addPurchaseMutation.error) {
            return getApiErrorMessage(addPurchaseMutation.error);
        }
        return null;
    }, [addPurchaseMutation.error]);

    /* Success: Show toast message and go back */
    useEffect(() => {
        if (addPurchaseMutation.isSuccess && addPurchaseMutation.data.success) {
            ToastAndroid.show(
                capitalizeText(`${i18n.t("purchaseAddedSuccessfully")}`),
                ToastAndroid.LONG
            );

            router.back();
        }
    }, [addPurchaseMutation.isSuccess]);

    return (
        <>
            {showLoadingSpinner && <LoadingSpinnerOverlay />}

            <AddUpdatePurchaseInvoice
                type="PURCHASE"
                operation="ADD"
                onAddPurchase={onAddPurchase}
                apiErrorMessage={apiErrorMessage}
            />
        </>
    );
};

export default AddPurchase;

const styles = StyleSheet.create({});
