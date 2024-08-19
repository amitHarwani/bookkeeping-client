import { TaxDetail } from "@/services/sysadmin/sysadmin_types";
import { CompanyWithTaxDetails } from "@/services/user/user_types";
import { createSlice } from "@reduxjs/toolkit";

interface CompanySliceStateType {
    selectedCompany?: CompanyWithTaxDetails;
    userACL: {[featureId: number]: boolean};
    taxDetailsOfCountry: { [taxId: string]: TaxDetail };
}
const initialState: CompanySliceStateType = {
    selectedCompany: undefined,
    userACL: {},
    taxDetailsOfCountry: {},
};
const CompanySlice = createSlice({
    name: "companySlice",
    initialState,
    reducers: {
        selectCompany(state, { payload }) {
            state.selectedCompany = payload.company;
        },
        setUserACL(state, { payload }) {
            state.userACL = payload.acl;
        },
        setTaxDetailsOfCountry(state, {payload}) {
            state.taxDetailsOfCountry = payload.taxDetailsOfCountry
        }
    },
});

export const { selectCompany, setUserACL, setTaxDetailsOfCountry } = CompanySlice.actions;
export default CompanySlice;
