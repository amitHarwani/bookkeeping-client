import { Pressable, StyleSheet, Text, View } from "react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import DateTimePicker, {
    DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import moment from "moment";
import { fonts } from "@/constants/fonts";

interface CustomDateTimePickerProps {
    label?: string;
    value?: Date;
    onChange(selectedDateTime: string, dateTime: Date): void;
    mode: "date" | "time" | "datetime";
    errorMessage?: string | null;
    extraContainerStyles?: Object;
}
const CustomDateTimePicker = ({
    label,
    value,
    onChange,
    mode,
    errorMessage,
    extraContainerStyles
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
        <View style={[styles.container, extraContainerStyles && extraContainerStyles]}>
            {label && <Text style={styles.label}>{label}</Text>}
            <Pressable
                style={[styles.dateTimeInput, !!errorMessage && styles.errorInput]}
                onPress={() => setIsDateTimePickerShown(true)}
            >
                <Text>{valueShown}</Text>
            </Pressable>
            {errorMessage && (
                <Text style={styles.errorText}>{errorMessage}</Text>
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
    label: {
        fontFamily: fonts.Inter_Bold,
        fontSize: 12,
        textTransform: "capitalize",
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
    errorText: {
        fontSize: 12,
        fontFamily: fonts.Inter_Medium,
        color: "#FF616D",
        textTransform: "capitalize",
    }
});
