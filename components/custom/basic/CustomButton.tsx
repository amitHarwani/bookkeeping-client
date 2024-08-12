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
}
const CustomButton = ({
    onPress,
    text,
    isLoading = false,
    isDisabled = false,
    extraContainerStyles,
    extraTextStyles,
}: CustomButtonProps) => {
    return (
        <Pressable
            onPress={onPress}
            disabled={isLoading || isDisabled}
            style={[styles.container, extraContainerStyles, isLoading && styles.containerWhenLoading]}
        >
            <Text style={[styles.text, extraTextStyles]}>{text}</Text>
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
    containerWhenLoading: {
        opacity: 0.5
    },
    text: {
        color: "#FFFFFF",
        fontSize: 14,
        fontFamily: fonts.Inter_Bold,
        textTransform: "uppercase",
    },
});
