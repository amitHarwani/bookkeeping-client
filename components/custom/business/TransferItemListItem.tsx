import { TransferItem } from "@/services/inventory/inventory_types";
import { commonStyles } from "@/utils/common_styles";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface TransferItemListItemProps {
    item: TransferItem;
}
const TransferItemListItem = ({ item }: TransferItemListItemProps) => {
    return (
        <View style={styles.container}>
            <View style={styles.itemDetailsContainer}>
                <View>
                    <Text
                        style={[commonStyles.textSmallBold, styles.itemName]}
                        numberOfLines={2}
                    >
                        {item.itemName}
                    </Text>
                    <Text
                        style={[
                            commonStyles.textSmallSemiBold,
                            commonStyles.textGray,
                            styles.unit,
                        ]}
                    >{`${item.unitsTransferred} ${item?.unitName}`}</Text>
                </View>
            </View>
        </View>
    );
};

export default TransferItemListItem;

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        backgroundColor: "#F8F9FE",
        alignItems: "center",
        paddingHorizontal: 10,
        paddingVertical: 12,
        borderRadius: 12,
        columnGap: 20,
    },
    itemName: {
        maxWidth: "75%",
    },
    itemDetailsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        flex: 1,
        alignItems: "center",
    },
    unit: {
        marginTop: 4,
    },
});
