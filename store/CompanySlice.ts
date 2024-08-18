import { CompanyWithTaxDetails } from "@/services/user/user_types";
import { createSlice } from "@reduxjs/toolkit";

interface CompanySliceStateType {
    selectedCompany?: CompanyWithTaxDetails;
    userACL: number[]
}
const initialState: CompanySliceStateType = {
    selectedCompany: undefined,
    userACL: []
};
const CompanySlice = createSlice({
    name: "companySlice",
    initialState,
    reducers: {
        selectCompany(state, { payload }) {
            state.selectedCompany = payload.company;
        },
        setUserACL(state, {payload}){
            state.userACL = payload.acl
        }
    },
});

export const { selectCompany, setUserACL } = CompanySlice.actions;
export default CompanySlice;
