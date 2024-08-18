import { i18n } from "@/app/_layout";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import CustomModal from "../basic/CustomModal";
import { fonts } from "@/constants/fonts";
import CustomButton from "../basic/CustomButton";
import TickMarkIcon from "@/assets/images/tick_mark_icon_blue.png";

interface SuccessModalProps {
    isSuccessModalShown: boolean;
    onSuccessModalClose(): void;
    primaryActionButtonText: string;
    description: string;
    primaryActionButtonHandler(): void;
}
const SuccessModal = ({
    isSuccessModalShown,
    onSuccessModalClose,
    primaryActionButtonHandler,
    primaryActionButtonText,
    description,
}: SuccessModalProps) => {
    return (
        <CustomModal
            visible={isSuccessModalShown}
            onRequestClose={onSuccessModalClose}
            extraModalStyles={{ justifyContent: "center" }}
            children={
                <View style={styles.container}>
                    <Text style={styles.heading}>{i18n.t("success")}</Text>
                    <View style={styles.descriptionContainer}>
                        <Image source={TickMarkIcon} style={styles.tickmark} />
                        <Text style={styles.description}>{description}</Text>
                    </View>
                    <CustomButton
                        onPress={primaryActionButtonHandler}
                        text={primaryActionButtonText}
                        extraContainerStyles={{
                            alignSelf: "stretch",
                            paddingVertical: 12,
                            marginTop: 8,
                        }}
                    />
                </View>
            }
        />
    );
};

export default SuccessModal;

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 16,
        marginHorizontal: 16,
        alignItems: "center",
        rowGap: 16,
    },
    heading: {
        fontFamily: fonts.Inter_Black,
        fontSize: 16,
        textTransform: "capitalize",
    },
    descriptionContainer: {
        flexDirection: "row",
        columnGap: 8,
        alignItems: "center",
    },
    description: {
        fontFamily: fonts.Inter_Medium,
        fontSize: 14,
        textTransform: "capitalize",
    },
    tickmark: {
        width: 24,
        height: 24,
    },
});
