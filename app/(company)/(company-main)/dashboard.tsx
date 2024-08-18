import { StyleSheet, Text, ToastAndroid, View } from "react-native";
import React, { useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { useQuery } from "@tanstack/react-query";
import { ReactQueryKeys } from "@/constants/reactquerykeys";
import UserService from "@/services/user/user_service";
import { setUserACL } from "@/store/CompanySlice";
import { capitalizeText } from "@/utils/common_utils";
import { i18n } from "@/app/_layout";
import { router } from "expo-router";
import LoadingSpinnerOverlay from "@/components/custom/basic/LoadingSpinnerOverlay";

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

    /* Fetch userACL if selected company is their in redux store */
    useEffect(() => {
        if (
            selectedCompany &&
            selectedCompany.companyId &&
            !fetchingACL
        ) {
            fetchUserACL();
        }
    }, [selectedCompany]);

    /* Set User ACL In redux store after fetch */
    useEffect(() => {
        if (userACL && userACL.success) {
            dispatch(setUserACL(userACL.data.acl));
        }
    }, [userACL]);

    /* Loading spinner when fetching ACL */
    const showLoadingSpinner = useMemo(() => {
        return fetchingACL ? true : false;
    }, [fetchingACL]);

    /* Going back if there is an error fetching ACL */
    useEffect(() => {
        if (errorFetchingACL) {
            ToastAndroid.show(
                capitalizeText(
                    `${i18n.t("errorFetchingACL")}${i18n.t("comma")}${i18n.t(
                        "contactSupport"
                    )}`
                ),
                ToastAndroid.LONG
            );
            router.back();
        }
    }, [errorFetchingACL]);

    return (
        <View>
            {showLoadingSpinner && <LoadingSpinnerOverlay />}

            <Text>{`Dashboard ${selectedCompany?.companyName}`}</Text>
        </View>
    );
};

export default Dashboard;

const styles = StyleSheet.create({});
