import { View, Text, TouchableOpacity, Image } from "react-native";
import React, { useCallback, useEffect } from "react";
import { useAppSelector } from "@/store";
import { Stack, useNavigation, usePathname } from "expo-router";
import { AppRoutes } from "@/constants/routes";
import BackIcon from "@/assets/images/back_icon.png";
import { commonStyles } from "@/utils/common_styles";
import CustomNavHeader from "@/components/custom/business/CustomNavHeader";
import { i18n } from "@/app/_layout";
import { CommonActions } from "@react-navigation/native";

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

    /* To reset the stack navigator to purchases screen, when going back
        Since there is a navigation from dashboard to /add-purchases, and hence going back
        the reset to purchases needs to be done
    */
    const reset = useCallback(() => {
        navigator.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [{ name: "purchases" }],
            })
        );
    }, []);
    return (
        <Stack
            screenOptions={({ navigation }) => ({
                headerLeft: () => (
                    <TouchableOpacity onPress={() => {
                        reset();
                        navigation.goBack()
                    }}>
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
