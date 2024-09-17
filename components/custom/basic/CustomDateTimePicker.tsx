import { Pressable, StyleSheet, Text, View } from "react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import DateTimePicker, {
    DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import moment from "moment";
import { fonts } from "@/constants/fonts";
import { commonStyles } from "@/utils/common_styles";

interface CustomDateTimePickerProps {
    label?: string;
    value?: Date;
    onChange(selectedDateTime: string, dateTime: Date): void;
    mode: "date" | "time" | "datetime";
    errorMessage?: string | null;
    extraContainerStyles?: Object;
    isDisabled?: boolean;
    keepLabelSpace?: boolean
}
const CustomDateTimePicker = ({
    label,
    value,
    onChange,
    mode,
    errorMessage,
    extraContainerStyles,
    isDisabled = false,
    keepLabelSpace = false
}: CustomDateTimePickerProps) => {
    const [isDateTimePickerShown, setIsDateTimePickerShown] = useState(false);

    /* selected date time (Stores In UTC) */
    const [dateTime, setDateTime] = useState(new Date());

    /* Format date time as per mode: Formatting gives in local */
    const formatDateTime = useCallback((dateTime: Date) => {
        const momentObj = moment(dateTime);
        switch (mode) {
            case "date":
                return momentObj.format("YYYY-MM-DD");
                break;
            case "time":
                return momentObj.format("HH:mm:ss");
            default:
                return momentObj.format("YYYY-MM-DD HH:mm:ss");
                break;
        }
    }, []);

    /* Value shown in input box from date time state */
    const valueShown = useMemo(() => {
        return formatDateTime(dateTime);
    }, [dateTime]);

    /* On change  */
    const onDateTimeChanged = (
        event: DateTimePickerEvent,
        selectedDate?: Date
    ) => {
        /* Set selected date time & toggle picker */
        if (selectedDate) {
            setDateTime(selectedDate);
            onChange(formatDateTime(selectedDate), selectedDate);
        }
        setIsDateTimePickerShown(false);
    };

    /* For default values */
    useEffect(() => {
        if (value) {
            setDateTime(value);
        }
    }, [value]);

    return (
        <View
            style={[
                styles.container,
                extraContainerStyles && extraContainerStyles,
            ]}
        >
            {(keepLabelSpace || label) && (
                <Text
                    style={[
                        commonStyles.textSmallBold,
                        commonStyles.capitalize,
                    ]}
                >
                    {label || ""}
                </Text>
            )}
            <Pressable
                style={[
                    styles.dateTimeInput,
                    !!errorMessage && styles.errorInput,
                ]}
                disabled={isDisabled}
                onPress={() => setIsDateTimePickerShown(true)}
            >
                <Text style={[isDisabled && commonStyles.textDisabled]}>{valueShown}</Text>
            </Pressable>
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
            {isDateTimePickerShown && (
                <DateTimePicker
                    value={dateTime}
                    mode={mode}
                    onChange={onDateTimeChanged}
                />
            )}
        </View>
    );
};

export default CustomDateTimePicker;

const styles = StyleSheet.create({
    container: {
        rowGap: 8,
    },
    dateTimeInput: {
        paddingHorizontal: 16,
        paddingVertical: 15.5,
        borderWidth: 1,
        borderColor: "#C5C6CC",
        borderRadius: 12,
        flexDirection: "row",
        alignItems: "center",
    },
    errorInput: {
        borderColor: "#FF616D",
    },
});
