import { i18n } from "@/app/_layout";
import CustomNavHeader from "@/components/custom/business/CustomNavHeader";
import { useAppSelector } from "@/store";
import { Stack, useNavigation, usePathname } from "expo-router";
import React, { useEffect } from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import BackIcon from "@/assets/images/back_icon.png";
import { AppRoutes } from "@/constants/routes";

const ItemsLayout = () => {
    const selectedCompany = useAppSelector(
        (state) => state.company.selectedCompany
    );

    const navigator = useNavigation();
    const pathName = usePathname();

    useEffect(() => {
        /* Hiding the drawer header when pathname is addItem */
        if (pathName.includes(`${AppRoutes.addItem}`)) {
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
                        <Image style={styles.backIcon} source={BackIcon} />
                    </TouchableOpacity>
                ),
                headerStyle: {
                    backgroundColor: "#FFFFFF",
                },
                headerShadowVisible: false,
                headerBackVisible: false,
            })}
        >
            <Stack.Screen name="items" options={{ headerShown: false }} />
            <Stack.Screen
                name="add-item"
                options={{
                    headerTitle: () => (
                        <CustomNavHeader
                            mainHeading={i18n.t("addItem")}
                            subHeading={selectedCompany?.companyName || ""}
                        />
                    ),
                }}
            />
        </Stack>
    );
};

const styles = StyleSheet.create({
    backIcon: {
        width: 24,
        height: 24,
        marginRight: 16,
    },
});

export default ItemsLayout;
