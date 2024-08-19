import { i18n } from "@/app/_layout";
import CustomButton from "@/components/custom/basic/CustomButton";
import LoadingSpinnerOverlay from "@/components/custom/basic/LoadingSpinnerOverlay";
import { fonts } from "@/constants/fonts";
import UserService from "@/services/user/user_service";
import { useAppDispatch, useAppSelector } from "@/store";
import { capitalizeText, getApiErrorMessage } from "@/utils/common_utils";
import {
    DrawerContentScrollView,
    DrawerItem,
    DrawerItemList,
} from "@react-navigation/drawer";
import { useMutation } from "@tanstack/react-query";
import { Href, router } from "expo-router";
import { Drawer } from "expo-router/drawer";
import React, { useEffect, useMemo } from "react";
import {
    Pressable,
    Text,
    ToastAndroid,
    View,
    StyleSheet,
    Image,
    TouchableOpacity,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import LogoutIcon from "@/assets/images/logout_icon.png";
import { AppRoutes } from "@/constants/routes";
import { logOut } from "@/store/AuthSlice";
import { deleteValueFromSecureStore } from "@/utils/securestore";
import { SecureStoreKeys } from "@/constants/securestorekeys";
import CustomNavHeader from "@/components/custom/business/CustomNavHeader";
import HamburgerIcon from "@/assets/images/hamburger_icon.png";

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
                    <Text style={styles.fullName}>{userDetails?.fullName}</Text>
                    <Text style={styles.companyName}>
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
                    <Text style={styles.logoutText}>{i18n.t("logout")}</Text>
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
    return (
        <>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <Drawer
                    drawerContent={CustomDrawer}
                    screenOptions={({ navigation }) => ({
                        drawerActiveTintColor: "#006FFD",
                        drawerActiveBackgroundColor: "#FFFFFF",
                        drawerItemStyle: { marginBottom: -5 },
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
                        name="dashboard"
                        options={{
                            drawerLabel: capitalizeText(i18n.t("dashboard")),
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
                                    subHeading={selectedCompany?.companyName || ""}
                                />
                            ),
                        }}
                    />
                </Drawer>
            </GestureHandlerRootView>
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
    fullName: {
        fontFamily: fonts.Inter_Black,
        fontSize: 24,
    },
    companyName: {
        fontFamily: fonts.Inter_Bold,
        fontSize: 12,
        color: "#8F9098",
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
    logoutText: {
        color: "#006FFD",
        fontFamily: fonts.Inter_Bold,
        fontSize: 12,
        textTransform: "capitalize",
    },
});

export default CompanyMainLayout;
