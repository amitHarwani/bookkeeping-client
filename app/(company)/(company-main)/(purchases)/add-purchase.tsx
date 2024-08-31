import { ScrollView, StyleSheet, Text, View } from "react-native";
import React, { useMemo } from "react";
import Dropdown from "@/components/custom/basic/Dropdown";
import { i18n } from "@/app/_layout";
import { useFormik } from "formik";
import { AddPurchaseForm } from "@/constants/types";
import { AddPurchaseFormValidation } from "@/utils/schema_validations";
import { useInfiniteQuery } from "@tanstack/react-query";
import { ReactQueryKeys } from "@/constants/reactquerykeys";
import { useAppSelector } from "@/store";
import BillingService from "@/services/billing/billing_service";
import InvoicePartySelector from "@/components/custom/widgets/InvoicePartySelector";

const AddPurchase = () => {
    const selectedCompany = useAppSelector(
        (state) => state.company.selectedCompany
    );

    const initialFormValues: AddPurchaseForm = useMemo(() => {
        return {
            party: undefined,
        };
    }, []);

    const formik = useFormik({
        initialValues: initialFormValues,
        onSubmit: (values) => {
        },
        validationSchema: AddPurchaseFormValidation,
    });

    return (
        <ScrollView style={styles.mainContainer}>
            <View style={styles.container}>
                <View style={styles.formContainer}>
                    <InvoicePartySelector
                        value={formik.values.party}
                        onChange={(party) => {
                            formik.setFieldTouched("party", true);
                            formik.setFieldValue("party", party);
                        }}
                        errorMessage={
                            formik.touched.party && formik.errors.party
                                ? formik.errors.party
                                : null
                        }
                    />
                </View>
            </View>
        </ScrollView>
    );
};

export default AddPurchase;

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    container: {
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 12,
    },
    formContainer: {
        rowGap: 16,
    },
});
