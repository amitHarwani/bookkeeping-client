import { ScrollView, StyleSheet, Text, ToastAndroid, View } from "react-native";
import React, { useEffect, useMemo } from "react";
import { AddUpdateRoleForm } from "@/constants/types";
import ErrorMessage from "../basic/ErrorMessage";
import { useFormik } from "formik";
import { useQuery } from "@tanstack/react-query";
import { ReactQueryKeys } from "@/constants/reactquerykeys";
import { useAppSelector } from "@/store";
import UserService from "@/services/user/user_service";
import { capitalizeText } from "@/utils/common_utils";
import { i18n } from "@/app/_layout";
import { router } from "expo-router";
import LoadingSpinnerOverlay from "../basic/LoadingSpinnerOverlay";

interface AddUpdateRole {
    operation?: "ADD" | "UPDATE";
    isEditEnabled?: boolean;
    formValues?: AddUpdateRoleForm;
    apiErrorMessage?: string;
    onRoleAddOrUpdate(values: AddUpdateRoleForm): void;
}

const AddUpdateRole = ({
    operation,
    isEditEnabled,
    formValues,
    apiErrorMessage,
    onRoleAddOrUpdate,
}: AddUpdateRole) => {
    const selectedCompany = useAppSelector(
        (state) => state.company.selectedCompany
    );

    const allEnabledFeatures = useAppSelector(
        (state) => state.platformFeatures.platformFeatures
    );

    const {
        isFetching: fetchingCompanyAdminACL,
        data: companyAdminACLResponse,
        error: errorFetchingCompanyAdminACL,
    } = useQuery({
        queryKey: [
            ReactQueryKeys.getCompanyAdminACL,
            selectedCompany?.companyId,
        ],
        queryFn: () =>
            UserService.getCompanyAdminACL(
                selectedCompany?.companyId as number
            ),
    });

    const initialFormValues: AddUpdateRoleForm = useMemo(() => {
        if (formValues) {
            return formValues;
        }
        return {
            roleName: "",
            acl: {},
        };
    }, [formValues]);

    const formik = useFormik({
        initialValues: initialFormValues,
        onSubmit: (values) => onRoleAddOrUpdate(values),
    });

    /* Loading spinner when fetching acl of company admin */
    const showLoadingSpinner = useMemo(() => {
        return fetchingCompanyAdminACL ? true : false;
    }, [fetchingCompanyAdminACL]);

    /* Error fetching admin acl: Show toast and go back */
    useEffect(() => {
        if (errorFetchingCompanyAdminACL) {
            ToastAndroid.show(
                capitalizeText(
                    `${i18n.t("errorFetchingDetails")}${i18n.t(
                        "comma"
                    )}${i18n.t("contactSupport")}`
                ),
                ToastAndroid.LONG
            );
            router.back();
        }
    }, [errorFetchingCompanyAdminACL]);
    return (
        <ScrollView style={styles.mainContainer}>
            {showLoadingSpinner && <LoadingSpinnerOverlay />}
            <View style={styles.container}>
                <View style={styles.formContainer}>
                    {apiErrorMessage && (
                        <ErrorMessage message={apiErrorMessage} />
                    )}
                </View>
            </View>
        </ScrollView>
    );
};

export default AddUpdateRole;

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    container: {
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 12,
    },
    formContainer: {
        rowGap: 16,
    },
});
