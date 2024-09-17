import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import React from "react";
import { CompanyWithTaxDetails } from "@/services/user/user_types";
import SettingsIcon from "@/assets/images/settings_icon.png";
import { fonts } from "@/constants/fonts";
import { commonStyles } from "@/utils/common_styles";

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
                <Text style={[commonStyles.textMediumXLBold]}>
                    {companyDetails.companyName}
                </Text>
                <Text style={[commonStyles.textSmall, commonStyles.textDarkGray]}>
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
                    style={commonStyles.settingsIcon}
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
    settingsContainer: {
        padding: 16,
    }
});
