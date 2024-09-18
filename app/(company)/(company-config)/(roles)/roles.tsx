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
import { useInfiniteQuery } from "@tanstack/react-query";
import { Href, router } from "expo-router";

import RoleListItem from "@/components/custom/business/RoleListItem";
import { GetAllRolesForRolesListResponse } from "@/services/user/user_types";
import React, { useEffect, useMemo } from "react";
import { ActivityIndicator, FlatList, StyleSheet, View } from "react-native";
import { isFeatureAccessible } from "@/utils/feature_access_helper";
import { PLATFORM_FEATURES } from "@/constants/features";
import CustomButton from "@/components/custom/basic/CustomButton";

const Roles = () => {
    /* Selected company from redux */
    const selectedCompany = useAppSelector(
        (state) => state.company.selectedCompany
    );

    /* Company ID from selected company */
    const companyId = useMemo(
        () => selectedCompany?.companyId as number,
        [selectedCompany]
    );

    const companyState = useAppSelector((state) => state.company);

    /* Use Infinite query to get roles */
    const {
        data: rolesData,
        error: errorFetchingRoles,
        fetchNextPage: fetctNextPageOfRoles,
        hasNextPage,
        isFetchingNextPage,
        isFetching,
        isPending,
        refetch: refetchRoles,
    } = useInfiniteQuery({
        queryKey: [
            ReactQueryKeys.roles,
            companyId,
            {
                select: ["roleId", "roleName"],
            },
        ],
        queryFn: UserService.getAllRoles<GetAllRolesForRolesListResponse>,
        initialPageParam: {
            pageSize: 20,
            companyId: companyId,
            cursor: undefined,
            select: ["roleId", "roleName"],
        },
        getNextPageParam: (lastPage, pages) => {
            if (lastPage.data.nextPageCursor) {
                return {
                    pageSize: 20,
                    companyId: companyId,
                    cursor: lastPage.data.nextPageCursor,
                    select: ["roleId", "roleName"],
                };
            }
            return null;
        },
        enabled: false,
    });

    /* Refetch roles when the screen comes back to focus */
    useRefreshOnFocus(refetchRoles);

    useEffect(() => {
        /* If fetching is not in progress */
        if (!isFetching) {
            /* fetch roles  */
            refetchRoles();
        }
    }, []);

    /* If next page exists, fetch next page */
    const loadMorePagesHandler = () => {
        if (hasNextPage) {
            fetctNextPageOfRoles();
        }
    };

    /* Show loading spinner until first page data arrives */
    const showLoadingSpinner = useMemo(() => {
        return isPending && isFetching ? true : false;
    }, [isPending, isFetching]);

    /* Error message from API */
    const apiErrorMessage = useMemo(() => {
        if (errorFetchingRoles) {
            return getApiErrorMessage(errorFetchingRoles);
        }
    }, [errorFetchingRoles]);

    return (
        <View style={styles.container}>
            {showLoadingSpinner && <LoadingSpinnerOverlay />}
            {apiErrorMessage && <ErrorMessage message={apiErrorMessage} />}

            {isFeatureAccessible(PLATFORM_FEATURES.ADD_UPDATE_ROLE) && (
                <CustomButton
                    text={i18n.t("addRole")}
                    onPress={() => {
                        router.push(`${AppRoutes.addRole}` as Href);
                    }}
                    isSecondaryButton={true}
                    extraTextStyles={{ fontSize: 12 }}
                    extraContainerStyles={{
                        paddingHorizontal: 8,
                        paddingVertical: 10,
                        marginLeft: "auto"
                    }}
                />
            )}
            <View style={styles.itemListContainer}>
                <FlatList
                    data={rolesData?.pages
                        .map((rolesPage) => rolesPage.data.roles)
                        .flat()}
                    renderItem={({ item }) => (
                        <RoleListItem
                            role={item}
                            onPress={(role) =>
                                router.push(
                                    `${AppRoutes.getRole}/${role.roleId}` as Href
                                )
                            }
                        />
                    )}
                    keyExtractor={(item) => item.roleId.toString()}
                    ItemSeparatorComponent={() => (
                        <View style={styles.itemSeparator} />
                    )}
                    onEndReached={loadMorePagesHandler}
                    onEndReachedThreshold={0}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    ListEmptyComponent={() => (
                        <ListEmptyComponent message={i18n.t("noRolesFound")} />
                    )}
                />
                {isFetchingNextPage && <ActivityIndicator size="large" />}
            </View>
        </View>
    );
};

export default Roles;

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
