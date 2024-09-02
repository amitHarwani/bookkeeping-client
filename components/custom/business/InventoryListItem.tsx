import { fonts } from "@/constants/fonts";
import { ItemTypeInItemsList } from "@/constants/types";
import { Item } from "@/services/inventory/inventory_types";
import { commonStyles } from "@/utils/common_styles";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface InventoryListItemProps {
    item: ItemTypeInItemsList;
    onPress: (item: ItemTypeInItemsList) => void;
}
const InventoryListItem = ({ item, onPress }: InventoryListItemProps) => {
    return (
        <Pressable onPress={() => onPress(item)}>
            <View style={styles.itemContainer}>
                <Text
                    style={[commonStyles.textMedium, styles.itemName]}
                    numberOfLines={2}
                >
                    {item.itemName}
                </Text>
                <Text
                    style={[commonStyles.textSmall, commonStyles.textDarkGray]}
                >{`${item.stock} ${item.unitName}`}</Text>
            </View>
        </Pressable>
    );
};

export default InventoryListItem;

const styles = StyleSheet.create({
    itemContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    itemName: {
        maxWidth: "75%",
    },
});
