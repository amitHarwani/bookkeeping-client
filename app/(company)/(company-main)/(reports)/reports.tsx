import { i18n } from "@/app/_layout";
import CustomButton from "@/components/custom/basic/CustomButton";
import ErrorMessage from "@/components/custom/basic/ErrorMessage";
import LoadingSpinnerOverlay from "@/components/custom/basic/LoadingSpinnerOverlay";
import ListEmptyComponent from "@/components/custom/business/ListEmptyComponent";
import ReportListItem from "@/components/custom/business/ReportListItem";
import { ReactQueryKeys } from "@/constants/reactquerykeys";
import { AppRoutes } from "@/constants/routes";
import { useRefreshOnFocus } from "@/hooks/useRefreshOnFocus";
import report_service from "@/services/report/report_service";
import { useAppSelector } from "@/store";
import {
    getApiErrorMessage
} from "@/utils/common_utils";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Href, router } from "expo-router";

import React, { useMemo } from "react";
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    View
} from "react-native";

const Reports = () => {
    /* Logged in User ID from redux */
    const userId = useAppSelector((state) => state.auth.user?.userId);

    /* Selected company from redux */
    const selectedCompany = useAppSelector(
        (state) => state.company.selectedCompany
    );

    const companyState = useAppSelector((state) => state.company);

    /* Use Infinite query to get reports */
    const {
        data: reportsData,
        error: errorFetchingReports,
        fetchNextPage: fetctNextPageOfReports,
        hasNextPage,
        isFetchingNextPage,
        isFetching,
        isPending,
        refetch: refetchReports,
    } = useInfiniteQuery({
        queryKey: [ReactQueryKeys.reports, selectedCompany?.companyId, userId],
        queryFn: report_service.getAllReports,
        initialPageParam: {
            pageSize: 20,
            companyId: selectedCompany?.companyId,
            cursor: undefined,
        },
        getNextPageParam: (lastPage, pages) => {
            if (lastPage?.data?.nextPageCursor) {
                return {
                    pageSize: 20,
                    companyId: selectedCompany?.companyId,
                    cursor: lastPage.data.nextPageCursor,
                };
            }
            return null;
        },
    });

    /* Refetch Reports when the screen comes back to focus */
    useRefreshOnFocus(refetchReports);

    /* Load more page handler */
    const loadMorePagesHandler = () => {
        /* If next page is there, fetch */
        if (hasNextPage) {
            fetctNextPageOfReports();
        }
    };

    /* Show loading spinner until first page data arrives */
    const showLoadingSpinner = useMemo(() => {
        return isPending && isFetching ? true : false;
    }, [isPending, isFetching]);

    /* Error message from API */
    const apiErrorMessage = useMemo(() => {
        if (errorFetchingReports) {
            return getApiErrorMessage(errorFetchingReports);
        }
    }, [errorFetchingReports]);

    return (
        <View style={styles.container}>
            {showLoadingSpinner && <LoadingSpinnerOverlay />}
            {apiErrorMessage && <ErrorMessage message={apiErrorMessage} />}

            <View style={styles.actionsContainer}>
                <CustomButton
                    text={i18n.t("addReport")}
                    onPress={() => {
                        router.push(`${AppRoutes.addReport}` as Href);
                    }}
                    isSecondaryButton={true}
                    extraTextStyles={{ fontSize: 12 }}
                    extraContainerStyles={{
                        paddingHorizontal: 8,
                        paddingVertical: 10,
                        marginLeft: "auto",
                    }}
                />
            </View>
            <View style={styles.itemListContainer}>
                <FlatList
                    data={reportsData?.pages
                        .map((reportsPage) => reportsPage.data.reports)
                        .flat()}
                    renderItem={({ item }) => (
                        <ReportListItem
                            report={item}
                            onPress={(report) =>
                                router.push(
                                    `${AppRoutes.getReport}/${report.reportId}` as Href
                                )
                            }
                        />
                    )}
                    keyExtractor={(item) => item.reportId.toString()}
                    ItemSeparatorComponent={() => (
                        <View style={styles.itemSeparator} />
                    )}
                    onEndReached={loadMorePagesHandler}
                    onEndReachedThreshold={0}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    ListEmptyComponent={() => (
                        <ListEmptyComponent
                            message={i18n.t("noReportsFound")}
                        />
                    )}
                    onRefresh={refetchReports}
                    refreshing={showLoadingSpinner}
                />
                {isFetchingNextPage && <ActivityIndicator size="large" />}
            </View>
        </View>
    );
};

export default Reports;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 16,
        paddingTop: 24,
        rowGap: 16,
    },
    actionsContainer: {
        flexDirection: "row",
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
