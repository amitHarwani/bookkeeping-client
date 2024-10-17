import MinusIcon from "@/assets/images/minus_icon.png";
import { ReturnItemType } from "@/constants/types";
import { useAppSelector } from "@/store";
import { commonStyles } from "@/utils/common_styles";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

interface SaleReturnListItemProps {
    item: ReturnItemType;
    removeItem(item: ReturnItemType): void;
    onReturnItemSelected(item: ReturnItemType): void;
    isDisabled?: boolean;
}
const SaleReturnListItem = ({
    item,
    removeItem,
    onReturnItemSelected,
    isDisabled = false,
}: SaleReturnListItemProps) => {
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
                onPress={() => onReturnItemSelected(item)}
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
                    >{`${item.unitsReturned}${item.item?.unitName} * ${item.pricePerUnit}`}</Text>
                </View>
                <Text
                    style={[
                        commonStyles.textSmallSemiBold,
                        commonStyles.textGray,
                    ]}
                >{`${companyState.country?.currency} ${item.totalAfterTax}`}</Text>
            </Pressable>
        </View>
    );
};

export default SaleReturnListItem;

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
