import { ScrollView, StyleSheet, Text, ToastAndroid, View } from "react-native";
import React, { useEffect, useMemo } from "react";
import { AddUpdateRoleForm, GenericObject } from "@/constants/types";
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
import Input from "../basic/Input";
import Checkbox from "../basic/Checkbox";
import CustomButton from "../basic/CustomButton";
import { AddUpdateRoleValidation } from "@/utils/schema_validations";

interface AddUpdateRole {
    operation?: "ADD" | "UPDATE";
    isEditEnabled?: boolean;
    formValues?: AddUpdateRoleForm;
    apiErrorMessage?: string | null;
    onRoleAddOrUpdate(values: AddUpdateRoleForm): void;
}

const AddUpdateRole = ({
    operation,
    isEditEnabled,
    formValues,
    apiErrorMessage,
    onRoleAddOrUpdate,
}: AddUpdateRole) => {
    /* Selected company from redux */
    const selectedCompany = useAppSelector(
        (state) => state.company.selectedCompany
    );

    /* All enabled features */
    const allEnabledFeatures = useAppSelector(
        (state) => state.platformFeatures.platformFeatures
    );

    /* Input is disabled in case of update operation and when edit is disabled */
    const isInputsDisabled = useMemo(() => {
        if (operation === "UPDATE" && !isEditEnabled) {
            return true;
        }
        return false;
    }, [operation, isEditEnabled]);

    /* Stores key as the feature id and value as the feature id which depends on this feature. */
    const dependentFeaturesMap = useMemo(() => {
        const map: Map<number, Array<number>> = new Map();

        /* For each feature */
        Object.values(allEnabledFeatures).forEach((feature) => {
            /* If the feature is dependent on any other feature */
            if (feature?.dependentFeatureId) {
                /* Get all the dependent features of the dependentFeatureID */
                const dependentFeatures =
                    map.get(feature.dependentFeatureId) || [];

                /* Add current feature to the list */
                dependentFeatures.push(feature.featureId);

                /* Update the map */
                map.set(feature.dependentFeatureId, dependentFeatures);
            }
        });
        return map;
    }, [allEnabledFeatures]);

    /* Fetching ACL of the companies admin */
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

    /* Features list to be shown */
    const featuresList = useMemo(() => {
        if (
            allEnabledFeatures &&
            companyAdminACLResponse?.data &&
            companyAdminACLResponse.success
        ) {
            /* Forming map of company admins ACL for performance  */
            const companyAdminACLMap = new Map();

            companyAdminACLResponse.data.acl.forEach((featureId) =>
                companyAdminACLMap.set(featureId, true)
            );

            /* Returning all features which are enabled and included in company admin ACL */
            return Object.values(allEnabledFeatures).filter((feature) =>
                companyAdminACLMap.get(feature.featureId) ? true : false
            );
        }
        return [];
    }, [companyAdminACLResponse, allEnabledFeatures]);

    /* Form values */
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
        validationSchema: AddUpdateRoleValidation,
        onSubmit: (values) => onRoleAddOrUpdate(values),
    });

    const handleCheckboxChange = (data: GenericObject, isChecked: boolean) => {
        /* Current ACL */
        const temp = formik.values.acl;

        /* If it is checked, add to the ACL */
        if (isChecked) {
            temp[data.featureId] = true;
        } else {
            /* Else delete from ACL object */
            delete temp?.[data.featureId];

            /* Delete any features dependent on current feature */
            dependentFeaturesMap
                ?.get(data?.featureId)
                ?.forEach((dependentFeatureId) => {
                    delete temp?.[dependentFeatureId];
                });
        }
        /* Update form ACL */
        formik.setFieldValue("acl", temp);
    };
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

                    <Input
                        label={i18n.t("roleName")}
                        placeholder={capitalizeText(i18n.t("enterRoleName"))}
                        value={formik.values.roleName}
                        onBlur={formik.handleBlur("roleName")}
                        onChangeText={formik.handleChange("roleName")}
                        errorMessage={
                            formik.touched.roleName && formik.errors.roleName
                                ? formik.errors.roleName
                                : null
                        }
                        isDisabled={isInputsDisabled}
                    />

                    {featuresList.map((feature) => (
                        <Checkbox
                            key={feature.featureId}
                            data={feature}
                            description={capitalizeText(feature.featureName)}
                            value={
                                formik?.values?.acl?.[feature.featureId]
                                    ? true
                                    : false
                            }
                            onChange={handleCheckboxChange}
                            isDisabled={
                                (feature?.dependentFeatureId &&
                                    !formik.values.acl?.[
                                        feature?.dependentFeatureId
                                    ]) ||
                                isInputsDisabled
                                    ? true
                                    : false
                            }
                        />
                    ))}
                    {!isInputsDisabled && (
                        <CustomButton
                            text={
                                operation === "ADD"
                                    ? i18n.t("addRole")
                                    : i18n.t("updateRole")
                            }
                            onPress={() => formik.handleSubmit()}
                        />
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
