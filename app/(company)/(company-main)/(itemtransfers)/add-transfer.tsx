import { i18n } from "@/app/_layout";
import LoadingSpinnerOverlay from "@/components/custom/basic/LoadingSpinnerOverlay";
import AddUpdateSaleInvoice from "@/components/custom/widgets/AddUpdateSaleInvoice";
import AddUpdateTransfer from "@/components/custom/widgets/AddUpdateTransfer";
import {
    AddUpdateTransferForm
} from "@/constants/types";
import InventoryService from "@/services/inventory/inventory_service";
import { useAppSelector } from "@/store";
import { capitalizeText, getApiErrorMessage } from "@/utils/common_utils";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import React, { useEffect, useMemo } from "react";
import { StyleSheet, ToastAndroid } from "react-native";

const AddTransfer = () => {
    /* Company State from redux */
    const companyState = useAppSelector((state) => state.company);

    /* Selected Company */
    const selectedCompany = useAppSelector(
        (state) => state.company.selectedCompany
    );

    /* Company ID & Company Name from selected company */
    const companyId = useMemo(() => selectedCompany?.companyId as number, []);
    const companyName = useMemo(
        () => selectedCompany?.companyName as string,
        []
    );

    /* Add Transfer mutation */
    const addTransferMutation = useMutation({
        mutationFn: (values: AddUpdateTransferForm) =>
            InventoryService.addTransfer(companyId, companyName, values),
    });

    /* Show loading spinner when transfer is being added */
    const showLoadingSpinner = useMemo(() => {
        return addTransferMutation.isPending ? true : false;
    }, [addTransferMutation.isPending]);

    /* API Error  */
    const apiErrorMessage = useMemo(() => {
        if (addTransferMutation.error) {
            return getApiErrorMessage(addTransferMutation.error);
        }
        return null;
    }, [addTransferMutation.error]);

    /* Success: Show toast message and go back */
    useEffect(() => {
        if (addTransferMutation.isSuccess && addTransferMutation.data.success) {
            ToastAndroid.show(
                capitalizeText(`${i18n.t("itemsTransferredSuccessfully")}`),
                ToastAndroid.LONG
            );

            router.back();
        }
    }, [addTransferMutation.isSuccess]);

    return (
        <>
            {showLoadingSpinner && <LoadingSpinnerOverlay />}

            <AddUpdateTransfer
                operation="ADD"
                onAddUpdateTransfer={(values) => addTransferMutation.mutate(values)}
                apiErrorMessage={apiErrorMessage}
            />
        </>
    );
};

export default AddTransfer;

const styles = StyleSheet.create({});
