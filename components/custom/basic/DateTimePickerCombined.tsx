import { StyleSheet, Text, View } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import CustomDateTimePicker from "./CustomDateTimePicker";
import ErrorMessage from "./ErrorMessage";
import moment from "moment";
import { dateFormat, timeFormat24hr } from "@/constants/datetimes";
import { fonts } from "@/constants/fonts";
import { commonStyles } from "@/utils/common_styles";

interface DateTimePickerCombinedProps {
    dateLabel: string;
    timeLabel: string;
    onChange(selectedDateTime: Date): void;
    errorMessage?: string | null;
    value?: Date;
}
const DateTimePickerCombined = ({
    dateLabel,
    timeLabel,
    onChange,
    errorMessage,
    value,
}: DateTimePickerCombinedProps) => {
    /* Selected Date */
    const [selectedDate, setSelectedDate] = useState<Date>();

    /* Selected Time */
    const [selectedTime, setSelectedTime] = useState<Date>();

    /* Combining YYYY-MM-DD from date, and HH:mm:ss from time into a single date object */
    const getSelectedDateTime = useCallback(
        (date?: Date, time?: Date): Date => {
            const dateString = moment(date).format(dateFormat);
            const timeString = moment(time).format(timeFormat24hr);

            return moment(`${dateString} ${timeString}`).toDate();
        },
        []
    );

    /* Set selected date and call parent function by passing the combined date time */
    const onDateChangeHandler = (dateString: string, dateTime: Date) => {
        setSelectedDate(dateTime);
        onChange(getSelectedDateTime(dateTime, selectedTime));
    };

    /* Set selected time and call the parent function by passing the combined date time */
    const onTimeChangeHandler = (timeString: string, dateTime: Date) => {
        setSelectedTime(dateTime);
        onChange(getSelectedDateTime(selectedDate, dateTime));
    };

    /* Setting default value from parent */
    useEffect(() => {
        if (value) {
            setSelectedDate(value);
            setSelectedTime(value);
        }
    }, [value]);

    return (
        <View style={styles.mainContainer}>
            <View style={styles.container}>
                <CustomDateTimePicker
                    mode="date"
                    label={dateLabel}
                    onChange={onDateChangeHandler}
                    value={selectedDate}
                    extraContainerStyles={{ flex: 1 }}
                />

                <CustomDateTimePicker
                    mode="time"
                    label={timeLabel}
                    onChange={onTimeChangeHandler}
                    value={selectedTime}
                    extraContainerStyles={{ flex: 1 }}
                />
            </View>
            {errorMessage && (
                <Text
                    style={[
                        commonStyles.textSmallMedium,
                        commonStyles.textError,
                        commonStyles.capitalize,
                    ]}
                >
                    {errorMessage}
                </Text>
            )}
        </View>
    );
};

export default DateTimePickerCombined;

const styles = StyleSheet.create({
    mainContainer: {
        rowGap: 4,
    },
    container: {
        flexDirection: "row",
        columnGap: 4,
    },
});
