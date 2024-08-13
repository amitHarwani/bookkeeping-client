import { AppRoutes } from "@/constants/routes";
import { SecureStoreKeys } from "@/constants/securestorekeys";
import { useAppDispatch } from "@/store";
import { logIn } from "@/store/AuthSlice";
import { getValueFromSecureStore } from "@/utils/securestore";
import { Href, Redirect, router } from "expo-router";
import { deleteItemAsync } from "expo-secure-store";
import { useMemo } from "react";

const App = () => {
    const dispatch = useAppDispatch();

    /* If accessToken exists in store, user is logged in */
    const isUserLoggedIn = useMemo(() => {
        if (getValueFromSecureStore(SecureStoreKeys.accessToken)) {
            return true;
        } else {
            return false;
        }
    }, []);

    /* If user is logged in */
    if (isUserLoggedIn) {
        /* Access Token and user details from secure store (Shared Preferences) */
        const accessToken = getValueFromSecureStore(
            SecureStoreKeys.accessToken
        );
        const userDetails = JSON.parse(
            getValueFromSecureStore(SecureStoreKeys.userDetails) as string
        );
        // const resetFunc = async () => {
        //   await deleteItemAsync(SecureStoreKeys.accessToken);
        //   await deleteItemAsync(SecureStoreKeys.userDetails);
        // }
        // resetFunc();

        /* Updating redux store */
        dispatch(logIn({ user: userDetails, accessToken: accessToken }));

        /* Go to dashboard */
        return <Redirect href={`${AppRoutes.dashboard}` as Href} />;
    } else {
        /* Move to log in */
        return <Redirect href={`${AppRoutes.login}` as Href} />;
    }
};

export default App;
