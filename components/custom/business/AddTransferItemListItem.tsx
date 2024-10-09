import MinusIcon from "@/assets/images/minus_icon.png";
import { TransferItemType } from "@/constants/types";
import { useAppSelector } from "@/store";
import { commonStyles } from "@/utils/common_styles";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

interface AddTransferItemListItemProps {
    item: TransferItemType;
    removeItem(item: TransferItemType): void;
    onTransferItemSelected(item: TransferItemType): void;
    isDisabled?: boolean;
}
const AddTransferItemListItem = ({
    item,
    removeItem,
    onTransferItemSelected,
    isDisabled = false,
}: AddTransferItemListItemProps) => {
    const companyState = useAppSelector((state) => state.company);

    return (
        <View style={styles.container}>
            <Pressable onPress={() => removeItem(item)} disabled={isDisabled}>
                <Image
                    source={MinusIcon}
                    style={styles.minusIcon}
                    resizeMode="contain"
                />
            </Pressable>
            <Pressable
                style={styles.itemDetailsContainer}
                onPress={() => onTransferItemSelected(item)}
                disabled={isDisabled}
            >
                <View>
                    <Text style={[commonStyles.textSmallBold, styles.itemName]} numberOfLines={2}>
                        {item.item?.itemName}
                    </Text>
                    <Text
                        style={[
                            commonStyles.textSmallSemiBold,
                            commonStyles.textGray,
                            styles.unit,
                        ]}
                    >{`${item.unitsTransferred} ${item.item?.unitName}`}</Text>
                </View>
            </Pressable>
        </View>
    );
};

export default AddTransferItemListItem;

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
    minusIcon: {
        width: 12,
        height: 12,
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
