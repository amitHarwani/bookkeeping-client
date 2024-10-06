import { i18n } from "@/app/_layout";
import CustomNavHeader from "@/components/custom/business/CustomNavHeader";
import { useAppSelector } from "@/store";
import { Stack, useNavigation, usePathname } from "expo-router";
import React, { useEffect } from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import BackIcon from "@/assets/images/back_icon.png";
import { AppRoutes } from "@/constants/routes";
import { commonStyles } from "@/utils/common_styles";

const PartiesLayout = () => {
    const selectedCompany = useAppSelector(
        (state) => state.company.selectedCompany
    );

    const navigator = useNavigation();
    const pathName = usePathname();

    useEffect(() => {
        /* Hiding the drawer header when pathname is add or get party */
        if (pathName.includes(`${AppRoutes.addParty}`) || pathName.includes(`${AppRoutes.getParty}`)) {
            navigator.setOptions({ headerShown: false });
        } 
        else {
            /* Else showing it */
            navigator.setOptions({ headerShown: true });
        }
    }, [pathName]);

    return (
        <Stack
            screenOptions={({ navigation }) => ({
                headerLeft: () => (
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Image style={[commonStyles.backIcon, {marginRight: 16}]} source={BackIcon} />
                    </TouchableOpacity>
                ),
                headerStyle: {
                    backgroundColor: "#FFFFFF",
                },
                headerShadowVisible: false,
                headerBackVisible: false,
            })}
        >
            <Stack.Screen name="parties" options={{ headerShown: false }} />
            <Stack.Screen
                name="add-party"
                options={{
                    headerTitle: () => (
                        <CustomNavHeader
                            mainHeading={i18n.t("addParty")}
                            subHeading={selectedCompany?.companyName || ""}
                        />
                    ),
                }}
            />

            <Stack.Screen 
                name="get-party/[partyId]"
            />
        </Stack>
    );
};

const styles = StyleSheet.create({
    
});

export default PartiesLayout;
