import { i18n } from "@/app/_layout";
import SettingsIcon from "@/assets/images/settings_icon.png";
import LoadingSpinnerOverlay from "@/components/custom/basic/LoadingSpinnerOverlay";
import BottomTabItem from "@/components/custom/business/BottomTabItem";
import { PLATFORM_FEATURES } from "@/constants/features";
import { useSetReduxStateForCompany } from "@/hooks/useSetReduxStateForCompany";
import { isFeatureAccessible } from "@/utils/feature_access_helper";
import { router, Tabs } from "expo-router";
import React, { useEffect } from "react";
import { Image, ToastAndroid, TouchableOpacity } from "react-native";
import UserIcon from "@/assets/images/user_icon.png";
import CustomNavHeader from "@/components/custom/business/CustomNavHeader";
import { useAppSelector } from "@/store";
import BackIcon from "@/assets/images/back_icon.png";
import { commonStyles } from "@/utils/common_styles";
import { capitalizeText } from "@/utils/common_utils";

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

    /* If user doesn't have access to any of the setting features, go back and show an unauthorized toast message */
    useEffect(() => {
        /* Once all the setup is complete */
        if (!showLoadingSpinner) {
            /* Checking if the user has access to any of the settings features */
            if (
                !isFeatureAccessible(PLATFORM_FEATURES.GET_COMPANY) &&
                !isFeatureAccessible(PLATFORM_FEATURES.GET_ROLES) &&
                !isFeatureAccessible(PLATFORM_FEATURES.GET_USERS)
            ) {
                ToastAndroid.show(
                    capitalizeText(i18n.t("unauthorized")),
                    ToastAndroid.LONG
                );
                router.back();
            }
        }
    }, [showLoadingSpinner]);

    return (
        <>
            {showLoadingSpinner && <LoadingSpinnerOverlay />}
            <Tabs
                screenOptions={({ navigation }) => ({
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
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Image
                                style={[
                                    commonStyles.backIcon,
                                    { marginLeft: 12 },
                                ]}
                                source={BackIcon}
                            />
                        </TouchableOpacity>
                    ),
                })}
            >
                <Tabs.Screen
                    name="company-settings/[companyId]"
                    options={{
                        headerShown: true,
                        tabBarIcon: ({ focused }) => (
                            <BottomTabItem
                                icon={SettingsIcon}
                                title={i18n.t("companySettings")}
                                isFocussed={focused}
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
                        tabBarIcon: ({ focused }) => (
                            <BottomTabItem
                                icon={UserIcon}
                                title={i18n.t("roles")}
                                isFocussed={focused}
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

                <Tabs.Screen
                    name="(users)"
                    options={{
                        headerTitle: () => (
                            <CustomNavHeader
                                mainHeading={i18n.t("users")}
                                subHeading={selectedCompany?.companyName || ""}
                            />
                        ),
                        tabBarIcon: ({ focused }) => (
                            <BottomTabItem
                                icon={UserIcon}
                                title={i18n.t("users")}
                                isFocussed={focused}
                            />
                        ),
                        tabBarItemStyle: {
                            display: isFeatureAccessible(
                                PLATFORM_FEATURES.GET_USERS
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
