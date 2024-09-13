import { i18n } from "@/app/_layout";
import { QuotationTypeInQuotationsList } from "@/constants/types";
import { useAppSelector } from "@/store";
import { commonStyles } from "@/utils/common_styles";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import TickIcon from "@/assets/images/tick_mark_icon_blue.png";

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
            <View style={styles.detailsContainer}>
                <Text
                    style={[commonStyles.textSmall, commonStyles.textDarkGray]}
                    numberOfLines={2}
                >
                    {`${country?.currency} ${quotation.totalAfterTax}`}
                </Text>
                {quotation.saleId && (
                    <Image
                        source={TickIcon}
                        style={styles.tickmarkIcon}
                    />
                )}
            </View>
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
    detailsContainer: {
        flexDirection: "row",
        alignItems: "center",
        columnGap: 4
    },
    tickmarkIcon: {
        width: 20, 
        height: 20,
        marginRight: 4
    }
});
