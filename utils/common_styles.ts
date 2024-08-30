import { fonts } from "@/constants/fonts";
import { StyleSheet } from "react-native";

export const commonStyles = StyleSheet.create({
    /* Modal */
    mainHeading: {
        fontFamily: fonts.Inter_Black,
        fontSize: 24,
        color: "#000000",
        textTransform: "capitalize"
    },
    modalEndMenuContainer: {
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 16,
        paddingVertical: 24,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        rowGap: 16,
    },
    modalEndMenuHeading: {
        fontFamily: fonts.Inter_Black,
        fontSize: 16,
        textTransform: "capitalize",
    },
    modalEndActionsContainer: {
        flexDirection: "row",
        columnGap: 8,
        marginTop: 8,
    },

    /* Options List */
    optionContainer: {
        paddingHorizontal: 12,
        paddingVertical: 16,
        borderRadius: 12
    },
    selectedOptionContainer: {
        backgroundColor: "#F8F9FE",
    },
    optionText: {
        fontSize: 14,
        fontFamily: fonts.Inter_Regular,
        textTransform: "capitalize",
        color: "#71727A",
    },
    selectedOptionText: {
        fontSize: 14,
        fontFamily: fonts.Inter_Regular,
        textTransform: "capitalize",
        color: "#000000",
    },

    /* Link Style */
    linkText: {
        textTransform: "capitalize",
        fontFamily: fonts.Inter_Regular,
        fontSize: 12,
        color: "blue",
        textDecorationLine: "underline",
    },

    borderedImageIcon: {
        borderWidth: 1.5,
        borderColor: "#006FFD",
        borderRadius: 12
    },

    /* Edit Icon */
    editIcon: {
        width: 24, 
        height: 24
    },

    /* Hamburger back icon */
    hamburgerBackIcon: {
        width: 24,
        height: 24,
        marginRight: 16,
    },
})