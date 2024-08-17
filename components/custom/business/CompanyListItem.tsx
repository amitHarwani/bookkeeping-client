import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import React from "react";
import { CompanyWithTaxDetails } from "@/services/user/user_types";
import SettingsIcon from "@/assets/images/settings_icon.png";
import { fonts } from "@/constants/fonts";

interface CompanyListItemProps {
    companyDetails: CompanyWithTaxDetails;
    companyPressHandler(companyId: number): void;
    settingsPressHandler(companyId: number): void;
}
const CompanyListItem = ({
    companyDetails,
    companyPressHandler,
    settingsPressHandler,
}: CompanyListItemProps) => {
    return (
        <View style={styles.container}>
            <Pressable
                style={styles.companyDetailsContainer}
                onPress={() => companyPressHandler(companyDetails.companyId)}
            >
                <Text style={styles.companyName}>
                    {companyDetails.companyName}
                </Text>
                <Text style={styles.companyAddress}>
                    {companyDetails.address}
                </Text>
            </Pressable>
            <Pressable
                style={styles.settingsContainer}
                onPress={() => settingsPressHandler(companyDetails.companyId)}
            >
                <Image
                    source={SettingsIcon}
                    resizeMode="contain"
                    style={styles.settingsIcon}
                />
            </Pressable>
        </View>
    );
};

export default CompanyListItem;

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F8F9FE",
        borderRadius: 16,
    },
    companyDetailsContainer: {
        padding: 16,
        rowGap: 4,
        flex: 1,
    },
    companyName: {
        fontFamily: fonts.Inter_ExtraBold,
        fontSize: 14,
    },
    companyAddress: {
        fontFamily: fonts.Inter_Regular,
        fontSize: 12,
        color: "#71727A",
    },
    settingsContainer: {
        padding: 16,
    },
    settingsIcon: {
        width: 24,
        height: 24,
    },
});