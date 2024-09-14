import { Image, StyleSheet, Text, View } from "react-native";
import React from "react";
import { useAppSelector } from "@/store";
import { commonStyles } from "@/utils/common_styles";

interface CashSummaryItemProps {
    heading: string;
    amount: number;
    icon: number;
}
const CashSummaryItem = ({ heading, amount, icon }: CashSummaryItemProps) => {

    const decimalPoints = useAppSelector((state) => state.company.selectedCompany?.decimalRoundTo) as number;
    const currency = useAppSelector((state) => state.company.country?.currency);

    /* Decimal Points  */
 
    return (
        <View style={styles.container}>
            <View style={styles.headingContainer}>
                <Text
                    style={[
                        commonStyles.textSmallBold,
                        commonStyles.capitalize,
                    ]}
                >
                    {heading}
                </Text>
                <Image source={icon} style={styles.icon} />
            </View>
            <Text
                style={[commonStyles.textMediumXLBold, commonStyles.textGray]}
            >{`${currency} ${amount.toFixed(decimalPoints)}`}</Text>
        </View>
    );
};

export default CashSummaryItem;

const styles = StyleSheet.create({
    container: {
        borderRadius: 12,
        paddingTop: 12,
        paddingLeft: 12,
        paddingRight: 3,
        paddingBottom: 30,
        backgroundColor: "#F8F9FE",
        flex: 1
    },
    headingContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    icon: {
        width: 15,
        height: 15,
    },
});
