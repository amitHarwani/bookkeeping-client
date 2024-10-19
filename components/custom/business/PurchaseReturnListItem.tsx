import {
    dateTimeFormat24hr,
    displayedDateTimeFormat,
} from "@/constants/datetimes";
import { PurchaseReturn } from "@/services/billing/billing_types";
import { useAppSelector } from "@/store";
import { commonStyles } from "@/utils/common_styles";
import { convertUTCStringToTimezonedDate } from "@/utils/common_utils";
import moment from "moment";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface PurchaseReturnListItemProps {
    purchaseReturn: PurchaseReturn;
    onPress(purchaseReturn: PurchaseReturn): void;
}
const PurchaseReturnListItem = ({
    purchaseReturn,
    onPress,
}: PurchaseReturnListItemProps) => {
    const country = useAppSelector((state) => state.company.country);

    return (
        <Pressable
            onPress={() => onPress(purchaseReturn)}
            style={styles.container}
        >
            <View>
                <Text style={[commonStyles.textSmall]}>
                    {moment(
                        convertUTCStringToTimezonedDate(
                            purchaseReturn.createdAt,
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
                {purchaseReturn?.totalAfterTax}
            </Text>
        </Pressable>
    );
};

export default PurchaseReturnListItem;

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
});
