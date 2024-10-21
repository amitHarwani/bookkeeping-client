import { i18n } from "@/app/_layout";
import ErrorIcon from "@/assets/images/error_icon.png";
import TickMarkIcon from "@/assets/images/tick_mark_icon_blue.png";
import {
    dateTimeFormat24hr,
    displayedDateTimeFormat,
} from "@/constants/datetimes";
import {
    REPORT_STATUS_TYPES
} from "@/services/report/report_service";
import { Report } from "@/services/report/report_types";
import { useAppSelector } from "@/store";
import { commonStyles } from "@/utils/common_styles";
import { convertUTCStringToTimezonedDate } from "@/utils/common_utils";
import moment from "moment";
import React, { useMemo } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

interface ReportListItemProps {
    report: Report;
    onPress(report: Report): void;
}
const ReportListItem = ({ report, onPress }: ReportListItemProps) => {
    const country = useAppSelector((state) => state.company.country);

    const reportRangeFormatted = useMemo(() => {
        /* Converting date times from UTC to the companies timezone */
        const from = moment(
            convertUTCStringToTimezonedDate(
                report.fromDateTime,
                dateTimeFormat24hr,
                country?.timezone as string
            )
        ).format(displayedDateTimeFormat);

        let to;
        if (report?.toDateTime) {
            to = moment(
                convertUTCStringToTimezonedDate(
                    report.toDateTime,
                    dateTimeFormat24hr,
                    country?.timezone as string
                )
            ).format(displayedDateTimeFormat);
        }

        return `${from}${to ? ` - ${to}` : ""}`;
    }, [report]);

    /* Status Icon based on report status */
    const statusIcon = useMemo(() => {
        if (report.status === REPORT_STATUS_TYPES.completed) {
            return TickMarkIcon;
        }
        if (report.status === REPORT_STATUS_TYPES.error) {
            return ErrorIcon;
        }
        return null;
    }, [report]);
    return (
        <Pressable onPress={() => onPress(report)} style={styles.container}>
            <View>
                <Text style={[commonStyles.textMedium, commonStyles.capitalize]}>
                    {i18n.t(report.reportName)}
                </Text>
                <Text style={[commonStyles.textSmall]}>
                    {reportRangeFormatted}
                </Text>
            </View>
            {statusIcon && (
                <Image
                    source={statusIcon}
                    style={commonStyles.tickmarkIcon}
                    resizeMode="contain"
                />
            )}
        </Pressable>
    );
};

export default ReportListItem;

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
});
