import { View, Text, TouchableOpacity, Image } from "react-native";
import React, { useEffect } from "react";
import { Stack, useNavigation, usePathname } from "expo-router";
import CustomNavHeader from "@/components/custom/business/CustomNavHeader";
import { i18n } from "@/app/_layout";
import { useAppSelector } from "@/store";
import BackIcon from "@/assets/images/back_icon.png";
import { commonStyles } from "@/utils/common_styles";
import { AppRoutes } from "@/constants/routes";

const RolesLayout = () => {
    const selectedCompany = useAppSelector(
        (state) => state.company.selectedCompany
    );
    const navigation = useNavigation();
    const path = usePathname();

    /* Hide header of tab layout when on add or get role path
    To show stack navigation header with back icon in this case */
    useEffect(() => {
        if (
            path.includes(AppRoutes.addRole) ||
            path.includes(AppRoutes.getRole)
        ) {
            navigation.setOptions({ headerShown: false });
        }
    }, [path]);
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
            <Stack.Screen name="roles" options={{ headerShown: false }} />
            <Stack.Screen
                name="add-role"
                options={{
                    headerTitle: () => (
                        <CustomNavHeader
                            mainHeading={i18n.t("addRole")}
                            subHeading={selectedCompany?.companyName || ""}
                        />
                    ),
                }}
            />
            <Stack.Screen name="get-role/[roleId]" />
        </Stack>
    );
};

export default RolesLayout;
