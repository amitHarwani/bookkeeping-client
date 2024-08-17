import { Image, StyleSheet, Text, View } from "react-native";
import React from "react";
import InfoIcon from "@/assets/images/info_icon.png";
import { fonts } from "@/constants/fonts";

interface InfoMessageProps {
    message: string;
    extraContainerStyles?: Object;
    extraTextStyles?: Object;
}

const InfoMessage = ({ message, extraContainerStyles, extraTextStyles }: InfoMessageProps) => {
    return (
        <View style={[styles.container, extraContainerStyles]}>
            <Image
                source={InfoIcon}
                resizeMode="contain"
                style={styles.infoIcon}
            />
            <Text style={[styles.infoMessageText, extraTextStyles && extraTextStyles]}>{message}</Text>
        </View>
    );
};

export default InfoMessage;

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        columnGap: 4,
        alignItems: "center"
    },
    infoIcon: {
        width: 24,
        height: 24,
    },
    infoMessageText: {
        fontSize: 14,
        fontFamily: fonts.Inter_Medium,
        color: "#006FFD",
        textTransform: "capitalize",
    },
});
