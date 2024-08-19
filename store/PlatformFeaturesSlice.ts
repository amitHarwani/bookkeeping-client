import { PlatformFeature } from "@/services/sysadmin/sysadmin_types";
import { createSlice } from "@reduxjs/toolkit";
import { number } from "yup";

interface PlatformFeaturesSliceType {
    platformFeatures: { [featureId: number]: PlatformFeature };
}
const initialState = {
    platformFeatures: {},
};
const PlatformFeaturesSlice = createSlice({
    name: "platformFeaturesSlice",
    initialState,
    reducers: {
        setPlatformFeatures(state, { payload }) {
            state.platformFeatures = payload.platformFeatures;
        },
    },
});

export const { setPlatformFeatures } = PlatformFeaturesSlice.actions;
export default PlatformFeaturesSlice;
