import { i18n } from "@/app/_layout";
import LoadingSpinnerOverlay from "@/components/custom/basic/LoadingSpinnerOverlay";
import AddUpdateRole from "@/components/custom/widgets/AddUpdateRole";
import { AddUpdateRoleForm } from "@/constants/types";
import UserService from "@/services/user/user_service";
import { useAppSelector } from "@/store";
import { capitalizeText, getApiErrorMessage } from "@/utils/common_utils";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import React, { useEffect, useMemo } from "react";
import { StyleSheet, ToastAndroid } from "react-native";

const AddRole = () => {

    /* Selected Company */
    const selectedCompany = useAppSelector(
        (state) => state.company.selectedCompany
    );

    const companyId = useMemo(
        () => selectedCompany?.companyId as number,
        [selectedCompany]
    );
    /* Add Role mutation */
    const addRoleMutation = useMutation({
        mutationFn: (values: AddUpdateRoleForm) =>
            UserService.addRole(companyId, values),
    });

    /* Show loading spinner when role is being added */
    const showLoadingSpinner = useMemo(() => {
        return addRoleMutation.isPending ? true : false;
    }, [addRoleMutation.isPending]);

    /* API Error  */
    const apiErrorMessage = useMemo(() => {
        if (addRoleMutation.error) {
            return getApiErrorMessage(addRoleMutation.error);
        }
        return null;
    }, [addRoleMutation.error]);

    /* Success: Show toast message and go back */
    useEffect(() => {
        if (addRoleMutation.isSuccess && addRoleMutation.data.success) {
            ToastAndroid.show(
                capitalizeText(`${i18n.t("roleAddedSuccessfully")}`),
                ToastAndroid.LONG
            );

            router.back();
        }
    }, [addRoleMutation.isSuccess]);

    return (
        <>
            {showLoadingSpinner && <LoadingSpinnerOverlay />}
            <AddUpdateRole 
                operation="ADD"
                onRoleAddOrUpdate={(values) => addRoleMutation.mutate(values)}
                apiErrorMessage={apiErrorMessage}
            />
           
        </>
    );
};

export default AddRole;

const styles = StyleSheet.create({});
