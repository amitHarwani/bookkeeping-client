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
            <Text style={[commonStyles.mainHeading, styles.mainHeading]} numberOfLines={1}>{mainHeading}</Text>
            {
                subHeading && 
                <Text style={styles.subHeading}>{subHeading}</Text>
            }
        </View>
    );
};

export default CustomNavHeader;

const styles = StyleSheet.create({
    container: {
        rowGap: 0,
        width: ScreenWidth - 100,
    },
    mainHeading: {
        
    },
    subHeading: {
        fontFamily: fonts.Inter_Bold,
        fontSize: 12,
        color: "#8F9098",
    },
});
