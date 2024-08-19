import { StyleSheet, Text, ToastAndroid, View } from "react-native";
import React, { useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { useQuery } from "@tanstack/react-query";
import { ReactQueryKeys } from "@/constants/reactquerykeys";
import UserService from "@/services/user/user_service";
import SystemAdminService from "@/services/sysadmin/sysadmin_service";
import { setTaxDetailsOfCountry, setUserACL } from "@/store/CompanySlice";
import { capitalizeText } from "@/utils/common_utils";
import { i18n } from "@/app/_layout";
import { router } from "expo-router";
import LoadingSpinnerOverlay from "@/components/custom/basic/LoadingSpinnerOverlay";
import { PlatformFeature, TaxDetail } from "@/services/sysadmin/sysadmin_types";
import { setPlatformFeatures } from "@/store/PlatformFeaturesSlice";

const Dashboard = () => {
    const selectedCompany = useAppSelector(
        (state) => state.company.selectedCompany
    );

    const dispatch = useAppDispatch();

    /* useQuery for fetching userACL for the company */
    const {
        isFetching: fetchingACL,
        data: userACL,
        isError: errorFetchingACL,
        refetch: fetchUserACL,
    } = useQuery({
        queryKey: [
            ReactQueryKeys.userACLForCompany,
            selectedCompany?.companyId,
        ],
        queryFn: () =>
            UserService.getAccessibleFeaturesOfCompany(
                selectedCompany?.companyId as number
            ),
        enabled: false,
    });

    /* useQuery for fetching taxdetails of the country where the company is located */
    const {
        isFetching: fetchingTaxDetailsOfCountry,
        data: taxDetailsOfCountry,
        isError: errorFetchingTaxDetailsOfCountry,
        refetch: fetchTaxDetailsOfCountry,
    } = useQuery({
        queryKey: [
            ReactQueryKeys.taxDetailsOfCountry,
            selectedCompany?.countryId,
        ],
        queryFn: () =>
            SystemAdminService.getTaxDetailsOfCountry(
                selectedCompany?.countryId as number
            ),
        enabled: false,
    });

    const {
        isFetching: fetchingEnabledFeatures,
        data: enabledFeaturesData,
        isError: errorFetchingEnabledFeatures,
    } = useQuery({
        queryKey: [ReactQueryKeys.enabledPlatformFeatures],
        queryFn: () => SystemAdminService.getAllEnabledFeatures(),
    });

    /* Fetch userACL & tax details of country if selected company is their in redux store */
    useEffect(() => {
        if (selectedCompany && selectedCompany.companyId && !fetchingACL) {
            fetchUserACL();
        }
        if (
            selectedCompany &&
            selectedCompany.companyId &&
            !fetchingTaxDetailsOfCountry
        ) {
            fetchTaxDetailsOfCountry();
        }
    }, [selectedCompany]);

    /* Set User ACL In redux store after fetch */
    useEffect(() => {
        if (userACL && userACL.success) {
            /* Forming key value obj, where key is featureId and value is true, for fast retrieval */
            const userACLObj: { [featureId: number]: boolean } = {};
            userACL.data.acl.forEach((feature) => {
                userACLObj[feature] = true;
            });
            dispatch(setUserACL({ acl: userACLObj }));
        }
    }, [userACL]);

    /* Setting tax details of country in redux store */
    useEffect(() => {
        if (taxDetailsOfCountry && taxDetailsOfCountry.success) {
            const taxDetails = taxDetailsOfCountry.data.taxDetails;

            /* Forming key value pairs: where key is taxId and value is TaxDetail object, for fast retrieval */
            const taxDetailsObj: { [taxId: string]: TaxDetail } = {};
            taxDetails.forEach((tax) => {
                taxDetailsObj[tax.taxId] = tax;
            });

            dispatch(
                setTaxDetailsOfCountry({ taxDetailsOfCountry: taxDetailsObj })
            );
        }
    }, [taxDetailsOfCountry]);

    /* Setting enabled featues in redux store */
    useEffect(() => {
        if (enabledFeaturesData && enabledFeaturesData.success) {
            const enabledFeaturesObj: { [featureId: number]: PlatformFeature } =
                {};

            /* Forming key value pairs: where key is fetureId and value is PlatformFeature object, for fast retrieval */
            enabledFeaturesData.data.features.forEach((feature) => {
                enabledFeaturesObj[feature.featureId] = feature;
            });

            dispatch(
                setPlatformFeatures({ platformFeatures: enabledFeaturesObj })
            );
        }
    }, [enabledFeaturesData]);

    /* Loading spinner when fetching ACL */
    const showLoadingSpinner = useMemo(() => {
        return fetchingACL ||
            fetchingTaxDetailsOfCountry ||
            fetchingEnabledFeatures
            ? true
            : false;
    }, [fetchingACL, fetchingTaxDetailsOfCountry, fetchingEnabledFeatures]);

    /* Going back if there is an error when making initial API Calls */
    useEffect(() => {
        let message = "";
        if (errorFetchingACL) {
            message = capitalizeText(
                `${i18n.t("errorFetchingACL")}${i18n.t("comma")}${i18n.t(
                    "contactSupport"
                )}`
            );
        }
        if (errorFetchingTaxDetailsOfCountry) {
            message = capitalizeText(
                `${i18n.t("errorFetchingTaxDetails")}${i18n.t("comma")}${i18n.t(
                    "contactSupport"
                )}`
            );
        }
        if (errorFetchingEnabledFeatures) {
            message = capitalizeText(
                `${i18n.t("error")}${i18n.t("comma")}${i18n.t(
                    "contactSupport"
                )}`
            );
        }
        if (message) {
            ToastAndroid.show(message, ToastAndroid.LONG);
            router.back();
        }
    }, [
        errorFetchingACL,
        errorFetchingTaxDetailsOfCountry,
        errorFetchingEnabledFeatures,
    ]);

    return (
        <View>
            {showLoadingSpinner && <LoadingSpinnerOverlay />}

            <Text>{`Dashboard ${selectedCompany?.companyName}`}</Text>
        </View>
    );
};

export default Dashboard;

const styles = StyleSheet.create({});
