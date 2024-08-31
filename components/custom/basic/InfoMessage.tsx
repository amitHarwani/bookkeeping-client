import { Image, StyleSheet, Text, View } from "react-native";
import React from "react";
import InfoIcon from "@/assets/images/info_icon.png";
import { fonts } from "@/constants/fonts";
import { commonStyles } from "@/utils/common_styles";

interface InfoMessageProps {
    message: string;
    extraContainerStyles?: Object;
    extraTextStyles?: Object;
}

const InfoMessage = ({
    message,
    extraContainerStyles,
    extraTextStyles,
}: InfoMessageProps) => {
    return (
        <View style={[styles.container, extraContainerStyles]}>
            <Image
                source={InfoIcon}
                resizeMode="contain"
                style={styles.infoIcon}
            />
            <Text
                style={[
                    commonStyles.textMediumMid,
                    commonStyles.textBlue,
                    commonStyles.capitalize,
                    extraTextStyles && extraTextStyles,
                ]}
            >
                {message}
            </Text>
        </View>
    );
};

export default InfoMessage;

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        columnGap: 4,
        alignItems: "center",
    },
    infoIcon: {
        width: 24,
        height: 24,
    },
});
