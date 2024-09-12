import { ApiError } from "@/services/api_error";
import moment from "moment";
import momentTimezone from "moment-timezone";

export const capitalizeText = (text: string) => {
    const wordsInText = text.split(" ");

    const transformedWords = wordsInText.map((word) => {
        return word.charAt(0).toUpperCase() + word.slice(1);
    });
    return transformedWords.join(" ");
};

export const getApiErrorMessage = (error: Error): string => {
    return (
        (error as ApiError).errorResponse?.message ||
        (error as ApiError).errorMessage
    );
};

export const debounce = (func: () => void, timeout = 300) => {
    let timer: NodeJS.Timeout;
    return () => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            func();
        }, timeout);
    };
};

export const getDateAfterSubtracting = (numberOfDaysToSubtract: number) => {
    const today = new Date();
    today.setDate(today.getDate() - numberOfDaysToSubtract);
    return today;
};

/* Converting UTC derived from Local system time to the UTC derived of a specific timezone */
export const convertLocalUTCToTimezoneUTC = (
    localUTCDate: Date,
    format: string,
    timezone: string
) => {
    /**
     * moment.tz(..., String): Does parsing in given timezone, It says the passed date string is in the timezone passed
     * moment().tz(string): Converts to the provided timezone
     */
    /* Local Date Passed, formatted to YYYY-MM-DD HH:mm:ss*/
    const localDateTime = moment(localUTCDate).format(format);

    /* Setting to the timezone passed (parsing) (As the date entered by the user is in the companies timezone)*/
    const converted = momentTimezone.tz(localDateTime, timezone);

    /* Converting to UTC, and formatting */
    return converted.tz("UTC").format(format); // Returning UTC based on the timezone passed.
};

export const convertUTCStringToTimezonedDate = (
    dateTimeString: string,
    format: string,
    timezone: string
) => {
    const timezonedDate = momentTimezone
        .tz(dateTimeString, format, "UTC")
        .tz(timezone);

    return new Date(timezonedDate.format(format));
};
export const setTimeToEmpty = (date: Date) => {
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    return date;
};
