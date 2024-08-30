import { ApiError } from "@/services/api_error";

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
