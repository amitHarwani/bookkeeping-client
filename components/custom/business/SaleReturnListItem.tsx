import {
    dateTimeFormat24hr,
    displayedDateTimeFormat,
} from "@/constants/datetimes";
import { SaleReturn } from "@/services/billing/billing_types";
import { useAppSelector } from "@/store";
import { commonStyles } from "@/utils/common_styles";
import { convertUTCStringToTimezonedDate } from "@/utils/common_utils";
import moment from "moment";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface SaleReturnListItemProps {
    saleReturn: SaleReturn;
    onPress(saleReturn: SaleReturn): void;
}
const SaleReturnListItem = ({
    saleReturn,
    onPress,
}: SaleReturnListItemProps) => {
    const country = useAppSelector((state) => state.company.country);

    return (
        <Pressable onPress={() => onPress(saleReturn)} style={styles.container}>
            <View>
                <Text style={[commonStyles.textSmall]}>
                    {moment(
                        convertUTCStringToTimezonedDate(
                            saleReturn.createdAt,
                            dateTimeFormat24hr,
                            country?.timezone as string
                        )
                    ).format(displayedDateTimeFormat)}
                </Text>
            </View>
            <Text
                style={[commonStyles.textSmall, commonStyles.textDarkGray]}
                numberOfLines={2}
            >
                {country?.currency}
                {saleReturn?.totalAfterTax}
            </Text>
        </Pressable>
    );
};

export default SaleReturnListItem;

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
});
