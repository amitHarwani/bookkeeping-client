import { i18n } from "@/app/_layout";
import LoadingSpinnerOverlay from "@/components/custom/basic/LoadingSpinnerOverlay";
import CustomNavHeader from "@/components/custom/business/CustomNavHeader";
import AddUpdateReport from "@/components/custom/widgets/AddUpdateReport";
import { dateTimeFormat24hr } from "@/constants/datetimes";
import { ReactQueryKeys } from "@/constants/reactquerykeys";
import { AddReportForm } from "@/constants/types";
import report_service from "@/services/report/report_service";
import { useAppSelector } from "@/store";
import {
    capitalizeText,
    convertUTCStringToTimezonedDate,
} from "@/utils/common_utils";
import { useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import React, { useEffect, useMemo } from "react";
import { StyleSheet, ToastAndroid } from "react-native";

const GetReport = () => {
    /* Company State from redux */
    const companyState = useAppSelector((state) => state.company);

    /* Time zone of companies country */
    const timezone = useMemo(
        () => companyState.country?.timezone as string,
        [companyState]
    );

    /* Decimal points to round to when showing the value */
    const decimalPoints = useMemo(() => {
        return companyState.selectedCompany?.decimalRoundTo || 2;
    }, [companyState]);

    /* Selected Company */
    const selectedCompany = useAppSelector(
        (state) => state.company.selectedCompany
    );

    /* Company ID */
    const companyId = useMemo(
        () => selectedCompany?.companyId as number,
        [selectedCompany]
    );

    /* Stack navigator */
    const navigation = useNavigation();

    /* Path params */
    const params = useLocalSearchParams();

    /* Report ID from path params */
    const reportId = useMemo(() => Number(params.reportId), [params]);

    const {
        data: reportData,
        error: errorFetchingReport,
        isFetching: fetchingReport,
    } = useQuery({
        queryKey: [ReactQueryKeys.getReport, reportId, companyId],
        queryFn: () => report_service.getReport(companyId, reportId),
    });

    /* Setting the header */
    useEffect(() => {
        navigation.setOptions({
            headerTitle: () => (
                <CustomNavHeader
                    mainHeading={
                        reportData?.data?.report
                            ? reportData.data.report.reportName.replaceAll(
                                  "_",
                                  " "
                              )
                            : i18n.t("report")
                    }
                    subHeading={selectedCompany?.companyName as string}
                />
            ),
        });
    }, [navigation, reportData]);

    const formValues: AddReportForm | null = useMemo(() => {
        if (reportData && reportData.success) {
            const report = reportData.data.report;
            const values: AddReportForm = {
                reportType: {
                    key: report.reportName,
                    displayedText: report.reportName.replaceAll("_", " "),
                },
                fromDateTime: convertUTCStringToTimezonedDate(
                    report.fromDateTime,
                    dateTimeFormat24hr,
                    timezone
                ),
            };
            if (report?.toDateTime) {
                values.toDateTime = convertUTCStringToTimezonedDate(
                    report.toDateTime,
                    dateTimeFormat24hr,
                    timezone
                );
            }

            return values;
        }
        return null;
    }, [reportData]);

    /* Show loading spinner when report is being fetched */
    const showLoadingSpinner = useMemo(() => {
        return fetchingReport ? true : false;
    }, [fetchingReport]);

    /* API Error: Show toast message and go back */
    useEffect(() => {
        if (errorFetchingReport) {
            ToastAndroid.show(
                capitalizeText(
                    `${i18n.t("errorFetchingDetails")}${i18n.t(
                        "comma"
                    )}${i18n.t("contactSupport")}`
                ),
                ToastAndroid.LONG
            );
            router.back();
        }
    }, [errorFetchingReport]);

    return (
        <>
            {showLoadingSpinner && <LoadingSpinnerOverlay />}

            {formValues && (
                <AddUpdateReport
                    operation="GET"
                    formValues={formValues}
                    onAddUpdateReport={() => {}}
                />
            )}
        </>
    );
};

export default GetReport;

const styles = StyleSheet.create({});
