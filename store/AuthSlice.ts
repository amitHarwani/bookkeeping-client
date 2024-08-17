import { User } from "@/services/user/user_types";
import { createSlice } from "@reduxjs/toolkit";

interface AuthSliceStateType {
    isLoggedIn: boolean;
    user?: User;
    accessToken?: string;
}
const initialState: AuthSliceStateType = {
    isLoggedIn: false,
    user: undefined,
    accessToken: "",
};
const AuthSlice = createSlice({
    name: "authSlice",
    initialState,
    reducers: {
        logIn(state, { payload }) {
            state.isLoggedIn = true;
            state.user = payload.user;
            state.accessToken = payload.accessToken;
        },
        logOut(state) {
            return { ...initialState };
        },
    },
});

export const { logIn, logOut } = AuthSlice.actions;
export default AuthSlice;
