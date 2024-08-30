import { View, Text, TouchableOpacity, Image } from "react-native";
import React, { useEffect } from "react";
import { useAppSelector } from "@/store";
import { Stack, useNavigation, usePathname } from "expo-router";
import { AppRoutes } from "@/constants/routes";
import BackIcon from "@/assets/images/back_icon.png";
import { commonStyles } from "@/utils/common_styles";
import CustomNavHeader from "@/components/custom/business/CustomNavHeader";
import { i18n } from "@/app/_layout";

const PurchaseLayout = () => {
    const selectedCompany = useAppSelector(
        (state) => state.company.selectedCompany
    );

    const navigator = useNavigation();
    const pathName = usePathname();

    useEffect(() => {
        /* Hiding the drawer header when pathname is add or get party */
        if (
            pathName.includes(`${AppRoutes.addPurchase}`) ||
            pathName.includes(`${AppRoutes.getPurchase}`)
        ) {
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
            <Stack.Screen name="purchases" options={{ headerShown: false }} />
            <Stack.Screen
                name="add-purchase"
                options={{
                    headerTitle: () => (
                        <CustomNavHeader
                            mainHeading={i18n.t("addPurchase")}
                            subHeading={selectedCompany?.companyName || ""}
                        />
                    ),
                }}
            />

            <Stack.Screen name="get-purchase/[purchaseId]" />
        </Stack>
    );
};

export default PurchaseLayout;
