import { fonts } from "@/constants/fonts";
import React, { useState } from "react";
import {
    Image,
    NativeSyntheticEvent,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TextInputFocusEventData,
    View,
} from "react-native";

import showPasswordIcon from "@/assets/images/show_password_icon.png";
import hidePasswordIcon from "@/assets/images/hide_password_icon.png";

interface InputProps {
    label: string;
    placeholder: string;
    onChangeText?(text: string): void;
    onBlur?(e: NativeSyntheticEvent<TextInputFocusEventData>): void;
    isPasswordType?: boolean;
}
const Input = ({
    label,
    placeholder,
    onChangeText,
    onBlur,
    isPasswordType = false,
}: InputProps) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const inputChangeHandler = (text: string) => {
        if (typeof onChangeText === "function") {
            onChangeText(text);
        }
    };

    const blurHandler = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
        if (typeof onBlur === "function") {
            onBlur(e);
        }
    };
    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder={placeholder}
                    onChangeText={inputChangeHandler}
                    onBlur={blurHandler}
                    secureTextEntry={
                        isPasswordType && !isPasswordVisible ? true : false
                    }
                />
                {isPasswordType && (
                    <Pressable onPress={() => setIsPasswordVisible((prev) => !prev)} style={styles.passwordIcon}>
                        <Image
                            source={
                                isPasswordVisible
                                    ? hidePasswordIcon
                                    : showPasswordIcon
                            }
                        />
                    </Pressable>
                )}
            </View>
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
        textTransform: "capitalize"
    },
    input: {
        paddingHorizontal: 16,
        paddingVertical: 14,
        flex: 1,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        flexGrow: 1,
        borderColor: "#C5C6CC",
        borderRadius: 12,
        borderWidth: 1,
    },
    passwordIcon: {
        marginRight: 14
    }
});
