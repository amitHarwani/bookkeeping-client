import { i18n } from "@/app/_layout";
import BackIcon from "@/assets/images/back_icon.png";
import CustomNavHeader from "@/components/custom/business/CustomNavHeader";
import { AppRoutes } from "@/constants/routes";
import { useAppSelector } from "@/store";
import { commonStyles } from "@/utils/common_styles";
import { Stack, useNavigation, usePathname } from "expo-router";
import React, { useEffect } from "react";
import { Image, StyleSheet, TouchableOpacity } from "react-native";

const DashboardLayout = () => {
    const selectedCompany = useAppSelector(
        (state) => state.company.selectedCompany
    );
    const navigator = useNavigation();
    const pathName = usePathname();

    useEffect(() => {
        /* Hiding the drawer header when pathname is get low stock items */
        if (pathName.includes(`${AppRoutes.getLowStockItems}`)) {
            navigator.setOptions({ headerShown: false });
        } else {
            /* Else showing it */
            navigator.setOptions({ headerShown: true });
        }
    }, [pathName]);

    return (
        <Stack
            screenOptions={({ navigation }) => ({
                headerLeft: () => (
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Image
                            style={commonStyles.hamburgerBackIcon}
                            source={BackIcon}
                        />
                    </TouchableOpacity>
                ),
                headerStyle: {
                    backgroundColor: "#FFFFFF",
                },
                headerShadowVisible: false,
                headerBackVisible: false,
            })}
        >
            <Stack.Screen name="dashboard" options={{ headerShown: false }} />
            <Stack.Screen
                name="get-low-stock-items"
                options={{
                    headerTitle: () => (
                        <CustomNavHeader
                            mainHeading={i18n.t("lowStockItems")}
                            subHeading={selectedCompany?.companyName || ""}
                        />
                    ),
                }}
            />
        </Stack>
    );
};

const style = StyleSheet.create({});

export default DashboardLayout;
