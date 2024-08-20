import { Country, TaxDetail } from "@/services/sysadmin/sysadmin_types";
import { CompanyWithTaxDetails } from "@/services/user/user_types";
import { createSlice } from "@reduxjs/toolkit";

interface CompanySliceStateType {
    selectedCompany?: CompanyWithTaxDetails;
    userACL: {[featureId: number]: boolean};
    taxDetailsOfCountry: { [taxId: string]: TaxDetail };
    country?: Country
}
const initialState: CompanySliceStateType = {
    selectedCompany: undefined,
    userACL: {},
    taxDetailsOfCountry: {},
    country: undefined
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
        },
        setCountryDetails(state, {payload}) {
            state.country = payload.country
        }
    },
});

export const { selectCompany, setUserACL, setTaxDetailsOfCountry, setCountryDetails } = CompanySlice.actions;
export default CompanySlice;
