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
    getApiErrorMessage,
} from "@/utils/common_utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    Image,
    Pressable,
    StyleSheet,
    Text,
    ToastAndroid,
    View,
} from "react-native";
import DeleteIcon from "@/assets/images/delete_icon.png";
import { commonStyles } from "@/utils/common_styles";
import CustomModal from "@/components/custom/basic/CustomModal";
import CustomButton from "@/components/custom/basic/CustomButton";

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

    /* Delete confirmation modal visibility */
    const [
        isDeleteConfirmationModalVisible,
        setIsDeleteConfirmationModalVisible,
    ] = useState(false);

    /* Toggle delete confirmation modal  */
    const toggleDeleteConfirmationModal = useCallback(() => {
        setIsDeleteConfirmationModalVisible((prev) => !prev);
    }, [isDeleteConfirmationModalVisible]);

    const {
        data: reportData,
        error: errorFetchingReport,
        isFetching: fetchingReport,
    } = useQuery({
        queryKey: [ReactQueryKeys.getReport, reportId, companyId],
        queryFn: () => report_service.getReport(companyId, reportId),
    });

    const deleteReportMutation = useMutation({
        mutationFn: () => report_service.deleteReport(companyId, reportId),
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
            headerRight: () => (
                <>
                    {reportData?.data?.report && (
                        <Pressable onPress={toggleDeleteConfirmationModal}>
                            <Image
                                source={DeleteIcon}
                                style={commonStyles.deleteIcon}
                                resizeMode="contain"
                            />
                        </Pressable>
                    )}
                </>
            ),
        });
    }, [navigation, reportData]);

    /* Initializing form values */
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
        return fetchingReport || deleteReportMutation.isPending ? true : false;
    }, [fetchingReport, deleteReportMutation.isPending]);

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

    /* On report deleted: Display toast message and go back */
    useEffect(() => {
        if (deleteReportMutation.isSuccess) {
            ToastAndroid.show(
                capitalizeText(`${i18n.t("reportDeletedSuccessfully")}`),
                ToastAndroid.LONG
            );
            router.back();
        }
    }, [deleteReportMutation.isSuccess]);

    /* Getting the message if there is an error when deleting the report */
    const deleteReportApiErrorMessage = useMemo(() => {
        if (deleteReportMutation.error) {
            return getApiErrorMessage(deleteReportMutation.error);
        }
    }, [deleteReportMutation.error]);

    return (
        <>
            {showLoadingSpinner && <LoadingSpinnerOverlay />}

            {formValues && (
                <AddUpdateReport
                    operation="GET"
                    formValues={formValues}
                    onAddUpdateReport={() => {}}
                    reportDetails={reportData?.data.report}
                    apiErrorMessage={
                        deleteReportApiErrorMessage
                            ? deleteReportApiErrorMessage
                            : null
                    }
                />
            )}

            <CustomModal
                visible={isDeleteConfirmationModalVisible}
                onRequestClose={toggleDeleteConfirmationModal}
                extraModalStyles={{ justifyContent: "flex-end" }}
                children={
                    <View style={commonStyles.modalEndMenuContainer}>
                        <Text style={commonStyles.modalEndMenuHeading}>
                            {i18n.t("deleteReport")}
                        </Text>
                        <Text
                        style={[commonStyles.capitalize, commonStyles.textMedium]}
                        >
                            {i18n.t("areYouSureYouWantToDeleteTheReport")}
                        </Text>
                        <View style={commonStyles.modalEndActionsContainer}>
                            <CustomButton
                                text={i18n.t("cancel")}
                                onPress={toggleDeleteConfirmationModal}
                                isSecondaryButton
                                extraContainerStyles={{ flex: 1 }}
                            />
                            <CustomButton
                                text={i18n.t("delete")}
                                onPress={() => {
                                    toggleDeleteConfirmationModal();
                                    deleteReportMutation.mutate()
                                }}
                                extraContainerStyles={{ flex: 1 }}
                            />
                        </View>
                    </View>
                }
            />
        </>
    );
};

export default GetReport;

const styles = StyleSheet.create({});
