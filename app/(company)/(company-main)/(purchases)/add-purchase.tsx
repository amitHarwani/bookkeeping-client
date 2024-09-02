import { i18n } from "@/app/_layout";
import CustomButton from "@/components/custom/basic/CustomButton";
import ErrorMessage from "@/components/custom/basic/ErrorMessage";
import Input from "@/components/custom/basic/Input";
import InvoiceListItem from "@/components/custom/business/InvoiceListItem";
import AddInvoiceItem from "@/components/custom/widgets/AddInvoiceItem";
import InvoicePartySelector from "@/components/custom/widgets/InvoicePartySelector";
import { fonts } from "@/constants/fonts";
import { AddPurchaseForm, InvoiceItem } from "@/constants/types";
import { useAppSelector } from "@/store";
import { commonStyles } from "@/utils/common_styles";
import { capitalizeText } from "@/utils/common_utils";
import { AddPurchaseFormValidation } from "@/utils/schema_validations";
import { getInvoiceTaxDetails } from "@/utils/tax_helper";
import { Formik, useFormik } from "formik";
import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { ScrollView, StyleSheet, View, Text, FlatList } from "react-native";

const AddPurchase = () => {
    const companyState = useAppSelector((state) => state.company);

    /* Decimal points to round to when showing the value */
    const decimalPoints = useMemo(() => {
        return companyState.selectedCompany?.decimalRoundTo;
    }, [companyState]);

    /* Selected Company */
    const selectedCompany = useAppSelector(
        (state) => state.company.selectedCompany
    );

    const { invoiceTaxPercent, invoiceTaxName } = getInvoiceTaxDetails();

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
            invoiceNumber: undefined,
            items: {},
            discount: "0",
            subtotal: "0",
            tax: "0",
            totalAfterDiscount: "0",
            totalAfterTax: "0",
        };
    }, []);

    const totalFields = useMemo(
        () => [
            "subtotal",
            "discount",
            "totalAfterDiscount",
            "tax",
            "totalAfterTax",
        ],
        []
    );

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
            formik.setFieldTouched("items", true);
            const temp = {...formik.values.items};
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
            const temp = {...formik.values.items};
            delete temp[item.item?.itemId];
            formik.setFieldValue("items", temp);
        }
    };

    useEffect(() => {
        console.log("In Use Effect formik")
        let subtotal = 0;
        let discount = 0;
        let totalAfterDiscount = 0;
        let tax = 0;
        let totalAfterTax = 0;

        if (formik.values.discount && !isNaN(Number(formik.values.discount))) {
            discount = Number(formik.values.discount);
        }

        Object.values(formik.values.items).forEach((item) => {
            subtotal += Number(item.subtotal);
        });

        totalAfterDiscount = subtotal - discount;
        tax = totalAfterDiscount * (invoiceTaxPercent / 100);

        totalAfterTax = subtotal + tax;

        formik.setFieldValue("subtotal", subtotal.toFixed(decimalPoints));
        formik.setFieldValue(
            "totalAfterDiscount",
            totalAfterDiscount.toFixed(decimalPoints)
        );
        formik.setFieldValue("tax", tax.toFixed(decimalPoints));
        formik.setFieldValue(
            "totalAfterTax",
            totalAfterTax.toFixed(decimalPoints)
        );
    }, [formik.values.items, formik.values.discount]);

    return (
        <View style={styles.container}>
            <View style={styles.formContainer}>
                <Input
                    label={i18n.t("invoiceNumber")}
                    placeholder={capitalizeText(i18n.t("enterInvoiceNumber"))}
                    value={formik.values.invoiceNumber?.toString() || ""}
                    onChangeText={formik.handleChange("invoiceNumber")}
                    onBlur={formik.handleBlur("invoiceNumber")}
                    errorMessage={
                        formik.touched.invoiceNumber &&
                        formik.errors.invoiceNumber
                            ? formik.errors.invoiceNumber
                            : null
                    }
                    keyboardType="number-pad"
                />
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

                <Text style={[commonStyles.textSmallBold]}>
                    {i18n.t("items")}
                </Text>

                {formik.touched.items && formik.errors.items && (
                    <ErrorMessage message={formik.errors.items as string} />
                )}

                <FlatList
                    data={Object.values(formik.values.items)}
                    renderItem={({ item }) => (
                        <InvoiceListItem
                            item={item}
                            removeItem={removeInvoiceItemHandler}
                            onInvoiceItemSelected={onInvoiceItemSelected}
                        />
                    )}
                    keyExtractor={(item) => item.item?.itemId?.toString() || ""}
                />

                <ScrollView>
                    <View style={styles.formContainer}>
                        <CustomButton
                            text={i18n.t("addItem")}
                            onPress={toggleAddInvoiceItemModal}
                            isSecondaryButton
                        />

                        <Input
                            label={i18n.t("discount")}
                            placeholder={capitalizeText(
                                i18n.t("enterDiscountAmount")
                            )}
                            value={formik.values.discount.toString() || ""}
                            onChangeText={formik.handleChange("discount")}
                            onBlur={formik.handleBlur("discount")}
                            errorMessage={
                                formik.touched.discount &&
                                formik.errors.discount
                                    ? formik.errors.discount
                                    : null
                            }
                            keyboardType="number-pad"
                        />

                        {totalFields.map((field) => (
                            <View style={styles.rowContainer}>
                                <Text
                                    style={[
                                        commonStyles.textSmallBold,
                                        field !== "tax" && commonStyles.capitalize,
                                    ]}
                                >
                                    {field === "tax" ? `${invoiceTaxName.toUpperCase()} (${invoiceTaxPercent}%)` :i18n.t(field)}
                                </Text>
                                <Text
                                    style={[
                                        commonStyles.textMediumXLBold,
                                        commonStyles.textGray,
                                    ]}
                                >
                                    {formik.values?.[
                                        field as keyof AddPurchaseForm
                                    ]?.toString()}
                                </Text>
                            </View>
                        ))}
                    </View>
                </ScrollView>

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
    );
};

export default AddPurchase;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 12,
    },
    formContainer: {
        rowGap: 16,
    },
    rowContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
});
