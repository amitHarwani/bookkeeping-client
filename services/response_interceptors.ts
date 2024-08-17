import axios from "axios";
import UserService from "./user/user_service";
import { ApiError } from "./api_error";
import store from "@/store";
import { logIn, logOut } from "@/store/AuthSlice";
import {
    deleteValueFromSecureStore,
    setValueInSecureStore,
} from "@/utils/securestore";
import { SecureStoreKeys } from "@/constants/securestorekeys";
import { Href, router } from "expo-router";
import { AppRoutes } from "@/constants/routes";

axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        /* Original request */
        const originalRequest = error.config;

        /* If response status is 401, and this is not a retry of the original request, and if the request url is not
        login, refreshToken or logout */
        if (
            error.response.status === 401 &&
            !originalRequest._retry &&
            !error.config.url.includes(UserService.loginPath) &&
            !error.config.url.includes(UserService.refreshTokenPath) &&
            !error.config.url.includes(UserService.logoutPath)
        ) {
            /* Set retry to true for next request, to avoid infinite loop */
            originalRequest._retry = true;

            try {
                /* User details from redux store */
                const userDetails = store.getState().auth.user;

                /* Refresh token from user details */
                const refreshToken = userDetails?.refreshToken;

                /* Refresh token not found */
                if (!refreshToken) {
                    /* Log user out by throwing error*/
                    throw Error();
                }

                /* Calling refreshToken api */
                const refreshTokenResponse = await UserService.refreshToken(
                    refreshToken as string
                );

                /* New Access token and user details from refreshToken api */
                const newAccessToken = refreshTokenResponse.data.accessToken;
                const newUserDetails = refreshTokenResponse.data.user;

                /* Update the redux store and secure store */
                store.dispatch(
                    logIn({ user: newUserDetails, accessToken: newAccessToken })
                );
                setValueInSecureStore(
                    SecureStoreKeys.accessToken,
                    newAccessToken
                );
                setValueInSecureStore(
                    SecureStoreKeys.userDetails,
                    JSON.stringify(newUserDetails)
                );

                /* Retry the original request */
                return axios(originalRequest);
            } catch (refreshTokenError) {

                /* Log user out from redux store, and clear secure store */
                store.dispatch(logOut());
                deleteValueFromSecureStore(SecureStoreKeys.accessToken);
                deleteValueFromSecureStore(SecureStoreKeys.userDetails);

                /* Route to login screen */
                router.dismissAll();
                router.replace(`${AppRoutes.login}` as Href);
                return Promise.reject(error);
            }
        }
        
        return Promise.reject(error);
    }
);
