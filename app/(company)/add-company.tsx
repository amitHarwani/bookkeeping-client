import { StyleSheet, Text, View, ScrollView } from "react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { commonStyles } from "@/utils/common_styles";
import { i18n } from "../_layout";
import { AddUpdateCompanyForm } from "@/constants/types";
import { Formik } from "formik";
import { AddUpdateCompanyFormValidation } from "@/utils/schema_validations";
import CustomButton from "@/components/custom/basic/CustomButton";
import Input from "@/components/custom/basic/Input";
import Dropdown from "@/components/custom/basic/Dropdown";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ReactQueryKeys } from "@/constants/reactquerykeys";
import SysAdminService from "@/services/sysadmin/sysadmin_service";
import { Country } from "@/services/sysadmin/sysadmin_types";
import { capitalizeText, getApiErrorMessage } from "@/utils/common_utils";
import CustomDateTimePicker from "@/components/custom/basic/CustomDateTimePicker";
import LoadingSpinnerOverlay from "@/components/custom/basic/LoadingSpinnerOverlay";
import ErrorMessage from "@/components/custom/basic/ErrorMessage";
import TaxInputItem from "@/components/custom/business/TaxInputItem";
import UserService from "@/services/user/user_service";
import SuccessModal from "@/components/custom/business/SuccessModal";
import { router } from "expo-router";
import AddUpdateCompany from "@/components/custom/widgets/AddUpdateCompany";

const AddCompany = () => {
    /* Whether success modal is shown */
    const [isSuccessModalShown, setIsSuccessModalShown] = useState(false);

    /* Mutation to add a country */
    const addCountryMutation = useMutation({
        mutationFn: ({
            companyDetails,
            mainBranchId,
        }: {
            companyDetails: AddUpdateCompanyForm;
            mainBranchId?: number;
        }) => UserService.addCompany(companyDetails, mainBranchId),
    });

    /* Loading spinner overlay when making api request */
    const addCompanyInProgress = useMemo(() => {
        return addCountryMutation.isPending;
    }, [addCountryMutation.isPending]);

    /* API Error Message */
    const errorAddingCompany = useMemo(() => {
        if (addCountryMutation.error) {
            return getApiErrorMessage(addCountryMutation.error);
        }
        return null;
    }, [addCountryMutation.error]);

    useEffect(() => {
        if (addCountryMutation.isSuccess && addCountryMutation.data.success) {
            /* Success */
            setIsSuccessModalShown(true);
        }
    }, [addCountryMutation.isSuccess]);

    /* Go back to previous screen */
    const goBack = useCallback(() => {
        router.back();
    }, []);

    return (
        <SafeAreaView style={styles.mainContainer}>
            <ScrollView>
                <View style={styles.container}>
                    <SuccessModal
                        isSuccessModalShown={isSuccessModalShown}
                        description={i18n.t("companyAddedSuccessfully")}
                        onSuccessModalClose={() => {
                            setIsSuccessModalShown(false);
                        }}
                        primaryActionButtonText={i18n.t("continue")}
                        primaryActionButtonHandler={goBack}
                    />
                    <Text style={commonStyles.mainHeading}>
                        {i18n.t("addYourCompany")}
                    </Text>

                    <AddUpdateCompany
                        onSubmit={(values) =>
                            addCountryMutation.mutate({
                                companyDetails: values,
                                mainBranchId: undefined,
                            })
                        }
                        apiCallInProgress={addCompanyInProgress}
                        errorOnSubmit={errorAddingCompany}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default AddCompany;

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    container: {
        paddingHorizontal: 32,
        paddingTop: 74,
        rowGap: 24,
        paddingBottom: 12,
    },
});
