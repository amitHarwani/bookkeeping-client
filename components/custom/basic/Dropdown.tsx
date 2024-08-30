import {
    Button,
    FlatList,
    Image,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import React, {
    ChangeEvent,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";
import { i18n } from "@/app/_layout";
import { fonts } from "@/constants/fonts";
import dropdownIcon from "@/assets/images/dropdown_icon.png";
import CustomModal from "./CustomModal";
import CustomButton from "./CustomButton";
import { commonStyles } from "@/utils/common_styles";
import { GenericObject } from "@/constants/types";
import { capitalizeText } from "@/utils/common_utils";
import Input from "./Input";

interface DropdownProps {
    label: string;
    data?: Array<GenericObject>;
    textKey: string;
    onChange?(item?: GenericObject): void;
    value?: GenericObject;
    isSearchable?: boolean;
    searchPlaceholder?: string;
    extraContainerStyles?: Object;
    extraOptionTextSyles?: Object;
    errorMessage?: string | null;
    customActionButtonText?: string;
    customActionButtonHandler?(): void;
    customEqualsFunction?(obj1: GenericObject, obj2: GenericObject): boolean;
    isDisabled?: boolean;
    isDynamicSearchable?: boolean
    onSearchChangeHandler?(text: string): void;
}
const Dropdown = ({
    label,
    data,
    textKey,
    onChange,
    value,
    isSearchable,
    searchPlaceholder,
    extraContainerStyles,
    extraOptionTextSyles,
    errorMessage,
    customActionButtonText,
    customActionButtonHandler,
    customEqualsFunction,
    isDisabled = false,
    isDynamicSearchable = false,
    onSearchChangeHandler
}: DropdownProps) => {
    const [isOptionsShown, setIsOptionsShown] = useState(false);
    const [selectedItem, setSelectedItem] = useState<GenericObject>();
    const [tempSelectedItem, setTempSelectedItem] = useState<GenericObject>();

    const [searchInput, setSearchInput] = useState("");

    /* Filtering data by searchInput, if dropdown isSearchable */
    const filteredData = useMemo(() => {
        if (searchInput && isSearchable && !isDynamicSearchable) {
            return data?.filter((item) => {
                if (item[textKey].toString().includes(searchInput)) {
                    return true;
                }
                return false;
            });
        }
        return data;
    }, [isSearchable, searchInput, data]);

    /* Toggles options menu */
    const toggleOptionsMenu = useCallback(() => {
        setIsOptionsShown((prev) => !prev);
        setSearchInput("");
    }, [isOptionsShown]);

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
                style={[
                    styles.dropdownButton,
                    !!errorMessage && styles.errorDropdownButton,
                ]}
                onPress={toggleOptionsMenu}
                disabled={isDisabled}
            >
                <Text
                    style={[
                        styles.dropdownButtonText,
                        !selectedItem && styles.placeholderText,
                        isDisabled && styles.disabledText
                    ]}
                >
                    {selectedItem?.[textKey] || i18n.t("select")}
                </Text>
                <Image source={dropdownIcon} style={styles.dropdownIcon} />
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
                            {capitalizeText(`${i18n.t("select")} ${label}`)}
                        </Text>

                        {isSearchable && (
                            <Input
                                label=""
                                value={searchInput}
                                onChangeText={(text) => {
                                    setSearchInput(text);
                                    if(isDynamicSearchable && typeof onSearchChangeHandler === "function"){
                                        onSearchChangeHandler(text);
                                    }
                                }}
                                placeholder={searchPlaceholder ? searchPlaceholder : `${capitalizeText(
                                    i18n.t("searchBy")
                                )} ${textKey}`}
                            />
                        )}
                        <View style={styles.dropdownItemsContainer}>
                            <FlatList
                                data={filteredData}
                                renderItem={({ item }) => (
                                    <Pressable
                                        key={item[textKey]}
                                        style={[
                                            commonStyles.optionContainer,
                                            typeof customEqualsFunction ===
                                                "function" && tempSelectedItem
                                                ? customEqualsFunction(
                                                      tempSelectedItem,
                                                      item
                                                  ) &&
                                                  commonStyles.selectedOptionContainer
                                                : tempSelectedItem === item &&
                                                  commonStyles.selectedOptionContainer,
                                        ]}
                                        onPress={() => selectItem(item)}
                                    >
                                        <Text
                                            style={[
                                                tempSelectedItem === item
                                                    ? commonStyles.selectedOptionText
                                                    : commonStyles.optionText,
                                                extraOptionTextSyles,
                                            ]}
                                        >
                                            {item[textKey]}
                                        </Text>
                                    </Pressable>
                                )}
                                keyExtractor={(item) => item[textKey]}
                            />
                        </View>
                        {customActionButtonText &&
                            customActionButtonHandler && (
                                <CustomButton
                                    text={customActionButtonText}
                                    onPress={customActionButtonHandler}
                                    isSecondaryButton={true}
                                />
                            )}

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
    disabledText: {
        color: "#A9A9A9"
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
        flex: 1
    },
    dropdownItemsContainer: {
        maxHeight: 250
    },
    dropdownIcon: {
        width: 12,
        height: 12,
    },
    errorDropdownButton: {
        borderColor: "#FF616D",
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
        textTransform: "capitalize",
    },
});
