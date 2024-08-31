import { Dimensions, StyleSheet, Text, View } from "react-native";
import React from "react";
import { commonStyles } from "@/utils/common_styles";
import { fonts } from "@/constants/fonts";

interface CustomNavHeaderProps {
    mainHeading: string;
    subHeading: string;
}

const ScreenWidth = Dimensions.get("window").width;
const CustomNavHeader = ({ mainHeading, subHeading }: CustomNavHeaderProps) => {
    return (
        <View style={styles.container}>
            <Text
                style={[commonStyles.mainHeading]}
                numberOfLines={1}
            >
                {mainHeading}
            </Text>
            {subHeading && (
                <Text
                    style={[commonStyles.textSmallBold, commonStyles.textGray]}
                >
                    {subHeading}
                </Text>
            )}
        </View>
    );
};

export default CustomNavHeader;

const styles = StyleSheet.create({
    container: {
        rowGap: 0,
        width: ScreenWidth - 100,
    },
});
