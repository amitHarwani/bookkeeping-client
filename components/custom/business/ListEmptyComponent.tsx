import { Image, StyleSheet, Text, View } from "react-native";
import React from "react";
import SearchIcon from "@/assets/images/search_icon.png";
import { fonts } from "@/constants/fonts";

interface ListEmptyComponentProps {
    message: string;
}
const ListEmptyComponent = ({ message }: ListEmptyComponentProps) => {
    return (
        <View style={styles.container}>
            <Image source={SearchIcon} resizeMode="contain" />
            <Text style={styles.message}>{message}</Text>
        </View>
    );
};

export default ListEmptyComponent;

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        height: "100%",
        flex: 1,
        rowGap: 8
    },
    message: {
        fontFamily: fonts.Inter_Medium,
        fontSize: 18,
        textTransform: "capitalize",
        color: "#006FFD"
    }
});
