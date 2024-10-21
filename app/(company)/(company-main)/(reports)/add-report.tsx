import { i18n } from "@/app/_layout";
import LoadingSpinnerOverlay from "@/components/custom/basic/LoadingSpinnerOverlay";
import AddUpdatePurchaseInvoice from "@/components/custom/widgets/AddUpdatePurchaseInvoice";
import AddUpdateReport from "@/components/custom/widgets/AddUpdateReport";
import AddUpdateSaleInvoice from "@/components/custom/widgets/AddUpdateSaleInvoice";
import { dateFormat, dateTimeFormat24hr } from "@/constants/datetimes";
import { REPORTS_CONFIG } from "@/constants/reportsconfig";
import { AppRoutes } from "@/constants/routes";
import {
    AddReportForm,
    PurchaseInvoiceForm,
    SaleInvoiceForm,
} from "@/constants/types";
import BillingService from "@/services/billing/billing_service";
import report_service, {
    REPORT_END_POINTS,
} from "@/services/report/report_service";
import { useAppSelector } from "@/store";
import {
    capitalizeText,
    convertLocalUTCToTimezoneUTC,
    convertUTCStringToTimezonedDate,
    getApiErrorMessage,
} from "@/utils/common_utils";
import { useMutation } from "@tanstack/react-query";
import { Href, router } from "expo-router";
import moment from "moment";
import React, { useEffect, useMemo } from "react";
import { StyleSheet, ToastAndroid } from "react-native";

const AddReport = () => {
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

    /* Generate Report mutation */
    const generateReportMutation = useMutation({
        mutationFn: ({
            values,
        }: {
            values: {
                reportEndPoint: string;
                fromDateTime: string;
                toDateTime?: string;
            };
        }) =>
            report_service.generateReport(
                values.reportEndPoint,
                selectedCompany?.companyId as number,
                values.fromDateTime,
                selectedCompany?.dayStartTime as string,
                timezone,
                decimalPoints,
                values.toDateTime
            ),
    });

    const onAddUpdateReport = (values: AddReportForm) => {
        /* Report end point from REPORT_END_POINTS object */
        const reportEndPoint =
            REPORT_END_POINTS[values.reportType?.key as string];

        /* Report config */
        const reportConfig = REPORTS_CONFIG[values.reportType?.key as string];

        /* Formatting fromDateTime: from is always required */
        let fromDateTime: string = "";

        /* Only Date: Keep the selected date as it is */
        if (reportConfig.fromDateTime.type === "DATE") {
            fromDateTime = moment
                .utc(
                    `${values.fromDateTime?.getFullYear()}-${
                        (values.fromDateTime?.getMonth() as number) + 1
                    }-${values.fromDateTime?.getDate()} 00:00:00`
                )
                .format(dateFormat);
        } else if (reportConfig.fromDateTime.type === "DATETIME") {
            /* Date Time: Convert to UTC, assuming the selected date time is in the companies timezone */
            fromDateTime = convertLocalUTCToTimezoneUTC(
                values.fromDateTime as Date,
                dateTimeFormat24hr,
                timezone
            );
        }

        /* Formatting to date time */
        let toDateTime: string | undefined;
        if (reportConfig.toDateTime.required) {
            if (reportConfig.toDateTime.type === "DATE") {
                toDateTime = moment
                    .utc(
                        `${values.toDateTime?.getFullYear()}-${
                            (values.toDateTime?.getMonth() as number) + 1
                        }-${values.toDateTime?.getDate()} 00:00:00`
                    )
                    .format(dateFormat);
            } else if (reportConfig.toDateTime.type === "DATETIME") {
                toDateTime = convertLocalUTCToTimezoneUTC(
                    values.toDateTime as Date,
                    dateTimeFormat24hr,
                    timezone
                );
            }
        }

        /* Generating report */
        generateReportMutation.mutate({
            values: {reportEndPoint, fromDateTime, toDateTime}
        })
    };

    /* Show loading spinner when report is being requested */
    const showLoadingSpinner = useMemo(() => {
        return generateReportMutation.isPending ? true : false;
    }, [generateReportMutation.isPending]);

    /* API Error  */
    const apiErrorMessage = useMemo(() => {
        if (generateReportMutation.error) {
            return getApiErrorMessage(generateReportMutation.error);
        }
        return null;
    }, [generateReportMutation.error]);

    /* Success: Show toast message and go back*/
    useEffect(() => {
        if (
            generateReportMutation.isSuccess &&
            generateReportMutation.data.success
        ) {
            ToastAndroid.show(
                capitalizeText(`${i18n.t("reportIsBeingGenerated")}`),
                ToastAndroid.LONG
            );

            router.back();
        }
    }, [generateReportMutation.isSuccess]);

    return (
        <>
            {showLoadingSpinner && <LoadingSpinnerOverlay />}

            <AddUpdateReport
                operation="ADD"
                onAddUpdateReport={onAddUpdateReport}
                apiErrorMessage={apiErrorMessage}
            />
        </>
    );
};

export default AddReport;

const styles = StyleSheet.create({});
