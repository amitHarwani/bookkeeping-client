import { i18n } from "@/app/_layout";
import LoadingSpinnerOverlay from "@/components/custom/basic/LoadingSpinnerOverlay";
import CashSummaryItem from "@/components/custom/business/CashSummaryItem";
import QuickActionButton from "@/components/custom/business/QuickActionButton";
import {
    dateFormat,
    dateTimeFormat24hr,
    timeFormat24hr,
} from "@/constants/datetimes";
import { PLATFORM_FEATURES } from "@/constants/features";
import { ReactQueryKeys } from "@/constants/reactquerykeys";
import { QuickActionTypes } from "@/constants/types";
import { useRefreshOnFocus } from "@/hooks/useRefreshOnFocus";
import billing_service from "@/services/billing/billing_service";
import { useAppSelector } from "@/store";
import { commonStyles } from "@/utils/common_styles";
import { convertUTCStringToTimezonedDate } from "@/utils/common_utils";
import { isFeatureAccessible } from "@/utils/feature_access_helper";
import { useQuery } from "@tanstack/react-query";
import { useFocusEffect } from "expo-router";
import moment from "moment";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, ScrollView, StyleSheet, Text, View } from "react-native";
import CashInIcon from "@/assets/images/cash_in_icon.png";
import CashOutIcon from "@/assets/images/cash_out_icon.png";
import InfoIcon from "@/assets/images/info_icon.png";

const Dashboard = () => {
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
    }, []);

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
    }, []);

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

    /* On change of from and to date time */
    useEffect(() => {
        /* If get cash flow summary is accessible, fetch cash flow summary */
        if (isCashFlowSummaryAccessible && fromDateTime && toDateTime) {
            refetchCashFlowSumary();
        }
    }, [fromDateTime, toDateTime]);

    /* On focus compute from and to date for requests */
    useFocusEffect(() => {
        computeFromToDateForRequests();
    });

    /* Show loading spinner when making API Calls */
    const showLoadingSpinner = useMemo(() => {
        return fetchingCashFlowSummaryData ? true : false;
    }, [fetchingCashFlowSummaryData]);

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
});
export default Dashboard;
