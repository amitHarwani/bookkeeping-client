import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import React from "react";
import { InvoiceItem } from "@/constants/types";
import MinusIcon from "@/assets/images/minus_icon.png";
import { fonts } from "@/constants/fonts";
import { useAppSelector } from "@/store";
import { commonStyles } from "@/utils/common_styles";

interface InvoiceListItemProps {
    item: InvoiceItem;
    removeItem(item: InvoiceItem): void;
    onInvoiceItemSelected(item: InvoiceItem): void;
    isDisabled?: boolean;
}
const InvoiceListItem = ({
    item,
    removeItem,
    onInvoiceItemSelected,
    isDisabled = false,
}: InvoiceListItemProps) => {
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
                onPress={() => onInvoiceItemSelected(item)}
                disabled={isDisabled}
            >
                <View>
                    <Text style={[commonStyles.textSmallBold]}>
                        {item.item?.itemName}
                    </Text>
                    <Text
                        style={[
                            commonStyles.textSmallSemiBold,
                            commonStyles.textGray,
                            styles.unit,
                        ]}
                    >{`${item.units}${item.item?.unitName} * ${item.pricePerUnit}`}</Text>
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

export default InvoiceListItem;

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
