import { i18n } from "@/app/_layout";
import ErrorMessage from "@/components/custom/basic/ErrorMessage";
import LoadingSpinnerOverlay from "@/components/custom/basic/LoadingSpinnerOverlay";
import ListEmptyComponent from "@/components/custom/business/ListEmptyComponent";
import { ReactQueryKeys } from "@/constants/reactquerykeys";
import { AppRoutes } from "@/constants/routes";
import { useRefreshOnFocus } from "@/hooks/useRefreshOnFocus";
import UserService from "@/services/user/user_service";
import { useAppSelector } from "@/store";
import { getApiErrorMessage } from "@/utils/common_utils";
import { useQuery } from "@tanstack/react-query";
import { Href, router } from "expo-router";

import CustomButton from "@/components/custom/basic/CustomButton";
import UserListItem from "@/components/custom/business/UserListItem";
import { PLATFORM_FEATURES } from "@/constants/features";
import { isFeatureAccessible } from "@/utils/feature_access_helper";
import React, { useEffect, useMemo } from "react";
import { FlatList, StyleSheet, View } from "react-native";

const Users = () => {
    /* Selected company from redux */
    const selectedCompany = useAppSelector(
        (state) => state.company.selectedCompany
    );

    /* Company ID from selected company */
    const companyId = useMemo(
        () => selectedCompany?.companyId as number,
        [selectedCompany]
    );

    /* Use query to get users */
    const {
        data: usersData,
        error: errorFetchingUsers,
        isFetching: fetchingUsers,
        refetch: refetchUsers,
    } = useQuery({
        queryKey: [ReactQueryKeys.users, companyId],
        queryFn: () => UserService.getAllUsersOfCompany(companyId),
        enabled: false,
    });

    /* Refetch users when the screen comes back to focus */
    useRefreshOnFocus(refetchUsers);

    useEffect(() => {
        /* If fetching is not in progress */
        if (!fetchingUsers) {
            /* fetch users  */
            refetchUsers();
        }
    }, []);

    /* loading spinner visibility */
    const showLoadingSpinner = useMemo(() => {
        return fetchingUsers ? true : false;
    }, [fetchingUsers]);

    /* Error message from API */
    const apiErrorMessage = useMemo(() => {
        if (errorFetchingUsers) {
            return getApiErrorMessage(errorFetchingUsers);
        }
    }, [errorFetchingUsers]);

    return (
        <View style={styles.container}>
            {showLoadingSpinner && <LoadingSpinnerOverlay />}
            {apiErrorMessage && <ErrorMessage message={apiErrorMessage} />}

            {isFeatureAccessible(PLATFORM_FEATURES.ADD_UPDATE_USER) && (
                <CustomButton
                    text={i18n.t("addUser")}
                    onPress={() => {
                        router.push(`${AppRoutes.addUser}` as Href);
                    }}
                    isSecondaryButton={true}
                    extraTextStyles={{ fontSize: 12 }}
                    extraContainerStyles={{
                        paddingHorizontal: 8,
                        paddingVertical: 10,
                        marginLeft: "auto",
                    }}
                />
            )}
            <View style={styles.itemListContainer}>
                <FlatList
                    data={usersData?.data.users}
                    renderItem={({ item }) => (
                        <UserListItem
                            user={item}
                            onPress={(user) =>
                                router.push(
                                    `${AppRoutes.getUser}/${user.userId}` as Href
                                )
                            }
                        />
                    )}
                    keyExtractor={(item) => item.userId}
                    ItemSeparatorComponent={() => (
                        <View style={styles.itemSeparator} />
                    )}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    ListEmptyComponent={() => (
                        <ListEmptyComponent message={i18n.t("noUsersFound")} />
                    )}
                />
            </View>
        </View>
    );
};

export default Users;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 16,
        paddingTop: 24,
        rowGap: 16,
    },
    itemListContainer: {
        marginTop: 10,
        paddingHorizontal: 8,
        flex: 1,
    },
    itemSeparator: {
        backgroundColor: "#D4D6DD",
        height: 1,
        marginTop: 15,
        marginBottom: 15,
    },
});
