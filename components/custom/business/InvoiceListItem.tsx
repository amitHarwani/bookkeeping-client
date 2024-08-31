import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import React from "react";
import { InvoiceItem } from "@/constants/types";
import MinusIcon from "@/assets/images/minus_icon.png";
import { fonts } from "@/constants/fonts";
import { useAppSelector } from "@/store";

interface InvoiceListItemProps {
    item: InvoiceItem;
    removeItem(item: InvoiceItem): void;
    onInvoiceItemSelected(item: InvoiceItem): void;
}
const InvoiceListItem = ({ item, removeItem, onInvoiceItemSelected }: InvoiceListItemProps) => {

    const companyState = useAppSelector(state => state.company);
    
    return (
        <View style={styles.container}>
            <Pressable onPress={() => removeItem(item)}>
                <Image
                    source={MinusIcon}
                    style={styles.minusIcon}
                    resizeMode="contain"
                />
            </Pressable>
            <Pressable style={styles.itemDetailsContainer} onPress={() => onInvoiceItemSelected(item)}>
                    <View>
                        <Text style={styles.itemName}>
                            {item.item?.itemName}
                        </Text>
                        <Text
                            style={styles.unit}
                        >{`${item.units}${item.item?.unitName} * ${item.pricePerUnit}`}</Text>
                    </View>
                    <Text style={styles.total}>{`${companyState.country?.currency} ${item.totalAfterTax}`}</Text>
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
        columnGap: 20
    },
    minusIcon: {
        width: 12,
        height: 12,
    },
    itemDetailsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        flex: 1,
        alignItems: "center"
    },
    itemName: {
        fontFamily: fonts.Inter_Bold,
        fontSize: 12,
    },
    unit: {
        fontFamily: fonts.Inter_SemiBold,
        fontSize: 12,
        color: "#8F9098",
        marginTop: 4
    },
    total: {
        fontFamily: fonts.Inter_SemiBold,
        fontSize: 12,
        color: "#8F9098",
    },
});
