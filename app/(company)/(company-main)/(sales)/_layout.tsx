import { View, Text, TouchableOpacity, Image } from "react-native";
import React, { useCallback, useEffect } from "react";
import { useAppSelector } from "@/store";
import { router, Stack, useNavigation, usePathname } from "expo-router";
import { AppRoutes } from "@/constants/routes";
import BackIcon from "@/assets/images/back_icon.png";
import { commonStyles } from "@/utils/common_styles";
import CustomNavHeader from "@/components/custom/business/CustomNavHeader";
import { i18n } from "@/app/_layout";
import { CommonActions } from "@react-navigation/native";

const SaleLayout = () => {
    const selectedCompany = useAppSelector(
        (state) => state.company.selectedCompany
    );

    const navigator = useNavigation();
    const pathName = usePathname();

    useEffect(() => {
        /* Hiding the drawer header for certain paths*/
        if (
            pathName.includes(`${AppRoutes.addSale}`) ||
            pathName.includes(`${AppRoutes.getSale}`) ||
            pathName.includes(`${AppRoutes.addSaleReturn}`) || 
            pathName.includes(`${AppRoutes.getReturnsOfSale}`)
        ) {
            navigator.setOptions({ headerShown: false });
        } else {
            /* Else showing it */
            navigator.setOptions({ headerShown: true });
        }
    }, [pathName]);

    /* To reset the stack navigator to sales screen, when going back
        Since there is a navigation from dashboard to /add-sales, and hence going back
        the reset to sales needs to be done
    */
    const reset = useCallback(() => {
        navigator.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [{ name: "sales" }],
            })
        );
    }, []);
    return (
        <Stack
            screenOptions={({ navigation }) => ({
                headerLeft: () => (
                    <TouchableOpacity
                        onPress={() => {
                            reset();
                            navigation.goBack();
                        }}
                    >
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
            <Stack.Screen name="sales" options={{ headerShown: false }} />
            <Stack.Screen
                name="add-sale"
                options={{
                    headerTitle: () => (
                        <CustomNavHeader
                            mainHeading={i18n.t("addSale")}
                            subHeading={selectedCompany?.companyName || ""}
                        />
                    ),
                }}
            />
            <Stack.Screen
                name="add-sale-return/[saleId]"
                options={{
                    headerTitle: () => (
                        <CustomNavHeader
                            mainHeading={i18n.t("addSaleReturn")}
                            subHeading={selectedCompany?.companyName || ""}
                        />
                    ),
                }}
            />

            <Stack.Screen name="get-sale/[saleId]" />
            <Stack.Screen name="get-returns-of-sale/[saleId]" />
        </Stack>
    );
};

export default SaleLayout;
