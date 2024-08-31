import { i18n } from "@/app/_layout";
import CustomButton from "@/components/custom/basic/CustomButton";
import InvoiceListItem from "@/components/custom/business/InvoiceListItem";
import AddInvoiceItem from "@/components/custom/widgets/AddInvoiceItem";
import InvoicePartySelector from "@/components/custom/widgets/InvoicePartySelector";
import { fonts } from "@/constants/fonts";
import { AddPurchaseForm, InvoiceItem } from "@/constants/types";
import { useAppSelector } from "@/store";
import { AddPurchaseFormValidation } from "@/utils/schema_validations";
import { useFormik } from "formik";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { ScrollView, StyleSheet, View, Text, FlatList } from "react-native";

const AddPurchase = () => {

    /* Selected Company */
    const selectedCompany = useAppSelector(
        (state) => state.company.selectedCompany
    );

    /* To store a selected invoice item if any */
    const selectedInvoiceItem = useRef<InvoiceItem>();

    /* Whether add invoice item modal is visible */
    const [isAddInvoiceItemModalVisibile, setIsAddInvoiceItemModalVisible] =
        useState(false);

    /* To toggle add invoice item modal*/
    const toggleAddInvoiceItemModal = useCallback(() => {
        setIsAddInvoiceItemModalVisible((prev) => !prev);
    }, [isAddInvoiceItemModalVisibile]);

    /* Initial Purchase form */
    const initialFormValues: AddPurchaseForm = useMemo(() => {
        return {
            party: undefined,
            items: {},
        };
    }, []);

    /* Form */
    const formik = useFormik({
        initialValues: initialFormValues,
        onSubmit: (values) => {},
        validationSchema: AddPurchaseFormValidation,
    });

    /* On change of invoice item */
    const onInvoiceItemChanged = (item: InvoiceItem) => {
        /* Update items field. value is stores as key value, where key is itemId and value is invoice item */
        if (item && item.item) {
            const temp = formik.values.items;
            temp[item.item?.itemId] = item;
            formik.setFieldValue("items", temp);
        }
    };

    /* On Invoice Item selected */
    const onInvoiceItemSelected = (item: InvoiceItem) => {
        if (item) {
            /* Setting selectedInvoiceItem, and toggling the modal */
            selectedInvoiceItem.current = item;
            toggleAddInvoiceItemModal();
        }
    };

    /* Remove Invoice Item, removing the item from items */
    const removeInvoiceItemHandler = (item: InvoiceItem) => {
        if (item && item.item?.itemId) {
            const temp = formik.values.items;
            delete temp[item.item?.itemId];
            formik.setFieldValue("items", temp);
        }
    };

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

                    <Text style={styles.itemsHeading}>{i18n.t("items")}</Text>

                    <FlatList
                        data={Object.values(formik.values.items)}
                        renderItem={({ item }) => (
                            <InvoiceListItem
                                item={item}
                                removeItem={removeInvoiceItemHandler}
                                onInvoiceItemSelected={onInvoiceItemSelected}
                            />
                        )}
                        keyExtractor={(item) =>
                            item.item?.itemId?.toString() || ""
                        }
                    />

                    <CustomButton
                        text={i18n.t("addItem")}
                        onPress={toggleAddInvoiceItemModal}
                        isSecondaryButton
                    />

                    {isAddInvoiceItemModalVisibile && (
                        <AddInvoiceItem
                            isVisible={isAddInvoiceItemModalVisibile}
                            toggleVisibility={() => {
                                selectedInvoiceItem.current = undefined;
                                toggleAddInvoiceItemModal();
                            }}
                            onInvoiceItemChange={onInvoiceItemChanged}
                            value={selectedInvoiceItem.current}
                        />
                    )}
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
    itemsHeading: {
        fontFamily: fonts.Inter_Bold,
        fontSize: 12,
    },
});
