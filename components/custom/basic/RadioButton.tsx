import {
    FlatList,
    Image,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { GenericObject } from "@/constants/types";
import { fonts } from "@/constants/fonts";
import RadioButtonSelected from "@/assets/images/radio_button_selected.png";
import RadioButtonUnSelected from "@/assets/images/radio_button_unselected.png";

interface RadioButtonProps {
    label?: string;
    data?: Array<GenericObject>;
    onChange?(item: GenericObject): void;
    textKey: string;
    value?: GenericObject;
    errorMessage?: string | null;
}
const RadioButton = ({
    label,
    data,
    onChange,
    textKey,
    value,
    errorMessage,
}: RadioButtonProps) => {
    const [selectedItem, setSelectedItem] = useState<GenericObject>();

    /* Select item handler */
    const selectItem = (item: GenericObject) => {
        /* Set selected item state, call parent function */
        setSelectedItem(item);
        if (typeof onChange === "function") {
            onChange(item);
        }
    };
    /* For default values */
    useEffect(() => {
        if (value) {
            setSelectedItem(value);
        }
    }, [value]);

    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}
            <View>
                <FlatList
                    data={data}
                    horizontal={true}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                    renderItem={({ item }) => (
                        <Pressable
                            onPress={() => selectItem(item)}
                            style={styles.radioButtonItemContainer}
                        >
                            <Image
                                source={
                                    item === selectedItem
                                        ? RadioButtonSelected
                                        : RadioButtonUnSelected
                                }
                                resizeMode="contain"
                                style={styles.radioButtonImage}
                            />
                            <Text style={styles.radioButtonText}>
                                {item[textKey]}
                            </Text>
                        </Pressable>
                    )}
                />
            </View>
        </View>
    );
};

export default RadioButton;

const styles = StyleSheet.create({
    container: {
        rowGap: 12,
    },
    label: {
        fontFamily: fonts.Inter_Bold,
        fontSize: 12,
        textTransform: "capitalize",
    },
    separator: {
        width: 16,
    },
    radioButtonItemContainer: {
        flexDirection: "row",
        columnGap: 8,
        alignItems: "center"
    },
    radioButtonImage: {
        width: 16,
        height: 16
    },
    radioButtonText: {
        fontFamily: fonts.Inter_Bold,
        fontSize: 12,
        color: "#71727A",
        textTransform: "capitalize",
    },
});
