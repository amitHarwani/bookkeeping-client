import { Image, StyleSheet, Text, View } from "react-native";
import React from "react";
import { commonStyles } from "@/utils/common_styles";

interface BottomTabItemProps {
    icon: number;
    title: string;
}
const BottomTabItem = ({ icon, title }: BottomTabItemProps) => {
    return (
        <View style={styles.container}>
            <Image source={icon} style={styles.icon} />
            <Text
                style={[
                    commonStyles.textBlue,
                    commonStyles.capitalize,
                    commonStyles.textSmallMedium,
                ]}
            >
                {title}
            </Text>
        </View>
    );
};

export default BottomTabItem;

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        justifyContent: "center",
        rowGap: 2,
    },
    icon: {
        width: 24,
        height: 24,
    },
});
