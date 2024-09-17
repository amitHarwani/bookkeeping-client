import { i18n } from "@/app/_layout";
import SettingsIcon from "@/assets/images/settings_icon.png";
import LoadingSpinnerOverlay from "@/components/custom/basic/LoadingSpinnerOverlay";
import BottomTabItem from "@/components/custom/business/BottomTabItem";
import { PLATFORM_FEATURES } from "@/constants/features";
import { ReactQueryKeys } from "@/constants/reactquerykeys";
import { useSetReduxStateForCompany } from "@/hooks/useSetReduxStateForCompany";
import UserService from "@/services/user/user_service";
import { useAppSelector } from "@/store";
import { capitalizeText } from "@/utils/common_utils";
import { isFeatureAccessible } from "@/utils/feature_access_helper";
import { useQuery } from "@tanstack/react-query";
import { router, Tabs } from "expo-router";
import React, { useEffect, useMemo } from "react";
import { ToastAndroid } from "react-native";

const CompanySettingsLayout = () => {

    /* Setting redux state for initial details according to the selected company */
    const { showLoadingSpinner, errorMessage } = useSetReduxStateForCompany();

    /* Going back if there is an error when making API Calls */
    useEffect(() => {
        if (errorMessage) {
            ToastAndroid.show(errorMessage, ToastAndroid.LONG);
            router.back();
        }
    }, [errorMessage]);

    return (
        <>
            {showLoadingSpinner && <LoadingSpinnerOverlay />}
            <Tabs
                screenOptions={{
                    headerStyle: {
                        backgroundColor: "#FFFFFF",
                        height: 100,
                        shadowColor: "#FFFFFF",
                    },
                    tabBarShowLabel: false,
                    tabBarStyle: {
                        height: 60,
                        borderTopWidth: 1,
                    },
                }}
            >
                <Tabs.Screen
                    name="company-settings/[companyId]"
                    options={{
                        headerShown: true,
                        tabBarIcon: () => (
                            <BottomTabItem
                                icon={SettingsIcon}
                                title={i18n.t("companySettings")}
                            />
                        ),
                        tabBarItemStyle: {
                            display: isFeatureAccessible(
                                PLATFORM_FEATURES.GET_COMPANY
                            )
                                ? "flex"
                                : "none",
                        },
                    }}
                />
            </Tabs>
        </>
    );
};

export default CompanySettingsLayout;
