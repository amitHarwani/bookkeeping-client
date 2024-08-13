import {
    Button,
    FlatList,
    Image,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import React, { ChangeEvent, useCallback, useEffect, useState } from "react";
import { i18n } from "@/app/_layout";
import { fonts } from "@/constants/fonts";
import dropdownIcon from "@/assets/images/dropdown_icon.png";
import CustomModal from "./CustomModal";
import CustomButton from "./CustomButton";
import { commonStyles } from "@/utils/common_styles";

type GenericObject = {
    [key: string]: any;
};

interface DropdownProps {
    label: string;
    data?: Array<GenericObject>;
    textKey: string;
    onChange?(item?: GenericObject): void;
    value?: GenericObject;
    extraContainerStyles?: Object;
    errorMessage?: string | null;
}
const Dropdown = ({
    label,
    data,
    textKey,
    onChange,
    value,
    extraContainerStyles,
    errorMessage,
}: DropdownProps) => {
    const [isOptionsShown, setIsOptionsShown] = useState(false);
    const [selectedItem, setSelectedItem] = useState<GenericObject>();
    const [tempSelectedItem, setTempSelectedItem] = useState<GenericObject>();

    /* Toggles options menu */
    const toggleOptionsMenu = useCallback(
        () => setIsOptionsShown((prev) => !prev),
        [isOptionsShown]
    );

    /* Select Item temporarily in the modal */
    const selectItem = (item: GenericObject) => {
        setTempSelectedItem(item);
    };

    /* Confirm selection: Sets the selectedItems state */
    const confirmSelection = () => {
        setSelectedItem(tempSelectedItem);
        toggleOptionsMenu();

        /* On change of selected item, call the parent onChange handler */
        if (typeof onChange === "function") {
            onChange(tempSelectedItem);
        }
    };

    /* On cancel selection, setTempSelectedItem to the originally selected item */
    const cancelSelection = () => {
        setTempSelectedItem(selectedItem);
        toggleOptionsMenu();
    };

    /* In case of default value */
    useEffect(() => {
        if (value != selectedItem) {
            setSelectedItem(value);
            setTempSelectedItem(value);
        }
    }, [value]);

    return (
        <View style={[styles.container, extraContainerStyles]}>
            <Text style={styles.labelText}>{label}</Text>
            <Pressable
                style={[styles.dropdownButton, !!errorMessage && styles.errorDropdownButton]}
                onPress={toggleOptionsMenu}
            >
                <Text
                    style={[
                        styles.dropdownButtonText,
                        !selectedItem && styles.placeholderText,
                    ]}
                >
                    {selectedItem?.[textKey] || i18n.t("select")}
                </Text>
                <Image source={dropdownIcon} />
            </Pressable>
            {errorMessage && (
                <Text style={styles.errorText}>{errorMessage}</Text>
            )}
            <CustomModal
                visible={isOptionsShown}
                onRequestClose={toggleOptionsMenu}
                extraModalStyles={{ justifyContent: "flex-end" }}
                children={
                    <View style={commonStyles.modalEndMenuContainer}>
                        <Text style={commonStyles.modalEndMenuHeading}>
                            {i18n.t("selectCountry")}
                        </Text>
                        <View>
                            <FlatList
                                data={data}
                                renderItem={({ item }) => (
                                    <Pressable
                                        key={item[textKey]}
                                        style={[
                                            commonStyles.optionContainer,
                                            tempSelectedItem === item &&
                                                commonStyles.selectedOptionContainer,
                                        ]}
                                        onPress={() => selectItem(item)}
                                    >
                                        <Text
                                            style={[
                                                tempSelectedItem === item
                                                    ? commonStyles.selectedOptionText
                                                    : commonStyles.optionText,
                                            ]}
                                        >
                                            {item[textKey]}
                                        </Text>
                                    </Pressable>
                                )}
                                keyExtractor={(item) => item[textKey]}
                            />
                        </View>

                        <View style={commonStyles.modalEndActionsContainer}>
                            <CustomButton
                                text={i18n.t("cancel")}
                                onPress={cancelSelection}
                                extraContainerStyles={{ flex: 1 }}
                                isSecondaryButton
                            />
                            <CustomButton
                                text={i18n.t("ok")}
                                onPress={confirmSelection}
                                extraContainerStyles={{ flex: 1 }}
                            />
                        </View>
                    </View>
                }
            />
        </View>
    );
};

export default Dropdown;

const styles = StyleSheet.create({
    container: {
        rowGap: 8,
    },
    labelText: {
        fontFamily: fonts.Inter_Bold,
        fontSize: 12,
        textTransform: "capitalize",
    },
    dropdownButton: {
        paddingHorizontal: 16,
        paddingVertical: 15.5,
        borderWidth: 1,
        borderColor: "#C5C6CC",
        borderRadius: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    errorDropdownButton: {
        borderColor: "#FF616D"
    },
    dropdownButtonText: {
        fontFamily: fonts.Inter_Regular,
        fontSize: 14,
        textTransform: "capitalize",
    },
    placeholderText: {
        color: "#8F9098",
    },
    errorText: {
        fontSize: 12,
        fontFamily: fonts.Inter_Medium,
        color: "#FF616D",
        textTransform: "capitalize"
    },
});
