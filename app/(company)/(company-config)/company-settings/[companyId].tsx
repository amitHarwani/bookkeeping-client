import {
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    ToastAndroid,
    View,
} from "react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ReactQueryKeys } from "@/constants/reactquerykeys";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import UserService from "@/services/user/user_service";
import { ApiError } from "@/services/api_error";
import { SafeAreaView } from "react-native-safe-area-context";
import { AddUpdateCompanyForm } from "@/constants/types";
import SysAdminService from "@/services/sysadmin/sysadmin_service";
import {
    capitalizeText,
    convertUTCStringToTimezonedDate,
    getApiErrorMessage,
} from "@/utils/common_utils";
import { i18n } from "@/app/_layout";
import LoadingSpinnerOverlay from "@/components/custom/basic/LoadingSpinnerOverlay";
import moment from "moment";
import { dateFormat, dateTimeFormat24hr } from "@/constants/datetimes";
import AddUpdateCompany from "@/components/custom/widgets/AddUpdateCompany";
import CustomNavHeader from "@/components/custom/business/CustomNavHeader";
import { isFeatureAccessible } from "@/utils/feature_access_helper";
import { PLATFORM_FEATURES } from "@/constants/features";
import { commonStyles } from "@/utils/common_styles";
import EditIcon from "@/assets/images/edit_icon.png";
import { useAppSelector } from "@/store";

const CompanySettings = () => {
    const companyId = Number(useLocalSearchParams().companyId);

    const country = useAppSelector((state) => state.company.country);

    const navigation = useNavigation();

    const [isEditEnabled, setIsEditEnabled] = useState(false);

    const toggleEdit = useCallback(() => {
        setIsEditEnabled((prev) => !prev);
    }, [isEditEnabled]);

    /* Fetching company */
    const {
        isFetching: fetchingCompany,
        data: companyDataResponse,
        error: errorFetchingCompany,
        refetch: fetchCompany,
    } = useQuery({
        queryKey: [ReactQueryKeys.company, companyId],
        queryFn: async () => await UserService.getCompany(Number(companyId)),
    });

    /* Company data from company API response */
    const companyData = useMemo(() => {
        if (companyDataResponse) {
            return companyDataResponse.data.company;
        }
        return null;
    }, [companyDataResponse]);

    /* Setting the header for the page */
    useEffect(() => {
        navigation.setOptions({
            headerTitle: () => (
                <CustomNavHeader
                    mainHeading={i18n.t("settings")}
                    subHeading={companyData?.companyName || ""}
                />
            ),
            headerRight: () =>
                /* If edit is not enabled and the update feature is accessible */
                !isEditEnabled &&
                isFeatureAccessible(PLATFORM_FEATURES.UPDATE_COMPANY) ? (
                    <Pressable onPress={toggleEdit} style={styles.headerRightContainer}>
                        <Image
                            source={EditIcon}
                            style={commonStyles.editIcon}
                            resizeMode="contain"
                        />
                    </Pressable>
                ) : (
                    <></>
                ),
        });
    }, [navigation, companyData, isEditEnabled]);

    /* Form values to pass */
    const formValues: AddUpdateCompanyForm | null = useMemo(() => {
        if (companyData && country) {
            /* Getting the phone code from the mobile number of the company, and countries phone codes list */
            let phoneCode = country?.phoneNumberCodes?.find((code) =>
                companyData.phoneNumber.includes(code)
            );

            /* Removing the phone code and keeping the remaining numbers for mobile number */
            let mobileNumber = companyData?.phoneNumber?.substring(
                phoneCode?.length as number
            );

            /* Storing tax details as object where key is tax id and value is the tax details object */
            let taxDetails: {
                [taxId: number]: { taxId: number; registrationNumber: string };
            } = {};

            companyData.taxDetails.forEach((taxDetail) => {
                taxDetails[taxDetail.taxId] = taxDetail;
            });

            /* Current UTC date in YYYY-MM-DD format */
            const now = moment.utc().format(dateFormat);

            /* Adding the dayStartTime, to the date, and converting to the companies timezone */
            const localDayStartTime = convertUTCStringToTimezonedDate(
                `${now} ${companyData.dayStartTime}`,
                dateTimeFormat24hr,
                country.timezone
            );
            /* Form values */
            const res: AddUpdateCompanyForm = {
                address: companyData.address,
                companyName: companyData.companyName,
                decimalRoundTo: companyData.decimalRoundTo,
                country: country,
                phoneCode: phoneCode || "",
                mobileNumber: mobileNumber,
                taxDetails: taxDetails,
                localDayStartTime: localDayStartTime,
            };
            return res;
        }
        return null;
    }, [companyData, country]);

    /* Update Company Mutation */
    const updateCompanyMutation = useMutation({
        mutationFn: (values: AddUpdateCompanyForm) =>
            UserService.updateCompany(companyId, values),
    });

    /* On update completed: Refetch company details and toggle edit */
    useEffect(() => {
        if (
            updateCompanyMutation.isSuccess &&
            updateCompanyMutation.data.success
        ) {
            ToastAndroid.show(
                capitalizeText(`${i18n.t("companyUpdatedSuccessfully")}`),
                ToastAndroid.LONG
            );
            fetchCompany();
            toggleEdit();
        }
    }, [updateCompanyMutation.isSuccess]);

    /* Loading spinner visibility  */
    const showLoadingSpinner = useMemo(() => {
        if (fetchingCompany || updateCompanyMutation.isPending) {
            return true;
        }
        return false;
    }, [fetchingCompany, updateCompanyMutation.isPending]);

    /* On API Error, show toast message and go back */
    useEffect(() => {
        if (errorFetchingCompany) {
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
    }, [errorFetchingCompany]);

    return (
        <ScrollView style={styles.mainContainer}>
            <View style={styles.container}>
                {showLoadingSpinner && <LoadingSpinnerOverlay />}
                {formValues && (
                    <AddUpdateCompany
                        operation="UPDATE"
                        isEditEnabled={isEditEnabled}
                        onSubmit={(values) => {
                            updateCompanyMutation.mutate(values);
                        }}
                        errorOnSubmit={
                            updateCompanyMutation.error
                                ? getApiErrorMessage(
                                      updateCompanyMutation.error
                                  )
                                : null
                        }
                        formValues={formValues}
                    />
                )}
            </View>
        </ScrollView>
    );
};

export default CompanySettings;

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    container: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 12,
    },
    headerRightContainer: {
        marginRight: 12
    }
});
