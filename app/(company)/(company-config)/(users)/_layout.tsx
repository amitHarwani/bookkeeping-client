import { i18n } from "@/app/_layout";
import BackIcon from "@/assets/images/back_icon.png";
import CustomNavHeader from "@/components/custom/business/CustomNavHeader";
import { AppRoutes } from "@/constants/routes";
import { useAppSelector } from "@/store";
import { commonStyles } from "@/utils/common_styles";
import { Stack, useNavigation, usePathname } from "expo-router";
import React, { useEffect } from "react";
import { Image, TouchableOpacity } from "react-native";

const UsersLayout = () => {

    /* Selected company from redux */
    const selectedCompany = useAppSelector(
        (state) => state.company.selectedCompany
    );

    /* Tab layout navigation */
    const navigation = useNavigation();

    /* To get the path name */
    const path = usePathname();

    /* Hide header of tab layout when on add or get user path
    To show stack navigation header with back icon in this case */
    useEffect(() => {
        if (
            path.includes(AppRoutes.addUser) ||
            path.includes(AppRoutes.getUser)
        ) {
            navigation.setOptions({ headerShown: false });
        } else {
            navigation.setOptions({ headerShown: true });
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
            <Stack.Screen name="users" options={{ headerShown: false }} />
            <Stack.Screen
                name="add-user"
                options={{
                    headerTitle: () => (
                        <CustomNavHeader
                            mainHeading={i18n.t("addUser")}
                            subHeading={selectedCompany?.companyName || ""}
                        />
                    ),
                }}
            />
            <Stack.Screen name="get-user/[userId]" />
        </Stack>
    );
};

export default UsersLayout;
