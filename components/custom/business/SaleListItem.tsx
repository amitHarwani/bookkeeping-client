import { i18n } from "@/app/_layout";
import { SaleTypeInSalesList } from "@/constants/types";
import { useAppSelector } from "@/store";
import { commonStyles } from "@/utils/common_styles";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface SaleListItemProps {
    sale: SaleTypeInSalesList;
    onPress(sale: SaleTypeInSalesList): void;
}
const SaleListItem = ({ sale, onPress }: SaleListItemProps) => {
    const country = useAppSelector((state) => state.company.country);
    return (
        <Pressable onPress={() => onPress(sale)} style={styles.container}>
            <View>
                <Text style={[commonStyles.textSmall]}>
                    {sale.partyName || i18n.t("na")}
                </Text>
                <Text style={[commonStyles.textSmall]}>
                    {sale.invoiceNumber}
                </Text>
            </View>
            <Text
                style={[commonStyles.textSmall, commonStyles.textDarkGray]}
                numberOfLines={2}
            >
                {country?.currency}
                {sale.totalAfterTax}
            </Text>
        </Pressable>
    );
};

export default SaleListItem;

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
});
