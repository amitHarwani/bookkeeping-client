import { i18n } from "@/app/_layout";
import {
    QuotationTypeInQuotationsList
} from "@/constants/types";
import { useAppSelector } from "@/store";
import { commonStyles } from "@/utils/common_styles";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface QuotationListItemProps {
    quotation: QuotationTypeInQuotationsList;
    onPress(quotation: QuotationTypeInQuotationsList): void;
}
const QuotationListItem = ({ quotation, onPress }: QuotationListItemProps) => {
    const country = useAppSelector((state) => state.company.country);
    return (
        <Pressable onPress={() => onPress(quotation)} style={styles.container}>
            <View>
                <Text style={[commonStyles.textSmall]}>
                    {quotation.partyName || i18n.t("na")}
                </Text>
                <Text style={[commonStyles.textSmall]}>
                    {quotation.quotationNumber}
                </Text>
            </View>
            <Text
                style={[commonStyles.textSmall, commonStyles.textDarkGray]}
                numberOfLines={2}
            >
                {country?.currency}
                {quotation.totalAfterTax}
            </Text>
        </Pressable>
    );
};

export default QuotationListItem;

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
});
