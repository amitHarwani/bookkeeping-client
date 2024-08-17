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
