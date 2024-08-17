import axios from "axios";
import store from "@/store";

axios.interceptors.request.use((config) => {
    /* if access token exists in redux store (User is logged in) 
    then add authorization header to request 
    */
    const accessToken = store.getState().auth.accessToken;
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
});
