import SuccessModal from "@/components/custom/business/SuccessModal";
import AddUpdateCompany from "@/components/custom/widgets/AddUpdateCompany";
import { AddUpdateCompanyForm } from "@/constants/types";
import UserService from "@/services/user/user_service";
import { commonStyles } from "@/utils/common_styles";
import { getApiErrorMessage } from "@/utils/common_utils";
import { useMutation } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { i18n } from "../_layout";

const AddBranch = () => {
    const mainCompanyId = Number(useLocalSearchParams().companyId);
    const mainCompanyName = useLocalSearchParams().companyName;

    /* Whether success modal is shown */
    const [isSuccessModalShown, setIsSuccessModalShown] = useState(false);

    /* Mutation to add a country */
    const addCompanyMutation = useMutation({
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
        return addCompanyMutation.isPending;
    }, [addCompanyMutation.isPending]);

    /* API Error Message */
    const errorAddingCompany = useMemo(() => {
        if (addCompanyMutation.error) {
            return getApiErrorMessage(addCompanyMutation.error);
        }
        return null;
    }, [addCompanyMutation.error]);

    useEffect(() => {
        if (addCompanyMutation.isSuccess && addCompanyMutation.data.success) {
            /* Success */
            setIsSuccessModalShown(true);
        }
    }, [addCompanyMutation.isSuccess]);

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
                        description={i18n.t("branchAddedSuccessfully")}
                        onSuccessModalClose={() => {
                            setIsSuccessModalShown(false);
                        }}
                        primaryActionButtonText={i18n.t("continue")}
                        primaryActionButtonHandler={goBack}
                    />

                    <View style={styles.headingContainer}>
                        <Text style={commonStyles.mainHeading}>
                            {i18n.t("addBranch")}
                        </Text>

                        <Text
                            style={[
                                commonStyles.textSmallBold,
                                commonStyles.textGray,
                            ]}
                        >
                            {mainCompanyName}
                        </Text>
                    </View>

                    <AddUpdateCompany
                        onSubmit={(values) =>
                            addCompanyMutation.mutate({
                                companyDetails: values,
                                mainBranchId: mainCompanyId,
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

export default AddBranch;

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
    headingContainer: {
        rowGap: 2
    }
});
