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

interface InputProps {
    label: string;
    placeholder: string;
    onChangeText?(text: string): void;
    onBlur?(e: NativeSyntheticEvent<TextInputFocusEventData>): void;
    isPasswordType?: boolean;
    keyboardType?: KeyboardTypeOptions;
    value: string;
    extraContainerStyles?: Object;
    errorMessage?: string | null;
    isSearchIconVisible?: boolean
}
const Input = ({
    label,
    placeholder,
    onChangeText,
    onBlur,
    isPasswordType = false,
    value,
    extraContainerStyles,
    errorMessage,
    keyboardType,
    isSearchIconVisible = false
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
            {label && <Text style={styles.label}>{label}</Text>}
            <View
                style={[
                    styles.inputContainer,
                    isFocussed && styles.focussedInputContainer,
                    !!errorMessage && styles.errorInputContainer,
                ]}
            >
                {isSearchIconVisible && 
                    <Image source={searchIcon} style={styles.searchIcon} resizeMode="contain" />
                }
                <TextInput
                    style={styles.input}
                    placeholder={placeholder}
                    onChangeText={inputChangeHandler}
                    onBlur={blurHandler}
                    onFocus={() => setIsFocussed(true)}
                    value={value}
                    secureTextEntry={
                        isPasswordType && !isPasswordVisible ? true : false
                    }
                    keyboardType={keyboardType ? keyboardType : "default"}
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
                <Text style={styles.errorText}>{errorMessage}</Text>
            )}
        </View>
    );
};

export default Input;

const styles = StyleSheet.create({
    container: {
        rowGap: 8,
    },
    label: {
        fontFamily: fonts.Inter_Bold,
        fontSize: 12,
        textTransform: "capitalize",
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
        width: 24,
        height: 24
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
        fontFamily: fonts.Inter_Regular,
        fontSize: 14,
    },
    passwordIconContainer: {
        marginRight: 14,
    },
    passwordIcon: {
        width: 16,
        height: 16,
    },
    errorText: {
        fontSize: 12,
        fontFamily: fonts.Inter_Medium,
        color: "#FF616D",
        textTransform: "capitalize",
    },
});
