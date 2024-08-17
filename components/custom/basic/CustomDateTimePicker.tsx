import { Pressable, StyleSheet, Text, View } from "react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import DateTimePicker, {
    DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import moment from "moment";
import { fonts } from "@/constants/fonts";

interface CustomDateTimePickerProps {
    label?: string;
    value?: string;
    onChange(selectedDateTime: string): void;
    mode: "date" | "time" | "datetime";
}
const CustomDateTimePicker = ({
    label,
    value,
    onChange,
    mode,
}: CustomDateTimePickerProps) => {
    const [isDateTimePickerShown, setIsDateTimePickerShown] = useState(false);

    const [dateTime, setDateTime] = useState(new Date());

    /* Format date time as per mode */
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
            onChange(formatDateTime(selectedDate));
        }
        setIsDateTimePickerShown(false);
    };

    /* For default values */
    useEffect(() => {
        if (value) {
            setDateTime(moment(value).toDate());
        }
    }, [value]);

    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}
            <Pressable
                style={styles.dateTimeInput}
                onPress={() => setIsDateTimePickerShown(true)}
            >
                <Text>{valueShown}</Text>
            </Pressable>
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
});
