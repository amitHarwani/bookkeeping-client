import { i18n } from "@/app/_layout";
import LoadingSpinnerOverlay from "@/components/custom/basic/LoadingSpinnerOverlay";
import AddUpdateRole from "@/components/custom/widgets/AddUpdateRole";
import AddUpdateUser from "@/components/custom/widgets/AddUpdateUser";
import { AddUpdateRoleForm, AddUpdateUserForm } from "@/constants/types";
import UserService from "@/services/user/user_service";
import { useAppSelector } from "@/store";
import { capitalizeText, getApiErrorMessage } from "@/utils/common_utils";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import React, { useEffect, useMemo } from "react";
import { StyleSheet, ToastAndroid } from "react-native";

const AddUser = () => {
    /* Selected Company */
    const selectedCompany = useAppSelector(
        (state) => state.company.selectedCompany
    );

    const companyId = useMemo(
        () => selectedCompany?.companyId as number,
        [selectedCompany]
    );
    /* Add User mutation */
    const addUserMutation = useMutation({
        mutationFn: (values: AddUpdateUserForm) =>
            UserService.addUser(values, companyId),
    });

    /* Show loading spinner when role is being added */
    const showLoadingSpinner = useMemo(() => {
        return addUserMutation.isPending ? true : false;
    }, [addUserMutation.isPending]);


    /* Success: Show toast message and go back */
    useEffect(() => {
        if (addUserMutation.isSuccess && addUserMutation.data.success) {
            ToastAndroid.show(
                capitalizeText(`${i18n.t("userAddedSuccessfully")}`),
                ToastAndroid.LONG
            );

            router.back();
        }
    }, [addUserMutation.isSuccess]);

    return (
        <>
            {showLoadingSpinner && <LoadingSpinnerOverlay />}
            <AddUpdateUser 
                operation="ADD"
                onUserAddOrUpdate={(values) => addUserMutation.mutate(values)}
                apiErrorMessage={addUserMutation.error ? getApiErrorMessage(addUserMutation.error) : null}
            />
        </>
    );
};

export default AddUser;

const styles = StyleSheet.create({});
