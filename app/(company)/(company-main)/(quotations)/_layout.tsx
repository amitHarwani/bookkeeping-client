import { i18n } from "@/app/_layout";
import BackIcon from "@/assets/images/back_icon.png";
import CustomNavHeader from "@/components/custom/business/CustomNavHeader";
import { AppRoutes } from "@/constants/routes";
import { useAppSelector } from "@/store";
import { commonStyles } from "@/utils/common_styles";
import { Stack, useNavigation, usePathname } from "expo-router";
import React, { useEffect } from "react";
import { Image, TouchableOpacity } from "react-native";

const QuotationLayout = () => {
    const selectedCompany = useAppSelector(
        (state) => state.company.selectedCompany
    );

    const navigator = useNavigation();
    const pathName = usePathname();

    useEffect(() => {
        /* Hiding the drawer header when pathname is add or get quotation */
        if (
            pathName.includes(`${AppRoutes.addQuotation}`) ||
            pathName.includes(`${AppRoutes.getQuotation}`)
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
            <Stack.Screen name="quotations" options={{ headerShown: false }} />
            <Stack.Screen
                name="add-quotation"
                options={{
                    headerTitle: () => (
                        <CustomNavHeader
                            mainHeading={i18n.t("addQuotation")}
                            subHeading={selectedCompany?.companyName || ""}
                        />
                    ),
                }}
            />

            <Stack.Screen name="get-quotation/[quotationId]" />
        </Stack>
    );
};

export default QuotationLayout;
