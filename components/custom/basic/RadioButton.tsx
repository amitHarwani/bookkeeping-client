import RadioButtonSelected from "@/assets/images/radio_button_selected.png";
import RadioButtonUnSelected from "@/assets/images/radio_button_unselected.png";
import { GenericObject } from "@/constants/types";
import { commonStyles } from "@/utils/common_styles";
import React, { useEffect, useState } from "react";
import {
    FlatList,
    Image,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

interface RadioButtonProps {
    label?: string;
    data?: Array<GenericObject>;
    onChange?(item: GenericObject): void;
    textKey: string;
    value?: GenericObject;
    errorMessage?: string | null;
    isDisabled?: boolean;
}
const RadioButton = ({
    label,
    data,
    onChange,
    textKey,
    value,
    errorMessage,
    isDisabled = false,
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
            {label && (
                <Text
                    style={[
                        commonStyles.textSmallBold,
                        commonStyles.capitalize,
                    ]}
                >
                    {label}
                </Text>
            )}
            <View>
                <FlatList
                    data={data}
                    horizontal={true}
                    ItemSeparatorComponent={() => (
                        <View style={styles.separator} />
                    )}
                    renderItem={({ item }) => (
                        <Pressable
                            onPress={() => selectItem(item)}
                            style={styles.radioButtonItemContainer}
                            disabled={isDisabled}
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
                            <Text
                                style={[
                                    commonStyles.textSmallBold,
                                    commonStyles.textDarkGray,
                                    commonStyles.capitalize,
                                ]}
                            >
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
    separator: {
        width: 16,
    },
    radioButtonItemContainer: {
        flexDirection: "row",
        columnGap: 8,
        alignItems: "center",
    },
    radioButtonImage: {
        width: 16,
        height: 16,
    },
});
