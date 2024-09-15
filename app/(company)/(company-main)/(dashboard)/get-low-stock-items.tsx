import { i18n } from "@/app/_layout";
import ErrorMessage from "@/components/custom/basic/ErrorMessage";
import LoadingSpinnerOverlay from "@/components/custom/basic/LoadingSpinnerOverlay";
import InventoryListItem from "@/components/custom/business/InventoryListItem";
import ListEmptyComponent from "@/components/custom/business/ListEmptyComponent";
import { PLATFORM_FEATURES } from "@/constants/features";
import { ReactQueryKeys } from "@/constants/reactquerykeys";
import { AppRoutes } from "@/constants/routes";
import { useRefreshOnFocus } from "@/hooks/useRefreshOnFocus";
import inventory_service from "@/services/inventory/inventory_service";
import { useAppSelector } from "@/store";
import {
    getApiErrorMessage
} from "@/utils/common_utils";
import { isFeatureAccessible } from "@/utils/feature_access_helper";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Href, router } from "expo-router";

import React, { useMemo } from "react";
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    View
} from "react-native";

const GetLowStockItems = () => {
    /* Selected company from redux */
    const selectedCompany = useAppSelector(
        (state) => state.company.selectedCompany
    );

    const companyState = useAppSelector((state) => state.company);

    const companyId = useMemo(
        () => companyState.selectedCompany?.companyId as number,
        []
    );
    // /* Use Infinite query to get low stock items*/
    const {
        data: lowStockItemsData,
        error: errorFetchingLowStockItems,
        fetchNextPage: fetchNextPageOfLowStockItems,
        hasNextPage,
        isFetchingNextPage,
        isFetching,
        isPending,
        refetch: refetchLowStockItems,
    } = useInfiniteQuery({
        queryKey: [ReactQueryKeys.getAllLowStockItems, companyId],
        queryFn: inventory_service.getLowStockItems,
        initialPageParam: {
            pageSize: 20,
            companyId: companyId,
            cursor: undefined,
        },
        getNextPageParam: (lastPage, pages) => {
            if (lastPage?.data?.nextPageCursor) {
                return {
                    pageSize: 20,
                    companyId: companyId,
                    cursor: lastPage?.data?.nextPageCursor,
                };
            }
            return null;
        }
    });

    /* Refetch low stock items when the screen comes back to focus */
    useRefreshOnFocus(refetchLowStockItems);

    /* Load more page handler */
    const loadMorePagesHandler = () => {
        /* If next page is there, fetch */
        if (hasNextPage) {
            fetchNextPageOfLowStockItems();
        }
    };

    // /* Show loading spinner until first page data arrives */
    const showLoadingSpinner = useMemo(() => {
        return isPending && isFetching ? true : false;
    }, [isPending, isFetching]);

    // /* Error message from API */
    const apiErrorMessage = useMemo(() => {
        if (errorFetchingLowStockItems) {
            return getApiErrorMessage(errorFetchingLowStockItems);
        }
    }, [errorFetchingLowStockItems]);

    return (
        <View style={styles.container}>
            {showLoadingSpinner && <LoadingSpinnerOverlay />}
            {apiErrorMessage && <ErrorMessage message={apiErrorMessage} />}
            <View style={styles.itemListContainer}>
                <FlatList
                    data={lowStockItemsData?.pages
                        .map((lowStockPage) => lowStockPage?.data?.lowStockItems)
                        .flat()}
                    renderItem={({ item }) => (
                        <InventoryListItem
                            item={item}
                            onPress={(item) =>
                                router.push(
                                    `${AppRoutes.getItem}/${item.itemId}` as Href
                                )
                            }
                        />
                    )}
                    keyExtractor={(item) => item.itemId.toString()}
                    ItemSeparatorComponent={() => (
                        <View style={styles.itemSeparator} />
                    )}
                    onEndReached={loadMorePagesHandler}
                    onEndReachedThreshold={0}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    ListEmptyComponent={() => (
                        <ListEmptyComponent message={i18n.t("noItemsFound")} />
                    )}
                />
                {isFetchingNextPage && <ActivityIndicator size="large" />}
            </View>
        </View>
    );
};

export default GetLowStockItems;

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
