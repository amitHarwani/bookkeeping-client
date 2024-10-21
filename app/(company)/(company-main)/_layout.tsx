import { i18n } from "@/app/_layout";
import HamburgerIcon from "@/assets/images/hamburger_icon.png";
import LogoutIcon from "@/assets/images/logout_icon.png";
import CustomButton from "@/components/custom/basic/CustomButton";
import LoadingSpinnerOverlay from "@/components/custom/basic/LoadingSpinnerOverlay";
import CustomNavHeader from "@/components/custom/business/CustomNavHeader";
import { PLATFORM_FEATURES } from "@/constants/features";
import { fonts } from "@/constants/fonts";
import { ReactQueryKeys } from "@/constants/reactquerykeys";
import { AppRoutes } from "@/constants/routes";
import { SecureStoreKeys } from "@/constants/securestorekeys";
import { useSetReduxStateForCompany } from "@/hooks/useSetReduxStateForCompany";
import SystemAdminService from "@/services/sysadmin/sysadmin_service";
import { PlatformFeature, TaxDetail } from "@/services/sysadmin/sysadmin_types";
import UserService from "@/services/user/user_service";
import { useAppDispatch, useAppSelector } from "@/store";
import { logOut } from "@/store/AuthSlice";
import {
    setCountryDetails,
    setTaxDetailsOfCountry,
    setUserACL,
} from "@/store/CompanySlice";
import { setPlatformFeatures } from "@/store/PlatformFeaturesSlice";
import { commonStyles } from "@/utils/common_styles";
import { capitalizeText, getApiErrorMessage } from "@/utils/common_utils";
import { isFeatureAccessible } from "@/utils/feature_access_helper";
import { deleteValueFromSecureStore } from "@/utils/securestore";
import {
    DrawerContentScrollView,
    DrawerItemList,
} from "@react-navigation/drawer";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Href, router } from "expo-router";
import { Drawer } from "expo-router/drawer";
import React, { useEffect, useMemo } from "react";
import {
    Image,
    Pressable,
    StyleSheet,
    Text,
    ToastAndroid,
    TouchableOpacity,
    View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const CustomDrawer = (props) => {
    const dispatch = useAppDispatch();

    /* Current user & selected company */
    const userDetails = useAppSelector((state) => state.auth.user);
    const selectedCompany = useAppSelector(
        (state) => state.company.selectedCompany
    );

    /* Logout mutation */
    const logoutMutation = useMutation({
        mutationFn: () => UserService.logout(),
    });

    /* Show loading spinner when logout is in progress */
    const showLoadingSpinner = useMemo(() => {
        return logoutMutation.isPending ? true : false;
    }, [logoutMutation.isPending]);

    /* Error when logging out, show error toast message */
    useEffect(() => {
        if (logoutMutation.error) {
            ToastAndroid.show(
                getApiErrorMessage(logoutMutation.error),
                ToastAndroid.LONG
            );
        }
    }, [logoutMutation.error]);

    /* Once logout is successfuly, show toast message and route back */
    useEffect(() => {
        const postLogoutActions = async () => {
            ToastAndroid.show(
                capitalizeText(i18n.t("logoutSuccessful")),
                ToastAndroid.LONG
            );
            /* Remove details from redux & secure store, and navigate to login */
            dispatch(logOut());
            await deleteValueFromSecureStore(SecureStoreKeys.accessToken);
            await deleteValueFromSecureStore(SecureStoreKeys.userDetails);
            router.dismissAll();
            router.push(`${AppRoutes.login}` as Href);
        };

        if (logoutMutation.isSuccess) {
            postLogoutActions();
        }
    }, [logoutMutation.isSuccess]);

    return (
        <DrawerContentScrollView {...props} style={styles.drawerContainer}>
            <View style={styles.drawerHeaderContainer}>
                {showLoadingSpinner && <LoadingSpinnerOverlay />}

                <View style={styles.userDetailsContainer}>
                    <Text style={[commonStyles.textXLBlack]}>
                        {userDetails?.fullName}
                    </Text>
                    <Text
                        style={[
                            commonStyles.textSmallBold,
                            commonStyles.textGray,
                        ]}
                    >
                        {selectedCompany?.companyName}
                    </Text>
                </View>
                <Pressable
                    onPress={() => logoutMutation.mutate()}
                    style={styles.logoutContainer}
                >
                    <Image
                        source={LogoutIcon}
                        style={styles.logoutIcon}
                        resizeMode="contain"
                    />
                    <Text
                        style={[
                            commonStyles.textSmallBold,
                            commonStyles.capitalize,
                            commonStyles.textBlue,
                        ]}
                    >
                        {i18n.t("logout")}
                    </Text>
                </Pressable>

                <CustomButton
                    text={i18n.t("switchCompany")}
                    onPress={() => {
                        router.navigate(
                            `${AppRoutes.viewAllCompanies}` as Href
                        );
                    }}
                    isSecondaryButton={true}
                    extraContainerStyles={{ paddingVertical: 12 }}
                />
            </View>
            <DrawerItemList {...props} />
        </DrawerContentScrollView>
    );
};

const CompanyMainLayout = () => {
    const selectedCompany = useAppSelector(
        (state) => state.company.selectedCompany
    );

    /* Setting redux state */
    const { showLoadingSpinner, errorMessage } = useSetReduxStateForCompany();

    /* On error, show error message and go back */
    useEffect(() => {
        if (errorMessage) {
            ToastAndroid.show(errorMessage, ToastAndroid.LONG);
            router.back();
        }
    }, [errorMessage]);

    return (
        <>
            {showLoadingSpinner && <LoadingSpinnerOverlay />}
            {!showLoadingSpinner && (
                <GestureHandlerRootView style={{ flex: 1 }}>
                    <Drawer
                        drawerContent={CustomDrawer}
                        screenOptions={({ navigation }) => ({
                            drawerActiveTintColor: "#006FFD",
                            drawerActiveBackgroundColor: "#FFFFFF",
                            headerStyle: {
                                backgroundColor: "#FFFFFF",
                                height: 100,
                                shadowColor: "#FFFFFF",
                            },
                            headerLeft: () => (
                                <TouchableOpacity
                                    onPress={() => navigation.openDrawer()}
                                >
                                    <Image
                                        style={styles.hamburgerIcon}
                                        source={HamburgerIcon}
                                    />
                                </TouchableOpacity>
                            ),
                        })}
                    >
                        <Drawer.Screen
                            name="(dashboard)"
                            options={{
                                drawerLabel: capitalizeText(
                                    i18n.t("dashboard")
                                ),
                                headerTitle: () => (
                                    <CustomNavHeader
                                        mainHeading={i18n.t("dashboard")}
                                        subHeading={
                                            selectedCompany?.companyName || ""
                                        }
                                    />
                                ),
                            }}
                        />
                        <Drawer.Screen
                            name="(items)"
                            options={{
                                drawerLabel: capitalizeText(i18n.t("items")),
                                headerTitle: () => (
                                    <CustomNavHeader
                                        mainHeading={i18n.t("items")}
                                        subHeading={
                                            selectedCompany?.companyName || ""
                                        }
                                    />
                                ),
                                drawerItemStyle: {
                                    display: isFeatureAccessible(
                                        PLATFORM_FEATURES.GET_ITEMS
                                    )
                                        ? "flex"
                                        : "none",
                                    marginTop: -10,
                                },
                            }}
                        />

                        <Drawer.Screen
                            name="(parties)"
                            options={{
                                drawerLabel: capitalizeText(i18n.t("parties")),
                                headerTitle: () => (
                                    <CustomNavHeader
                                        mainHeading={i18n.t("parties")}
                                        subHeading={
                                            selectedCompany?.companyName || ""
                                        }
                                    />
                                ),
                                drawerItemStyle: {
                                    display: isFeatureAccessible(
                                        PLATFORM_FEATURES.GET_PARTIES
                                    )
                                        ? "flex"
                                        : "none",
                                    marginTop: -10,
                                },
                            }}
                        />

                        <Drawer.Screen
                            name="(purchases)"
                            options={{
                                drawerLabel: capitalizeText(
                                    i18n.t("purchases")
                                ),
                                headerTitle: () => (
                                    <CustomNavHeader
                                        mainHeading={i18n.t("purchases")}
                                        subHeading={
                                            selectedCompany?.companyName || ""
                                        }
                                    />
                                ),
                                drawerItemStyle: {
                                    display: isFeatureAccessible(
                                        PLATFORM_FEATURES.GET_PURCHASES
                                    )
                                        ? "flex"
                                        : "none",
                                    marginTop: -10,
                                },
                            }}
                        />

                        <Drawer.Screen
                            name="(sales)"
                            options={{
                                drawerLabel: capitalizeText(i18n.t("sales")),
                                headerTitle: () => (
                                    <CustomNavHeader
                                        mainHeading={i18n.t("sales")}
                                        subHeading={
                                            selectedCompany?.companyName || ""
                                        }
                                    />
                                ),
                                drawerItemStyle: {
                                    display: isFeatureAccessible(
                                        PLATFORM_FEATURES.GET_SALES
                                    )
                                        ? "flex"
                                        : "none",
                                    marginTop: -10,
                                },
                            }}
                        />

                        <Drawer.Screen
                            name="(quotations)"
                            options={{
                                drawerLabel: capitalizeText(
                                    i18n.t("quotations")
                                ),
                                headerTitle: () => (
                                    <CustomNavHeader
                                        mainHeading={i18n.t("quotations")}
                                        subHeading={
                                            selectedCompany?.companyName || ""
                                        }
                                    />
                                ),
                                drawerItemStyle: {
                                    display: isFeatureAccessible(
                                        PLATFORM_FEATURES.GET_QUOTATIONS
                                    )
                                        ? "flex"
                                        : "none",
                                    marginTop: -10,
                                },
                            }}
                        />

                        <Drawer.Screen
                            name="(itemtransfers)"
                            options={{
                                drawerLabel: capitalizeText(
                                    i18n.t("itemTransfers")
                                ),
                                headerTitle: () => (
                                    <CustomNavHeader
                                        mainHeading={i18n.t("itemTransfers")}
                                        subHeading={
                                            selectedCompany?.companyName || ""
                                        }
                                    />
                                ),
                                drawerItemStyle: {
                                    display: isFeatureAccessible(
                                        PLATFORM_FEATURES.GET_TRANSFERS
                                    )
                                        ? "flex"
                                        : "none",
                                    marginTop: -10,
                                },
                            }}
                        />

                        <Drawer.Screen
                            name="(reports)"
                            options={{
                                drawerLabel: capitalizeText(i18n.t("reports")),
                                headerTitle: () => (
                                    <CustomNavHeader
                                        mainHeading={i18n.t("reports")}
                                        subHeading={
                                            selectedCompany?.companyName || ""
                                        }
                                    />
                                ),
                                drawerItemStyle: {
                                    display: isFeatureAccessible(
                                        PLATFORM_FEATURES.GENERATE_REPORTS
                                    )
                                        ? "flex"
                                        : "none",
                                    marginTop: -10,
                                },
                            }}
                        />
                    </Drawer>
                </GestureHandlerRootView>
            )}
        </>
    );
};

const styles = StyleSheet.create({
    drawerContainer: {
        padding: 16,
    },
    drawerHeaderContainer: {
        rowGap: 16,
        marginBottom: 22,
    },
    userDetailsContainer: {
        rowGap: 2,
    },
    logoutContainer: {
        flexDirection: "row",
        columnGap: 4,
        alignItems: "center",
        alignSelf: "flex-start",
    },
    logoutIcon: {
        width: 24,
        height: 24,
    },
    hamburgerIcon: {
        width: 24,
        height: 24,
        marginLeft: 16,
    },
});

export default CompanyMainLayout;
