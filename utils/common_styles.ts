import { fonts } from "@/constants/fonts";
import { StyleSheet } from "react-native";

export const commonStyles = StyleSheet.create({
    mainHeading: {
        fontFamily: fonts.Inter_Black,
        fontSize: 24,
        color: "#000000",
        textTransform: "capitalize"
    }
})