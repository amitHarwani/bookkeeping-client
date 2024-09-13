import { fonts } from "@/constants/fonts";
import { StyleSheet } from "react-native";

export const commonStyles = StyleSheet.create({

    /**  Text **/
    capitalize: {
        textTransform: "capitalize"
    },
    uppercase: {
        textTransform: "uppercase"
    },
    mainHeading: {
        fontFamily: fonts.Inter_Black,
        fontSize: 24,
        color: "#000000",
        textTransform: "capitalize"
    },
    linkText: {
        textTransform: "capitalize",
        fontFamily: fonts.Inter_Regular,
        fontSize: 12,
        color: "blue",
        textDecorationLine: "underline",
    },
    textWhite: {
        color: "#FFFFFF"
    },
    textGray: {
        color: "#8F9098"
    },
    textDarkGray: {
        color: "#71727A"
    },
    textBlue: {
        color: "#006FFD"
    },
    textError: {
        color: "#FF616D"
    },
    textXLBlack: {
        fontFamily: fonts.Inter_Black,
        fontSize: 24
    },
    textLargeMedium: {
        fontFamily: fonts.Inter_Medium,
        fontSize: 18
    },
    textMediumBlack: {
        fontFamily: fonts.Inter_Black,
        fontSize: 14
    },
    textMediumXLBold: {
        fontFamily: fonts.Inter_ExtraBold,
        fontSize: 14
    },
    textMediumBold: {
        fontFamily: fonts.Inter_Bold,
        fontSize: 14
    },
    textMediumMid: {
        fontFamily: fonts.Inter_Medium,
        fontSize: 14
    },
    textMedium: {
        fontFamily: fonts.Inter_Regular,
        fontSize: 14
    },
    textSmallBold: {
        fontFamily: fonts.Inter_Bold,
        fontSize: 12,
    },
    textSmallSemiBold: {
        fontFamily: fonts.Inter_SemiBold,
        fontSize: 12
    },
    textSmallMedium: {
        fontFamily: fonts.Inter_Medium,
        fontSize: 12
    },
    textSmall: {
        fontFamily: fonts.Inter_Regular,
        fontSize: 12
    },



    /* Modal */
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
    /* Tick Mark icon */
    tickmarkIcon: {
        width: 24,
        height: 24,
    },
})