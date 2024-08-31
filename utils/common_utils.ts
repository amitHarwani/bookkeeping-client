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
            func.apply(this);
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
    const localDateTime = moment.utc(localUTCDate).local().format(format);

    /* Converting Local (System Date Time Format) to location timezone */
    const timezonedDateTime = momentTimezone.tz(
        localDateTime,
        format,
        timezone
    );

    /* Finally Converting to utc */
    const timezonedUTC = timezonedDateTime.utc().format(format);

    return timezonedUTC;
};
