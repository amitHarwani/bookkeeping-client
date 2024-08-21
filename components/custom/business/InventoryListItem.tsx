import { Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Item } from '@/services/inventory/inventory_types'
import { fonts } from '@/constants/fonts'


interface InventoryListItemProps {
    item: Item
}
const InventoryListItem = ({item}: InventoryListItemProps) => {
  return (
    <Pressable>
        <View style={styles.itemContainer}>
            <Text style={styles.itemName}>{item.itemName}</Text>
            <Text style={styles.itemStock}>{`${item.stock} ${item.unitName}`}</Text>
        </View>
    </Pressable>
  )
}

export default InventoryListItem

const styles = StyleSheet.create({
    itemContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between"
    },
    itemName: {
        fontFamily: fonts.Inter_Regular,
        fontSize: 14
    },
    itemStock: {
        fontFamily: fonts.Inter_Regular,
        fontSize: 12,
        color: "#71727A"
    }
})