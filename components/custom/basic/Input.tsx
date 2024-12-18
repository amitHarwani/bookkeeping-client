import { fonts } from "@/constants/fonts";
import React, { useState } from "react";
import {
    Image,
    KeyboardTypeOptions,
    NativeSyntheticEvent,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TextInputFocusEventData,
    View,
} from "react-native";

import showPasswordIcon from "@/assets/images/show_password_icon.png";
import searchIcon from "@/assets/images/search_icon.png";
import hidePasswordIcon from "@/assets/images/hide_password_icon.png";
import { commonStyles } from "@/utils/common_styles";

interface InputProps {
    label?: string;
    keepLabelSpace?: boolean;
    placeholder: string;
    onChangeText?(text: string): void;
    onBlur?(e: NativeSyntheticEvent<TextInputFocusEventData>): void;
    isPasswordType?: boolean;
    keyboardType?: KeyboardTypeOptions;
    value: string;
    extraContainerStyles?: Object;
    extraInputStyles?: Object;
    errorMessage?: string | null;
    isSearchIconVisible?: boolean;
    isDisabled?: boolean;
}
const Input = ({
    label,
    keepLabelSpace = true,
    placeholder,
    onChangeText,
    onBlur,
    isPasswordType = false,
    value,
    extraContainerStyles,
    extraInputStyles,
    errorMessage,
    keyboardType,
    isSearchIconVisible = false,
    isDisabled = false,
}: InputProps) => {
    /* Password visibility state for password inputs */
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    /* For custom styling when input is in focus */
    const [isFocussed, setIsFocussed] = useState(false);

    /* Change handler: Calling the passed function */
    const inputChangeHandler = (text: string) => {
        if (typeof onChangeText === "function") {
            onChangeText(text);
        }
    };

    /* Blur handler: Set is focussed to false, and calling the parent function */
    const blurHandler = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
        setIsFocussed(false);
        if (typeof onBlur === "function") {
            onBlur(e);
        }
    };
    return (
        <View style={[styles.container, extraContainerStyles]}>
            {keepLabelSpace && (
                <Text
                    style={[
                        commonStyles.textSmallBold,
                        commonStyles.capitalize,
                    ]}
                >
                    {label ? label : ""}
                </Text>
            )}
            <View
                style={[
                    styles.inputContainer,
                    isFocussed && styles.focussedInputContainer,
                    !!errorMessage && styles.errorInputContainer,
                ]}
            >
                {isSearchIconVisible && (
                    <Image
                        source={searchIcon}
                        style={styles.searchIcon}
                        resizeMode="contain"
                    />
                )}
                <TextInput
                    style={[
                        styles.input,
                        commonStyles.textMedium,
                        extraInputStyles,
                        isDisabled && commonStyles.textDisabled
                    ]}
                    placeholder={placeholder}
                    onChangeText={inputChangeHandler}
                    onBlur={blurHandler}
                    onFocus={() => setIsFocussed(true)}
                    value={value}
                    secureTextEntry={
                        isPasswordType && !isPasswordVisible ? true : false
                    }
                    keyboardType={keyboardType ? keyboardType : "default"}
                    editable={!isDisabled}
                />
                {isPasswordType && (
                    <Pressable
                        onPress={() => setIsPasswordVisible((prev) => !prev)}
                        style={styles.passwordIconContainer}
                    >
                        <Image
                            source={
                                isPasswordVisible
                                    ? hidePasswordIcon
                                    : showPasswordIcon
                            }
                            style={styles.passwordIcon}
                        />
                    </Pressable>
                )}
            </View>
            {errorMessage && (
                <Text
                    style={[
                        commonStyles.textSmallMedium,
                        commonStyles.textError,
                        commonStyles.capitalize,
                    ]}
                >
                    {errorMessage}
                </Text>
            )}
        </View>
    );
};

export default Input;

const styles = StyleSheet.create({
    container: {
        rowGap: 8,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        flexGrow: 1,
        borderColor: "#C5C6CC",
        borderRadius: 12,
        borderWidth: 1,
    },
    searchIcon: {
        width: 18,
        height: 18,
        marginLeft: 16,
    },
    focussedInputContainer: {
        borderColor: "#006FFD",
    },
    errorInputContainer: {
        borderColor: "#FF616D",
    },
    input: {
        paddingHorizontal: 16,
        paddingVertical: 14,
        flex: 1,
    },
    passwordIconContainer: {
        marginRight: 14,
    },
    passwordIcon: {
        width: 16,
        height: 16,
    },
});
