import { AxiosError, AxiosResponse } from "axios";
import { ApiResponse } from "./api_response";
import { ApiError, ApiErrorResponse } from "./api_error";


/**
 * Accepts a function which returns an axios response of type ApiResponse with responseData of type T(Generic)
 * resolves the functions, in case of an error throws a new ApiError
 * In case of success returns a ApiResponse
 */
export const asyncHandler = async <T>(
    func: () => Promise<AxiosResponse<ApiResponse<T>>>
): Promise<ApiResponse<T>> => {
    return Promise.resolve(func())
        .then((data) => {
            const responseData = data.data;
            return new ApiResponse<T>(
                responseData.statusCode,
                responseData.data,
                responseData.success
            );
        })
        .catch((error: AxiosError<ApiErrorResponse>) => {
            throw new ApiError(error.message, error.response?.data);
        });
};
