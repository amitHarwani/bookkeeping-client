import { i18n } from "@/app/_layout";
import { RoleTypeInRolesList } from "@/constants/types";
import { useAppSelector } from "@/store";
import { commonStyles } from "@/utils/common_styles";
import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";

interface RoleListItemProps {
    role: RoleTypeInRolesList;
    onPress(role: RoleTypeInRolesList): void;
}
const RoleListItem = ({ role, onPress }: RoleListItemProps) => {
    const companyId = useAppSelector(
        (state) => state.company.selectedCompany?.companyId
    );
    return (
        <Pressable onPress={() => onPress(role)} style={styles.container}>
            <Text style={[commonStyles.textMedium]}>
                {role.roleName == `${companyId}_ADMIN`
                    ? i18n.t("admin").toUpperCase()
                    : role.roleName}
            </Text>
        </Pressable>
    );
};

export default RoleListItem;

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
});
