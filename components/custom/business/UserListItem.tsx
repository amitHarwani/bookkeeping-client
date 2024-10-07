import { i18n } from "@/app/_layout";
import { RoleTypeInRolesList } from "@/constants/types";
import { User } from "@/services/user/user_types";
import { useAppSelector } from "@/store";
import { commonStyles } from "@/utils/common_styles";
import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";

interface UserListItemProps {
    user: User;
    onPress(user: User): void;
}
const UserListItem = ({ user, onPress }: UserListItemProps) => {
    return (
        <Pressable onPress={() => onPress(user)} style={styles.container}>
            <Text style={[commonStyles.textMedium]}>{user.fullName}</Text>
        </Pressable>
    );
};

export default UserListItem;

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
});
