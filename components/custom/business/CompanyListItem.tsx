import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import React from "react";
import { CompanyWithTaxDetails } from "@/services/user/user_types";
import SettingsIcon from "@/assets/images/settings_icon.png";
import { fonts } from "@/constants/fonts";
import { commonStyles } from "@/utils/common_styles";
import { useAppSelector } from "@/store";
import { i18n } from "@/app/_layout";

interface CompanyListItemProps {
    companyDetails: CompanyWithTaxDetails;
    companyPressHandler(companyId: number): void;
    settingsPressHandler(companyId: number): void;
    addBranchHandler(companyId: number, companyName: string): void;
}
const CompanyListItem = ({
    companyDetails,
    companyPressHandler,
    settingsPressHandler,
    addBranchHandler,
}: CompanyListItemProps) => {
    const user = useAppSelector((state) => state.auth.user);
    return (
        <View style={styles.container}>
            <Pressable
                style={styles.companyDetailsContainer}
                onPress={() => companyPressHandler(companyDetails.companyId)}
            >
                <Text style={[commonStyles.textMediumXLBold]}>
                    {companyDetails.companyName}
                </Text>
                <Text
                    style={[commonStyles.textSmall, commonStyles.textDarkGray]}
                >
                    {companyDetails.address}
                </Text>
                {companyDetails.isMainBranch && !user?.isSubUser && (
                    <Pressable
                        onPress={() =>
                            addBranchHandler(companyDetails.companyId, companyDetails.companyName)
                        }
                    >
                        <Text style={[commonStyles.linkText]}>
                            {i18n.t("addBranch")}
                        </Text>
                    </Pressable>
                )}
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
    },
});
