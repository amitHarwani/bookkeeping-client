import { Pressable, StyleSheet, Text, View } from "react-native";
import React from "react";
import { Purchase, ThirdParty } from "@/services/billing/billing_types";
import { fonts } from "@/constants/fonts";
import { useAppSelector } from "@/store";
import { commonStyles } from "@/utils/common_styles";

interface PurchaseListItemProps {
    purchase: Purchase;
    onPress(purchase: Purchase): void;
}
const PurchaseListItem = ({ purchase, onPress }: PurchaseListItemProps) => {
    const country = useAppSelector((state) => state.company.country);
    return (
        <Pressable onPress={() => onPress(purchase)} style={styles.container}>
            <View>
                <Text style={[commonStyles.textSmall]}>
                    {purchase.partyName}
                </Text>
                <Text style={[commonStyles.textSmall]}>
                    {purchase.invoiceNumber}
                </Text>
            </View>
            <Text
                style={[commonStyles.textSmall, commonStyles.textDarkGray]}
                numberOfLines={2}
            >
                {country?.currency}
                {purchase.totalAfterTax}
            </Text>
        </Pressable>
    );
};

export default PurchaseListItem;

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
});
