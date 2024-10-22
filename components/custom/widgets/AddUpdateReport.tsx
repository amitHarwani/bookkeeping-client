import { i18n } from "@/app/_layout";
import CustomButton from "@/components/custom/basic/CustomButton";
import ErrorMessage from "@/components/custom/basic/ErrorMessage";
import { PLATFORM_FEATURES } from "@/constants/features";
import {
    AddReportForm,
    ReportSelectorType,
    SaleInvoiceForm,
} from "@/constants/types";
import { useAppSelector } from "@/store";
import { capitalizeText, getDateAfterSubtracting } from "@/utils/common_utils";
import { Href, Link, router } from "expo-router";
import { useFormik } from "formik";
import React, { useEffect, useMemo } from "react";
import { ScrollView, StyleSheet, ToastAndroid, View } from "react-native";
import Dropdown from "../basic/Dropdown";
import { AddReportFormValidation } from "@/utils/schema_validations";
import { REPORTS_CONFIG } from "@/constants/reportsconfig";
import CustomDateTimePicker from "../basic/CustomDateTimePicker";
import DateTimePickerCombined from "../basic/DateTimePickerCombined";
import { Report } from "@/services/report/report_types";
import { REPORT_STATUS_TYPES } from "@/services/report/report_service";
import { commonStyles } from "@/utils/common_styles";

interface AddUpdateReportProps {
    operation: "ADD" | "GET";
    onAddUpdateReport(values: AddReportForm): void;
    apiErrorMessage?: string | null;
    formValues?: AddReportForm;
    reportDetails?: Report;
}
const AddUpdateReport = ({
    operation,
    onAddUpdateReport,
    apiErrorMessage,
    formValues,
    reportDetails,
}: AddUpdateReportProps) => {
    const enabledPlatformFeatures = useAppSelector(
        (state) => state.platformFeatures.platformFeatures
    );
    const userACL = useAppSelector((state) => state.company.userACL);

    const accessibleReports = useMemo(() => {
        /* Accessible reports */
        const reports: Array<ReportSelectorType> = [];

        /* For each enabled platform feature */
        for (let feature of Object.values(enabledPlatformFeatures)) {
            /* If the feature is dependent of GENERATE_REPORTS feature: Means it is a report type
                and if the user has access to the feature, then push the report to the list
            */
            if (
                feature.dependentFeatureId ==
                    PLATFORM_FEATURES.GENERATE_REPORTS &&
                userACL?.[feature.featureId]
            ) {
                reports.push({
                    key: feature.featureName,
                    displayedText: feature.featureName.replaceAll("_", " "),
                });
            }
        }

        return reports;
    }, [enabledPlatformFeatures, userACL]);

    /* Inputs disabled when operation type is GET */
    const isInputsDisabled = useMemo(() => {
        return operation === "GET" ? true : false;
    }, [operation]);

    /* Form Values */
    const initialFormValues: AddReportForm = useMemo(() => {
        /* If form values are passed from parent, use the passed values */
        if (formValues) {
            return formValues;
        }
        /* Default values */
        const values: AddReportForm = {
            reportType: undefined,
            fromDateTime: undefined,
            toDateTime: undefined,
        };
        return values;
    }, [formValues]);

    const formik = useFormik({
        initialValues: initialFormValues,
        enableReinitialize: true,
        validationSchema: AddReportFormValidation,
        onSubmit: (values) => onAddUpdateReport(values),
    });

    /* Report Config based upon selected report type */
    const selectedReportConfig = useMemo(() => {
        if (formik.values?.reportType) {
            return REPORTS_CONFIG[formik.values.reportType.key];
        }
    }, [formik.values?.reportType]);

    /* On change of report type/config, set the default from and to date times if they are not initialized
        To: Current Date Time, From: To - 1 week
    */
    useEffect(() => {
        if (selectedReportConfig && !formik.values.fromDateTime && !formik.values.toDateTime) {
            if (selectedReportConfig.fromDateTime.required) {
                formik.setFieldValue(
                    "fromDateTime",
                    getDateAfterSubtracting(7)
                );
            }
            if (selectedReportConfig.toDateTime.required) {
                formik.setFieldValue("toDateTime", new Date());
            }
        }
    }, [selectedReportConfig]);

    useEffect(() => {
        /* If user doesn't have access to generate any report, display toast and go back */
        if (enabledPlatformFeatures && userACL && !accessibleReports?.length) {
            ToastAndroid.show(
                capitalizeText(`${i18n.t("unauthorized")}`),
                ToastAndroid.LONG
            );
            router.back();
        }
    }, [enabledPlatformFeatures, userACL, accessibleReports]);

    return (
        <ScrollView style={styles.mainContainer}>
            <View style={styles.container}>
                <View style={styles.formContainer}>
                    {apiErrorMessage && (
                        <ErrorMessage message={apiErrorMessage} />
                    )}

                    <Dropdown
                        label={i18n.t("reportType")}
                        textKey="displayedText"
                        data={accessibleReports}
                        customEqualsFunction={(typeA, typeB) =>
                            typeA?.key == typeB?.key
                        }
                        onChange={(selectedType) => {
                            formik.setFieldTouched("reportType", true);
                            formik.setFieldValue("reportType", selectedType);
                        }}
                        value={formik.values.reportType || undefined}
                        errorMessage={
                            formik.touched.reportType &&
                            formik.errors.reportType
                                ? formik.errors.reportType
                                : null
                        }
                        isDisabled={isInputsDisabled}
                    />

                    {selectedReportConfig && (
                        <>
                            {selectedReportConfig.fromDateTime.required ? (
                                selectedReportConfig.fromDateTime.type ===
                                "DATE" ? (
                                    <CustomDateTimePicker
                                        label={
                                            selectedReportConfig.fromDateTime
                                                .label
                                        }
                                        mode="date"
                                        onChange={(_, date) => {
                                            formik.setFieldTouched(
                                                "fromDateTime",
                                                true
                                            );
                                            formik.setFieldValue(
                                                "fromDateTime",
                                                date
                                            );
                                        }}
                                        value={formik.values.fromDateTime}
                                        isDisabled={isInputsDisabled}
                                        errorMessage={
                                            formik.touched.fromDateTime &&
                                            formik.errors.fromDateTime
                                                ? formik.errors.fromDateTime
                                                : null
                                        }
                                    />
                                ) : (
                                    <DateTimePickerCombined
                                        dateLabel={
                                            selectedReportConfig.fromDateTime
                                                .label
                                        }
                                        onChange={(date) => {
                                            formik.setFieldTouched(
                                                "fromDateTime",
                                                true
                                            );
                                            formik.setFieldValue(
                                                "fromDateTime",
                                                date
                                            );
                                        }}
                                        timeLabel=""
                                        value={formik.values.fromDateTime}
                                        isDisabled={isInputsDisabled}
                                        errorMessage={
                                            formik.touched.fromDateTime &&
                                            formik.errors.fromDateTime
                                                ? formik.errors.fromDateTime
                                                : null
                                        }
                                    />
                                )
                            ) : (
                                <></>
                            )}

                            {selectedReportConfig.toDateTime.required ? (
                                selectedReportConfig.toDateTime.type ===
                                "DATE" ? (
                                    <CustomDateTimePicker
                                        label={
                                            selectedReportConfig.toDateTime
                                                .label
                                        }
                                        mode="date"
                                        onChange={(_, date) => {
                                            formik.setFieldTouched(
                                                "toDateTime",
                                                true
                                            );
                                            formik.setFieldValue(
                                                "toDateTime",
                                                date
                                            );
                                        }}
                                        value={formik.values.toDateTime}
                                        isDisabled={isInputsDisabled}
                                        errorMessage={
                                            formik.touched.toDateTime &&
                                            formik.errors.toDateTime
                                                ? formik.errors.toDateTime
                                                : null
                                        }
                                    />
                                ) : (
                                    <DateTimePickerCombined
                                        dateLabel={
                                            selectedReportConfig.toDateTime
                                                .label
                                        }
                                        onChange={(date) => {
                                            formik.setFieldTouched(
                                                "toDateTime",
                                                true
                                            );
                                            formik.setFieldValue(
                                                "toDateTime",
                                                date
                                            );
                                        }}
                                        timeLabel=""
                                        value={formik.values.toDateTime}
                                        isDisabled={isInputsDisabled}
                                        errorMessage={
                                            formik.touched.toDateTime &&
                                            formik.errors.toDateTime
                                                ? formik.errors.toDateTime
                                                : null
                                        }
                                    />
                                )
                            ) : (
                                <></>
                            )}
                        </>
                    )}

                    {!isInputsDisabled && (
                        <CustomButton
                            text={i18n.t("requestReport")}
                            onPress={formik.handleSubmit}
                        />
                    )}

                    {operation === "GET" && reportDetails && (
                        <>
                            {reportDetails.status ===
                                REPORT_STATUS_TYPES.completed &&
                                reportDetails.reportLink && (
                                    <Link
                                        style={[
                                            styles.viewReportLink,
                                            commonStyles.textMediumBold,
                                            commonStyles.uppercase,
                                            commonStyles.textBlue,
                                        ]}
                                        href={
                                            reportDetails.reportLink as Href<string>
                                        }
                                    >
                                        {i18n.t("viewReport")}
                                    </Link>
                                )}

                            {reportDetails.status ===
                                REPORT_STATUS_TYPES.error && (
                                <ErrorMessage
                                    message={i18n.t("errorGeneratingReport")}
                                />
                            )}
                        </>
                    )}
                </View>
            </View>
        </ScrollView>
    );
};

export default AddUpdateReport;

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    container: {
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 12,
    },
    formContainer: {
        rowGap: 16,
    },
    rowContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    viewReportLink: {
        paddingVertical: 16,
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: "#006FFD",
        textAlign: "center",
    },
});
