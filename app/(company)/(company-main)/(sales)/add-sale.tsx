import { i18n } from "@/app/_layout";
import LoadingSpinnerOverlay from "@/components/custom/basic/LoadingSpinnerOverlay";
import AddUpdatePurchaseInvoice from "@/components/custom/widgets/AddUpdatePurchaseInvoice";
import AddUpdateSaleInvoice from "@/components/custom/widgets/AddUpdateSaleInvoice";
import { PurchaseInvoiceForm, SaleInvoiceForm } from "@/constants/types";
import BillingService from "@/services/billing/billing_service";
import { useAppSelector } from "@/store";
import { capitalizeText, getApiErrorMessage } from "@/utils/common_utils";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import React, { useEffect, useMemo } from "react";
import { StyleSheet, ToastAndroid } from "react-native";

const AddSale = () => {
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

    /* Add Sale mutation */
    const addSaleMutation = useMutation({
        mutationFn: (values: SaleInvoiceForm) =>
            BillingService.addSale(
                values,
                selectedCompany?.companyId as number,
                companyState.country?.timezone as string,
                decimalPoints
            ),
    });

    /* Show loading spinner when sale is being added */
    const showLoadingSpinner = useMemo(() => {
        return addSaleMutation.isPending ? true : false;
    }, [addSaleMutation.isPending]);

    /* API Error  */
    const apiErrorMessage = useMemo(() => {
        if (addSaleMutation.error) {
            return getApiErrorMessage(addSaleMutation.error);
        }
        return null;
    }, [addSaleMutation.error]);

    /* Success: Show toast message and go back */
    useEffect(() => {
        if (addSaleMutation.isSuccess && addSaleMutation.data.success) {
            ToastAndroid.show(
                capitalizeText(`${i18n.t("saleAddedSuccessfully")}`),
                ToastAndroid.LONG
            );

            router.back();
        }
    }, [addSaleMutation.isSuccess]);

    return (
        <>
            {showLoadingSpinner && <LoadingSpinnerOverlay />}

            <AddUpdateSaleInvoice
                operation="ADD"
                onAddUpdateSale={(values) => addSaleMutation.mutate(values)}
                apiErrorMessage={apiErrorMessage}
            />
        </>
    );
};

export default AddSale;

const styles = StyleSheet.create({});
