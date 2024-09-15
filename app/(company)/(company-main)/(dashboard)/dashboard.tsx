import { i18n } from "@/app/_layout";
import CashInIcon from "@/assets/images/cash_in_icon.png";
import CashOutIcon from "@/assets/images/cash_out_icon.png";
import InfoIcon from "@/assets/images/info_icon.png";
import CustomBarchart from "@/components/custom/basic/CustomBarchart";
import LoadingSpinnerOverlay from "@/components/custom/basic/LoadingSpinnerOverlay";
import CashSummaryItem from "@/components/custom/business/CashSummaryItem";
import QuickActionButton from "@/components/custom/business/QuickActionButton";
import { dateFormat, dateTimeFormat24hr } from "@/constants/datetimes";
import { PLATFORM_FEATURES } from "@/constants/features";
import { ReactQueryKeys } from "@/constants/reactquerykeys";
import { QuickActionTypes } from "@/constants/types";
import billing_service from "@/services/billing/billing_service";
import { useAppSelector } from "@/store";
import { commonStyles } from "@/utils/common_styles";
import { isFeatureAccessible } from "@/utils/feature_access_helper";
import { useQuery } from "@tanstack/react-query";
import { useFocusEffect } from "@react-navigation/native";
import moment from "moment";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    FlatList,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import inventory_service from "@/services/inventory/inventory_service";
import ForwardSquareIcon from "@/assets/images/forward_square_icon.png";
import { Href, router } from "expo-router";
import { AppRoutes } from "@/constants/routes";

const Dashboard = () => {
    const userACL = useAppSelector((state) => state.company.userACL);
    /* Company state from redux */
    const companyState = useAppSelector((state) => state.company);

    /* Company ID */
    const companyId = useMemo(
        () => companyState.selectedCompany?.companyId as number,
        []
    );

    /* Whether cash flow summary is accessible to the user */
    const isCashFlowSummaryAccessible = useMemo(() => {
        return isFeatureAccessible(PLATFORM_FEATURES.GET_CASHFLOW_SUMMARY);
    }, [userACL]);

    /* Whether top selling items chart is accessible */
    const isTopSellersAccessible = useMemo(() => {
        return isFeatureAccessible(PLATFORM_FEATURES.GET_TOPSELLING_ITEMS);
    }, [userACL]);

    const isLowStockItemsAccessible = useMemo(() => {
        return isFeatureAccessible(PLATFORM_FEATURES.GET_LOWSTOCK_ITEMS);
    }, [userACL]);

    /* Quick Actions data array */
    const quickActions: Array<QuickActionTypes> = useMemo(() => {
        const actions: Array<QuickActionTypes> = [];
        /* If add sale feature is accessible */
        if (isFeatureAccessible(PLATFORM_FEATURES.ADD_UPDATE_SALE)) {
            actions.push("SALE");
        }
        /* If add purchase feature is accessible */
        if (isFeatureAccessible(PLATFORM_FEATURES.ADD_UPDATE_PURCHASE)) {
            actions.push("PURCHASE");
        }
        /* If get items feature is accessible */
        if (isFeatureAccessible(PLATFORM_FEATURES.GET_ITEMS)) {
            actions.push("ITEMS");
        }
        return actions;
    }, [userACL]);

    const [fromDateTime, setFromDateTime] = useState<string>("");
    const [toDateTime, setToDateTime] = useState<string>("");

    const computeFromToDateForRequests = useCallback(() => {
        /* Now In UTC */
        const now = moment.utc();

        /* Companies day start time in UTC */
        const dayStartTime = companyState.selectedCompany?.dayStartTime;

        /* From: Combining todays date and companies day start time */
        const from = moment.utc(
            `${now.format(dateFormat)} ${dayStartTime}`,
            dateTimeFormat24hr
        );

        /* To is now */
        const to = now.clone();

        /* if from is after to, case when it is after midnight, subtract one day from the date */
        if (from.isAfter(to)) {
            from.date(from.date() - 1);
        }

        /* Return from and to */
        setFromDateTime(from.format(dateTimeFormat24hr));
        setToDateTime(to.format(dateTimeFormat24hr));
    }, []);

    const {
        isFetching: fetchingCashFlowSummaryData,
        data: cashFlowSummaryData,
        error: errorFetchingCashFlowSummaryData,
        refetch: refetchCashFlowSumary,
    } = useQuery({
        queryKey: [
            ReactQueryKeys.cashFlowSummary,
            companyId,
            { from: fromDateTime, to: toDateTime },
        ],
        queryFn: () =>
            billing_service.getCashFlowSummary(companyId, {
                from: fromDateTime,
                to: toDateTime,
            }),
        enabled: false,
    });

    const {
        isFetching: fetchingTopSellers,
        data: topSellersData,
        error: errorFetchingTopSellers,
        refetch: refetchTopSellers,
    } = useQuery({
        queryKey: [ReactQueryKeys.getTopSellersForCurrentMonth, companyId],
        queryFn: () => billing_service.getTopSellersForCurrentMonth(companyId),
        enabled: false,
    });

    const {
        isFetching: fetchingLowStockItems,
        data: lowStockItemsData,
        error: errorFetchingLowStockItems,
        refetch: refetchLowStockItems,
    } = useQuery({
        queryKey: [ReactQueryKeys.getLowStockItems, companyId],
        queryFn: () =>
            inventory_service.getLowStockItems({
                pageParam: {
                    companyId: companyId,
                    pageSize: 5,
                },
            }),
        enabled: false,
    });

    const lowStockItemsFormatted = useMemo(() => {
        if(lowStockItemsData){
            return lowStockItemsData.data.lowStockItems.map((item) => {
                return {
                    ...item,
                    minStockToMaintain: Number(item.minStockToMaintain),
                    difference: Number(item.difference),
                    stock: Number(item.stock),
                }
            })
        }
        return [];
    }, [lowStockItemsData])   
    /* On change of from and to date time */
    useEffect(() => {
        /* If get cash flow summary is accessible, fetch cash flow summary */
        if (isCashFlowSummaryAccessible && fromDateTime && toDateTime) {
            refetchCashFlowSumary();
        }
        if (isTopSellersAccessible) {
            refetchTopSellers();
        }
        if (isLowStockItemsAccessible) {
            refetchLowStockItems();
        }
    }, [
        fromDateTime,
        toDateTime,
        isCashFlowSummaryAccessible,
        isTopSellersAccessible,
        isLowStockItemsAccessible,
    ]);

    /* On focus compute from and to date for requests */
    useFocusEffect(
        React.useCallback(() => {
            computeFromToDateForRequests();
        }, [])
    );
    /* Show loading spinner when making API Calls */
    const showLoadingSpinner = useMemo(() => {
        return fetchingCashFlowSummaryData ||
            fetchingTopSellers ||
            fetchingLowStockItems
            ? true
            : false;
    }, [
        fetchingCashFlowSummaryData,
        fetchingTopSellers,
        fetchingLowStockItems,
    ]);

    return (
        <ScrollView style={styles.mainContainer}>
            {showLoadingSpinner && <LoadingSpinnerOverlay />}
            <View style={styles.container}>
                <View style={styles.quickActionsContainer}>
                    <Text
                        style={[
                            commonStyles.textSmallBold,
                            commonStyles.capitalize,
                        ]}
                    >
                        {i18n.t("quickActions")}
                    </Text>
                    <FlatList
                        data={quickActions}
                        renderItem={({ item }) => (
                            <QuickActionButton type={item} />
                        )}
                        horizontal
                        ItemSeparatorComponent={() => (
                            <View style={styles.quickActionSeparator} />
                        )}
                    />
                </View>
                {isCashFlowSummaryAccessible && cashFlowSummaryData && (
                    <>
                        <View style={styles.cashSummaryContainer}>
                            <CashSummaryItem
                                amount={cashFlowSummaryData.data.cashIn}
                                heading={i18n.t("cashIn")}
                                icon={CashInIcon}
                            />
                            <CashSummaryItem
                                amount={cashFlowSummaryData.data.cashOut}
                                heading={i18n.t("cashOut")}
                                icon={CashOutIcon}
                            />
                        </View>
                        <View style={styles.cashSummaryContainer}>
                            <CashSummaryItem
                                amount={cashFlowSummaryData.data.collectionsDue}
                                heading={i18n.t("collectionsDue")}
                                icon={InfoIcon}
                            />
                            <CashSummaryItem
                                amount={cashFlowSummaryData.data.paymentsDue}
                                heading={i18n.t("paymentsDue")}
                                icon={InfoIcon}
                            />
                        </View>
                    </>
                )}
                {isTopSellersAccessible && topSellersData && (
                    <View>
                        <Text
                            style={[
                                commonStyles.textSmallBold,
                                commonStyles.capitalize,
                            ]}
                        >
                            {i18n.t("topSellersThisMonth")}
                        </Text>
                        <CustomBarchart
                            data={topSellersData.data.topSellingItems}
                            xAxisKey="itemName"
                            yAxisKey="totalUnitsSold"
                        />
                    </View>
                )}
                {isLowStockItemsAccessible && lowStockItemsData && (
                    <View>
                        <View style={styles.lowStockItemsHeadingContainer}>
                            <Text
                                style={[
                                    commonStyles.textSmallBold,
                                    commonStyles.capitalize,
                                ]}
                            >
                                {i18n.t("lowStockItems")}
                            </Text>
                            <Pressable
                                onPress={() => {
                                    router.push(
                                        `${AppRoutes.getLowStockItems}` as Href
                                    );
                                }}
                            >
                                <Image
                                    source={ForwardSquareIcon}
                                    style={styles.forwardSquareIcon}
                                />
                            </Pressable>
                        </View>
                        <CustomBarchart
                            data={lowStockItemsFormatted}
                            xAxisKey="itemName"
                            yAxisKey="difference"
                            styles={{ barFillColor: "#E86339" }}
                        />
                    </View>
                )}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 16,
        paddingTop: 24,
        paddingBottom: 6,
    },
    container: {
        rowGap: 30,
    },
    quickActionsContainer: {
        rowGap: 12,
    },
    quickActionSeparator: {
        width: 8,
    },
    cashSummaryContainer: {
        flexDirection: "row",
        columnGap: 5,
    },
    lowStockItemsHeadingContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    forwardSquareIcon: {
        width: 24,
        height: 24,
    },
});
export default Dashboard;
