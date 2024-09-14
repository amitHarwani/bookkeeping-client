import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import React, { useMemo } from "react";
import ReceiptAddIcon from "@/assets/images/receipt_add_icon.png";
import ReceiptSubtractIcon from "@/assets/images/receipt_minus_icon.png";
import ReceiptItemIcon from "@/assets/images/receipt_item_icon.png";
import { i18n } from "@/app/_layout";
import { commonStyles } from "@/utils/common_styles";
import { Href, router } from "expo-router";
import { AppRoutes } from "@/constants/routes";
import { QuickActionTypes } from "@/constants/types";

interface QuickActionButtonProps {
    type: QuickActionTypes;
}

const QuickActionButton = ({ type }: QuickActionButtonProps) => {
    /* Icon to display */
    const iconSource = useMemo(() => {
        switch (type) {
            case "SALE":
                return ReceiptAddIcon;
            case "PURCHASE":
                return ReceiptSubtractIcon;
            case "ITEMS":
                return ReceiptItemIcon;
        }
    }, [type]);

    /* Text */
    const textDisplayed = useMemo(() => {
        switch (type) {
            case "SALE":
                return i18n.t("sale");
            case "PURCHASE":
                return i18n.t("purchase");
            case "ITEMS":
                return i18n.t("items");
        }
    }, [type]);

    /* On press route to appropriate screen based on type */
    const onPress = () => {
        switch (type) {
            case "SALE":
                router.push(`${AppRoutes.addSale}` as Href);
                break;
            case "PURCHASE":
                router.push(`${AppRoutes.addPurchase}` as Href);
                break;
            case "ITEMS":
                router.push(`${AppRoutes.items}` as Href);
                break;
        }
    };
    return (
        <Pressable style={styles.mainContainer} onPress={onPress}>
            <View style={styles.container}>
                <Image source={iconSource} style={styles.icon} />
                <Text
                    style={[
                        commonStyles.textSmallMedium,
                        commonStyles.capitalize,
                        commonStyles.textBlue,
                    ]}
                >
                    {textDisplayed}
                </Text>
            </View>
        </Pressable>
    );
};

export default QuickActionButton;

const styles = StyleSheet.create({
    mainContainer: {
        borderWidth: 1.5,
        borderColor: "#006FFD",
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        width: 74,
        height: 65
    },
    container: {
        rowGap: 8,
        alignItems: "center",
        // borderWidth: 1
    },
    icon: {
        width: 18,
        height: 18,
    },
});
