import { Pressable, StyleSheet, Text, View } from "react-native";
import React from "react";
import { fonts } from "@/constants/fonts";

interface CustomButtonProps {
    onPress(): void;
    text: string;
    isLoading?: boolean;
    isDisabled?: boolean;
    extraContainerStyles?: Object;
    extraTextStyles?: Object;
    isSecondaryButton?: boolean;
}
const CustomButton = ({
    onPress,
    text,
    isLoading = false,
    isDisabled = false,
    extraContainerStyles,
    extraTextStyles,
    isSecondaryButton = false,
}: CustomButtonProps) => {
    return (
        <Pressable
            onPress={onPress}
            disabled={isLoading || isDisabled}
            style={[
                isSecondaryButton
                    ? styles.secondaryBtnContainer
                    : styles.container,
                extraContainerStyles,
                isLoading && styles.containerWhenLoading,
            ]}
        >
            <Text
                style={[
                    isSecondaryButton ? styles.secondaryBtnText : styles.text,
                    extraTextStyles,
                ]}
            >
                {text}
            </Text>
        </Pressable>
    );
};

export default CustomButton;

const styles = StyleSheet.create({
    container: {
        paddingVertical: 16,
        backgroundColor: "#006FFD",
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    secondaryBtnContainer: {
        paddingVertical: 16,
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1.5,
        borderColor: "#006FFD"
    },
    containerWhenLoading: {
        opacity: 0.5,
    },
    text: {
        color: "#FFFFFF",
        fontSize: 14,
        fontFamily: fonts.Inter_Bold,
        textTransform: "uppercase",
    },
    secondaryBtnText: {
        color: "#006FFD",
        fontSize: 14,
        fontFamily: fonts.Inter_Bold,
        textTransform: "uppercase",
    },
});
