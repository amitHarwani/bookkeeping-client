import { configureStore } from "@reduxjs/toolkit";
import AuthSlice from "./AuthSlice";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";


const store = configureStore({
    reducer: {
        auth: AuthSlice.reducer
    }
})

/* useAppSelector and useAppDispatch for typescript */
export type ReduxRootState = ReturnType<typeof store.getState>
export const useAppSelector: TypedUseSelectorHook<ReduxRootState> = useSelector;

export type ReduxDispatch = typeof store.dispatch;
export const useAppDispatch = useDispatch<ReduxDispatch>

export default store;