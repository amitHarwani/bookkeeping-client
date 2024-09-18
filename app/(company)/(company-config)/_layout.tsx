import { i18n } from "@/app/_layout";
import SettingsIcon from "@/assets/images/settings_icon.png";
import LoadingSpinnerOverlay from "@/components/custom/basic/LoadingSpinnerOverlay";
import BottomTabItem from "@/components/custom/business/BottomTabItem";
import { PLATFORM_FEATURES } from "@/constants/features";
import { useSetReduxStateForCompany } from "@/hooks/useSetReduxStateForCompany";
import { isFeatureAccessible } from "@/utils/feature_access_helper";
import { router, Tabs } from "expo-router";
import React, { useEffect } from "react";
import { ToastAndroid } from "react-native";
import UserIcon from "@/assets/images/user_icon.png";
import CustomNavHeader from "@/components/custom/business/CustomNavHeader";
import { useAppSelector } from "@/store";

const CompanySettingsLayout = () => {
    const selectedCompany = useAppSelector(
        (state) => state.company.selectedCompany
    );

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
                <Tabs.Screen
                    name="(roles)"
                    options={{
                        headerTitle: () => (
                            <CustomNavHeader
                                mainHeading={i18n.t("roles")}
                                subHeading={selectedCompany?.companyName || ""}
                            />
                        ),
                        tabBarIcon: () => (
                            <BottomTabItem
                                icon={UserIcon}
                                title={i18n.t("roles")}
                            />
                        ),
                        tabBarItemStyle: {
                            display: isFeatureAccessible(
                                PLATFORM_FEATURES.GET_ROLES
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
