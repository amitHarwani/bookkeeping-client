import { Image, StyleSheet, Text, View } from "react-native";
import React from "react";
import ErrorIcon from "@/assets/images/error_icon.png";
import { fonts } from "@/constants/fonts";

interface ErrorMessageProps {
    message: string;
}

const ErrorMessage = ({message}: ErrorMessageProps) => {
    return (
        <View style={styles.container}>
            <Image source={ErrorIcon} resizeMode="contain" />
            <Text style={styles.errorMessageText}>{message}</Text>
        </View>
    );
};

export default ErrorMessage;

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        columnGap: 4
    },
    errorMessageText: {
        fontSize: 14,
        fontFamily: fonts.Inter_Medium,
        color: "#FF616D",
        textTransform: "capitalize"
    }
});
