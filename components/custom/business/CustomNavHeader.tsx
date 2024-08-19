import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { commonStyles } from "@/utils/common_styles";
import { fonts } from "@/constants/fonts";

interface CustomNavHeaderProps {
    mainHeading: string;
    subHeading: string;
}

const CustomNavHeader = ({ mainHeading, subHeading }: CustomNavHeaderProps) => {
    return (
        <View style={styles.container}>
            <Text style={commonStyles.mainHeading}>{mainHeading}</Text>
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
        rowGap: 0
    },
    subHeading: {
        fontFamily: fonts.Inter_Bold,
        fontSize: 12,
        color: "#8F9098",
    },
});
